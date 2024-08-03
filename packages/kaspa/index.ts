import {
  type Address,
  default as kaspa,
  Encoding,
  Mnemonic,
  NetworkId,
  PrivateKey,
  Resolver,
  RpcClient,
  UtxoContext,
  UtxoProcessor,
  type UtxoProcessorNotificationCallback,
} from "@repo/kaspa-wasm";

export {
  type Address,
  type UtxoProcessorNotificationCallback,
  type UtxoProcessorEventType,
  TransactionRecordNotification,
  type IBalanceEvent,
  RpcClient,
} from "@repo/kaspa-wasm";

const WORD_COUNT = 12;
let NETWORK_TYPE: string;

export async function initKaspa(networkType = "mainnet") {
  NETWORK_TYPE = networkType;
  await kaspa();
}

export function generatePrivateKey(password: string, seedPhrase?: string) {
  const mnemonic = seedPhrase
    ? new Mnemonic(seedPhrase)
    : Mnemonic.random(WORD_COUNT);
  const seed = mnemonic.toSeed(password);
  // TODO: why do I need 64 hex instead of generated 128? wtf
  const privateKey = new PrivateKey(seed.slice(0, 64));
  return {privateKey, seedPhrase: mnemonic.phrase};
}

export function getAddressFromPrivateKey(privateKey: PrivateKey) {
  return privateKey.toKeypair().toAddress(NETWORK_TYPE);
}

export async function initRpcClient(
  address: Address,
  callback: UtxoProcessorNotificationCallback
) {
  // console.log(NETWORK_TYPE.toString());
  const networkId = new NetworkId(NETWORK_TYPE);
  // 1) Initialize RPC
  const rpc = new RpcClient({
    resolver: new Resolver(),
    encoding: Encoding.Borsh,
    networkId,
  });
  // 2) Create UtxoProcessor, passing RPC to it
  const processor = new UtxoProcessor({rpc, networkId});
  // 3) Register a listener with the UtxoProcessor::events
  processor.addEventListener(callback);
  await processor.start();
  // 4) Create one of more UtxoContext, passing UtxoProcessor to it
  // you can create UtxoContext objects as needed to monitor different
  // address sets.
  const context = new UtxoContext({processor});
  // 5) Once the environment is setup, connect to RPC
  console.log(`Connecting to ${NETWORK_TYPE}`);
  await rpc.connect();
  // fetch initial info
  // await rpc.getServerInfo();
  // subscribe to utxos changed
  await rpc.subscribeUtxosChanged([address]);
  // if (!isSynced) {
  //   console.error("Please wait for the node to sync");
  //   rpc.disconnect();
  //   return;
  // }
  // rpc.
  // 6) Register the address list with the UtxoContext
  await context.trackAddresses([address], undefined);
  return rpc;
}
