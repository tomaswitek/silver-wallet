import { useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import { Wallet } from "./Wallet";
import { NETWORK_TYPE, SEED_PHRASE_KEY } from "./constants";

function App() {
  // TODO: implement password input
  const [password] = useState<string>("password");
  const [seedPhrase] = useLocalStorageState<string | undefined>(
    SEED_PHRASE_KEY,
  );

  return (
    <>
      <h1>Silver Wallet </h1>
      <Wallet
        password={password}
        seedPhrase={seedPhrase}
        networkType={NETWORK_TYPE}
      />
    </>
  );
}

export default App;
