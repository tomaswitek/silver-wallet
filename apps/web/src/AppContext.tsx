import React, { ReactNode, useContext, useState } from "react";
import { EncryptedWallet } from "./types.ts";
import useLocalStorageState from "use-local-storage-state";
import { WALLETS_KEY } from "./constants.ts";
import { KaspaClient } from "@repo/kaspa";

interface AppContextState {
  wallets: EncryptedWallet[];
  addWallet: (wallet: EncryptedWallet) => void;
  currentWallet: KaspaClient | undefined;
  setCurrentWallet: (wallet: KaspaClient) => void;
}

interface AppContextProps {
  children: ReactNode;
}

const AppContext = React.createContext<AppContextState | undefined>(undefined);

export const AppContextProvider: React.FC<AppContextProps> = ({ children }) => {
  const [wallets, setWallets] = useLocalStorageState<EncryptedWallet[]>(
    WALLETS_KEY,
    {
      defaultValue: [],
    },
  );
  const [currentWallet, setCurrentWallet] = useState<KaspaClient>();

  const addWallet = (wallet: EncryptedWallet) => {
    setWallets([...wallets, wallet]);
  };
  const doSetCurrentWallet = (wallet: KaspaClient) => {
    setCurrentWallet(wallet);
  };

  return (
    <AppContext.Provider
      value={{
        wallets,
        addWallet,
        currentWallet,
        setCurrentWallet: doSetCurrentWallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
