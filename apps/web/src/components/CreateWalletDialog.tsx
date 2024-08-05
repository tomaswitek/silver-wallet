import React from "react";

import { KaspaClient } from "@repo/kaspa";
import { useAppContext } from "../AppContext.tsx";
import NewWalletForm, { NewWalletFormResult } from "./NewWalletForm.tsx";
import { NETWORK_TYPE } from "../constants.ts";
import { encryptMnemonic } from "../cryptoUtils.ts";
import AppModal from "./AppModal.tsx";

export const CreateWalletDialog: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { addWallet, setCurrentWallet, wallets } = useAppContext();

  async function handleCreateWallet({ label, password }: NewWalletFormResult) {
    if (!password || !label) {
      return;
    }
    const newWallet = new KaspaClient({
      networkType: NETWORK_TYPE,
      password,
      label,
    });
    await newWallet.connect((e) => {
      if (e.event === "connect") {
        console.log("Connected");
      }
    });
    const { seedPhrase } = newWallet.getPrivateKey(password);
    const encryptedMnemonic = await encryptMnemonic(seedPhrase, password);
    addWallet({ label, mnemonic: encryptedMnemonic });
    setCurrentWallet(newWallet);
  }

  return (
    <>
      <button onClick={() => setDialogOpen(true)}>New wallet</button>
      <AppModal
        title="Create New Wallet"
        isOpen={dialogOpen}
        close={() => setDialogOpen(false)}
      >
        <NewWalletForm
          wallets={wallets}
          onSubmit={handleCreateWallet}
          onCancel={() => setDialogOpen(false)}
        />
      </AppModal>
    </>
  );
};
