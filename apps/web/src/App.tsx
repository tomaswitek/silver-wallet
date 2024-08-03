import { useEffect, useState } from "react";
import "./App.css";
import {
  Address,
  generatePrivateKey,
  getAddressFromPrivateKey,
  IBalanceEvent,
  initKaspa,
  initRpcClient,
  RpcClient,
  UtxoProcessorEventType,
  UtxoProcessorNotificationCallback,
} from "@repo/kaspa";
import useLocalStorageState from "use-local-storage-state";
import { Amount } from "./Amount";
const NETWORK_TYPE = import.meta.env.VITE_NETWORK_TYPE;

enum NodeStatus {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
}

function App() {
  const [address, setAddress] = useState<Address | undefined>();
  // TODO: implement password input
  const [password] = useState<string>("password");
  const [seedPhrase, setSeedPhrase] = useLocalStorageState<string | undefined>(
    "seedPhrase",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [balance, setBalance] = useState<bigint | undefined>();
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>(
    NodeStatus.Disconnected,
  );
  const [rpcClient, setRpcClient] = useState<RpcClient | undefined>();

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
        console.log(data);
        break;
      }
      case "connect": {
        setNodeStatus(NodeStatus.Connected);
        break;
      }
      case "daa-score-change": {
        // do nothing, this event is triggered a lot
        break;
      }
      default: {
        console.log(eventType, e.data);
      }
    }
  };

  useEffect(() => {
    async function init() {
      if (address) {
        setNodeStatus(NodeStatus.Connecting);
        const rpc = await initRpcClient(address, handleEvent);
        setRpcClient(rpc);
      } else {
        await initKaspa(NETWORK_TYPE);
        await generateAddress();
      }
    }

    init();
    return () => {
      if (rpcClient) {
        rpcClient.disconnect();
      }
    };
  }, [address]);

  useEffect(() => {
    if (rpcClient) {
      rpcClient.addEventListener("utxos-changed", async () => {
        const response = await rpcClient.getBalanceByAddress({
          address: address!.toString(),
        });
        setBalance(response.balance);
      });
    }
  }, [address, rpcClient]);

  return (
    <>
      <h1>Silver Wallet </h1>
      <div className="card">
        {error ? <p style={{ color: "red" }}>{error}</p> : null}
        <h2>
          Balance: <Amount value={balance} />
        </h2>
        <p>
          <strong>Address:</strong>
          {loading ? "Loading..." : address?.toString()}
        </p>
        <p>
          <strong>Seed Phrase:</strong> {loading ? "Loading..." : seedPhrase}
        </p>
        <p>
          <strong>Node Status:</strong> {nodeStatus}
        </p>
      </div>
      <button onClick={regenerateAddress}>Generate New Address</button>
    </>
  );
}

export default App;
