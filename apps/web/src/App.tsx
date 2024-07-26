import {useState, useEffect} from "react";
import "./App.css";
import {
  initKaspa,
  generatePrivateKey,
  getAddressFromPrivateKey,
} from "@repo/kaspa";
import useLocalStorageState from "use-local-storage-state";

function App() {
  const [address, setAddress] = useLocalStorageState<string | null>("address");
  const [seedPhrase, setSeedPhrase] = useLocalStorageState<string | null>(
    "seedPhrase"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAddress = async () => {
    try {
      setLoading(true);
      const key = await generatePrivateKey();
      const address = getAddressFromPrivateKey(key.privateKey);
      setSeedPhrase(key.seedPhrase);
      setAddress(address.toString());
    } catch (err) {
      setError("Error generating address");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      await initKaspa();
      if (!address) {
        await generateAddress();
      }
    }
    init();
  }, [address]);

  return (
    <>
      <h1>Silver Wallet</h1>
      <div className="card">
        {error ? <p style={{color: "red"}}>{error}</p> : null}
        <p>Address: {loading ? "Loading..." : address}</p>
        <p>Seed Phrase: {loading ? "Loading..." : seedPhrase}</p>
      </div>
      <button onClick={generateAddress}>Generate Address</button>
    </>
  );
}

export default App;
