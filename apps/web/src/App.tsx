import {useState, useEffect} from "react";
import "./App.css";
import {
  initKaspa,
  generatePrivateKey,
  getAddressFromPrivateKey,
  Address,
  initRpcClient,
  RpcClientResponse,
  UtxoProcessorNotificationCallback,
  UtxoProcessorEventType,
  IBalanceEvent,
} from "@repo/kaspa";
import useLocalStorageState from "use-local-storage-state";

function App() {
  const [address, setAddress] = useState<Address | undefined>();
  // TODO: implement password input
  const [password] = useState<string>("password");
  const [seedPhrase, setSeedPhrase] = useLocalStorageState<string | undefined>(
    "seedPhrase"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [balance, setBalance] = useState<bigint | undefined>();

  const generateAddress = async () => {
    try {
      setLoading(true);
      const key = await generatePrivateKey(password, seedPhrase);
      const address = getAddressFromPrivateKey(key.privateKey);
      setSeedPhrase(key.seedPhrase);
      setAddress(address);
    } catch (err) {
      setError("Error generating address");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const regenerateAddress = async () => {
    setSeedPhrase(undefined);
    setAddress(undefined);
    await generateAddress();
  };

  const handleEvent: UtxoProcessorNotificationCallback = (e) => {
    // TODO: there seems to be a mismatch in tpye defs in kaspa-wasm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventType = (e as any).type as UtxoProcessorEventType;
    switch (eventType) {
      // TODO: it is only exported as type and not as enum
      // case UtxoProcessorEventType.Balance:
      case "balance": {
        const data = e.data as IBalanceEvent;
        setBalance(data.balance?.mature);
        break;
      }
      default: {
        console.log(eventType, e.data);
      }
    }
  };

  useEffect(() => {
    let rpcClient: RpcClientResponse | undefined;
    async function init() {
      if (address) {
        rpcClient = await initRpcClient(address, handleEvent);
      } else {
        await initKaspa();
        await generateAddress();
      }
    }
    init();
    return () => {
      if (rpcClient) {
        rpcClient.processor.stop();
        rpcClient.rpc.disconnect();
      }
    };
  }, [address]);

  return (
    <>
      <h1>Silver Wallet</h1>
      <div className="card">
        {error ? <p style={{color: "red"}}>{error}</p> : null}
        <h2>Balance: {balance ? balance.toString() : "0"}</h2>
        <p>
          <strong>Address:</strong>
          {loading ? "Loading..." : address?.toString()}
        </p>
        <p>
          <strong>Seed Phrase:</strong> {loading ? "Loading..." : seedPhrase}
        </p>
      </div>
      <button onClick={regenerateAddress}>Generate New Address</button>
    </>
  );
}

export default App;
