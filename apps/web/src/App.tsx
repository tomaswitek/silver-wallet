import React from "react";
import "./App.css";
import { useAppContext } from "./AppContext.tsx";

import { NETWORK_TYPE } from "./constants.ts";
import Wallet from "./Wallet.tsx";
import { LocalWallets } from "./components/LocalWallets.tsx";
import { CreateWalletDialog } from "./components/CreateWalletDialog.tsx";
import { UnlockWalletDialog } from "./components/UnlockWalletDialog.tsx";

function App() {
  const { currentWallet } = useAppContext();
  const [selectedWalletLabel, setSelectedWalletLabel] =
    React.useState<string>("");

  return (
    <div className="flex-container border">
      <h1>Silver Wallet </h1>
      <span>
        <code>{NETWORK_TYPE}</code>
      </span>
      {!currentWallet ? (
        <>
          <LocalWallets
            selectedWalletLabel={selectedWalletLabel}
            setSelectedWalletLabel={setSelectedWalletLabel}
          />
          <div className="flex-row">
            <CreateWalletDialog />
            <UnlockWalletDialog selectedWalletLabel={selectedWalletLabel} />
          </div>
        </>
      ) : (
        <Wallet client={currentWallet} />
      )}
    </div>
  );
}

export default App;
