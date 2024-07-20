import {useState, useEffect} from "react";
import "./App.css";
import {initWasm, createWallet, Address} from "./wallet";

function App() {
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initWasm();
        setLoading(true);
        const wallet = await createWallet();
        setAddress(wallet.address);
        console.log(address);
      } catch (err) {
        setError(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return (
    <>
      <h1>Silver Wallet</h1>
      <div className="card">
        {error ? <p style={{color: "red"}}>{error}</p> : null}
        {loading ? <p>Loading...</p> : <p>{address}</p>}
      </div>
    </>
  );
}

export default App;
