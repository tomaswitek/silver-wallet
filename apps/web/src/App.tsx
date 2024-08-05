import React from "react";
import "./App.css";
import { useAppContext } from "./AppContext.tsx";

import { NETWORK_TYPE } from "./constants.ts";
import Wallet from "./Wallet.tsx";
import { LocalWallets } from "./components/LocalWallets.tsx";
import { CreateWalletDialog } from "./components/CreateWalletDialog.tsx";
import { UnlockWalletDialog } from "./components/UnlockWalletDialog.tsx";
import { Header } from "./components/Header.tsx";

function App() {
  const { currentWallet } = useAppContext();
  const [selectedWalletLabel, setSelectedWalletLabel] =
    React.useState<string>("");

  return (
    <>
      <Header />
      <main className="main">
        <div className="flex-container">
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
      </main>
    </>
  );
}

export default App;
