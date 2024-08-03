import {
  default as kaspa,
  Encoding,
  Mnemonic,
  NetworkId,
  PrivateKey,
  Resolver,
  RpcClient,
  UtxoContext,
  UtxoProcessor,
  Address,
  kaspaToSompi,
  createTransactions,
  type UtxoProcessorNotificationCallback,
} from "@repo/kaspa-wasm";

const WORD_COUNT = 12;

export class KaspaClient {
  private networkType: string;
  private password: string;

  public seedPhrase?: string;
  public privateKey?: PrivateKey;
  public rpc?: RpcClient;
  public connected = false;

  constructor(networkType = "mainnet", password: string, seedPhrase?: string) {
    console.log("constructor");
    this.networkType = networkType;
    this.password = password;
    if (seedPhrase) {
      this.seedPhrase = seedPhrase;
    }
  }

  async connect(callback: UtxoProcessorNotificationCallback) {
    // skip if initialized
    if (this.connected) {
      return;
    }
    this.connected = true;
    // load wasm files
    await kaspa();
    // generate private key first
    this.generatePrivateKey(this.password, this.seedPhrase);

    const networkId = new NetworkId(this.networkType);
    // 1) Initialize RPC
    const rpc = new RpcClient({
      resolver: new Resolver(),
      encoding: Encoding.Borsh,
      networkId,
    });
    // 2) Create UtxoProcessor, passing RPC to it
    const processor = new UtxoProcessor({ rpc, networkId });
    // 3) Register a listener with the UtxoProcessor::events
    processor.addEventListener(callback);
    await processor.start();
    // 4) Create one of more UtxoContext, passing UtxoProcessor to it
    // you can create UtxoContext objects as needed to monitor different
    // address sets.
    const context = new UtxoContext({ processor });
    // 5) Once the environment is setup, connect to RPC
    console.log(`Connecting to ${this.networkType}`);
    await rpc.connect();
    // subscribe to utxos changed
    const address = this.getAddress();
    if (address) {
      await rpc.subscribeUtxosChanged([address]);
      // 6) Register the address list with the UtxoContext
      await context.trackAddresses([address], undefined);
    }
    this.rpc = rpc;
    return rpc;
  }

  async sendTransaction(address: string, amount: string) {
    console.log(`Sending transaction to ${address} for ${amount} KSP`);
    const sourceAddress = this.getAddress();
    const destinationAddress = new Address(address);
    if (!this.rpc || !sourceAddress || !destinationAddress) {
      throw new Error("RPC, source and destination address are required");
    }
    if (!this.privateKey) {
      throw new Error("Private key is required");
    }
    const { entries } = await this.rpc.getUtxosByAddresses([sourceAddress]);
    if (!entries.length) {
      throw new Error("No UTXOs found for source address");
    }
    const sortedEntries = entries.sort((a, b) =>
      a.amount > b.amount ? 1 : -1,
    );
    const amountInSompi = kaspaToSompi(amount);
    if (!amountInSompi) {
      throw new Error("Amount is required");
    }
    const response = await createTransactions({
      entries: sortedEntries,
      outputs: [{ address: destinationAddress, amount: amountInSompi }],
      priorityFee: 0n,
      changeAddress: sourceAddress,
      networkId: new NetworkId(this.networkType),
    });

    console.log("response", response);
    for (const pending of response.transactions) {
      console.log("Pending transaction:", pending);
      console.log("Signing tx with secret key:", this.privateKey.toString());
      await pending.sign([this.privateKey]);
      console.log("Submitting pending tx to RPC ...");
      const txid = await pending.submit(this.rpc);
      console.log("Node responded with txid:", txid);
    }

    return response;
  }

  disconnect() {
    this.rpc?.disconnect();
  }

  generatePrivateKey(password: string, seedPhrase?: string) {
    const mnemonic = seedPhrase
      ? new Mnemonic(seedPhrase)
      : Mnemonic.random(WORD_COUNT);
    const seed = mnemonic.toSeed(password);
    // TODO: why do I need 64 hex instead of generated 128? wtf
    const privateKey = new PrivateKey(seed.slice(0, 64));
    this.privateKey = privateKey;
    this.seedPhrase = mnemonic.phrase;
    return { privateKey, seedPhrase: mnemonic.phrase };
  }

  async generateNewPrivateKey() {
    const oldAddress = this.getAddress();
    if (oldAddress) {
      await this.rpc?.unsubscribeUtxosChanged([oldAddress]);
    }
    const key = this.generatePrivateKey(this.password);
    const newAddress = this.getAddress();
    if (newAddress) {
      await this.rpc?.subscribeUtxosChanged([newAddress]);
    }
    return key;
  }

  getAddress() {
    return this.privateKey?.toKeypair().toAddress(this.networkType);
  }
}
