import { useEffect, useState, useMemo } from "react";
import "./App.css";
import {
  Address,
  IBalanceEvent,
  UtxoProcessorEventType,
  UtxoProcessorNotificationCallback,
  KaspaClient,
} from "@repo/kaspa";
import useLocalStorageState from "use-local-storage-state";
import { Amount } from "./Amount";
import { CreateTransactionForm } from "./CreateTransactionForm";
import { SEED_PHRASE_KEY } from "./constants";

enum NodeStatus {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
}

interface WalletProps {
  networkType: string;
  password: string;
  seedPhrase?: string;
}

export function Wallet(props: WalletProps) {
  const { networkType, password, seedPhrase } = props;
  const client = useMemo(
    () => new KaspaClient(networkType, password, seedPhrase),
    [password, seedPhrase, networkType],
  );
  const [address, setAddress] = useState<Address | undefined>();
  const [, setSeedPhrase] = useLocalStorageState<string | undefined>(
    SEED_PHRASE_KEY,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [balance, setBalance] = useState<bigint | undefined>();
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>(
    NodeStatus.Disconnected,
  );

  const regenerateAddress = async () => {
    setLoading(true);
    try {
      const key = await client.generateNewPrivateKey();
      setSeedPhrase(key.seedPhrase);
      setAddress(client.getAddress());
    } catch (err) {
      setError("Error generating new address");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      try {
        setLoading(true);
        await client.connect(handleEvent);
        setAddress(client.getAddress());
        setSeedPhrase(client.seedPhrase);
      } catch (err) {
        setError("Error connecting to node");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
    return () => {
      client.disconnect();
    };
  }, []);

  useEffect(() => {
    if (client.rpc) {
      client.rpc.addEventListener("utxos-changed", async (data) => {
        console.log("utxos-changed", data);
        const response = await client.rpc!.getBalanceByAddress({
          address: client.getAddress()!.toString(),
        });
        setBalance(response.balance);
      });
    }
  }, [address, client]);

  return (
    <>
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
        {nodeStatus === NodeStatus.Connected && (
          <CreateTransactionForm client={client} />
        )}
      </div>
      <button onClick={regenerateAddress}>Generate New Address</button>
    </>
  );
}

export default Wallet;
