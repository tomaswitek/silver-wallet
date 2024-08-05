import { useEffect, useState } from "react";
import "./App.css";
import {
  Address,
  IBalanceEvent,
  KaspaClient,
  UtxoProcessorEventType,
  UtxoProcessorNotificationCallback,
} from "@repo/kaspa";
import { Amount } from "./Amount";
import { CreateTransactionForm } from "./CreateTransactionForm";

enum NodeStatus {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
}

interface WalletProps {
  client: KaspaClient;
}

export function Wallet({ client }: WalletProps) {
  const [address, setAddress] = useState<Address | undefined>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [balance, setBalance] = useState<bigint | undefined>();
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>(
    NodeStatus.Disconnected,
  );
  const [connected, setConnected] = useState(false);

  const regenerateAddress = async () => {
    setLoading(true);
    try {
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
        setConnected(true);
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
  }, [client]);

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

  if (!connected) {
    return <p>Connecting...</p>;
  }

  return (
    <>
      <div className="card">
        {error ? <p style={{ color: "red" }}>{error}</p> : null}
        <h2>
          Balance: <Amount value={balance} />
        </h2>
        <p>
          <strong>Label:</strong> {client.label}
        </p>
        <p>
          <strong>Address:</strong>
          {loading ? "Loading..." : address?.toString()}
        </p>
        <p>
          <strong>Seed Phrase:</strong>{" "}
          {loading ? "Loading..." : client.seedPhrase}
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
