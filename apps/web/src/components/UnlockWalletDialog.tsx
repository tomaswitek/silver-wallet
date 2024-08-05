import React from "react";

import { KaspaClient } from "@repo/kaspa";
import { useAppContext } from "../AppContext.tsx";
import { decryptMnemonic } from "../cryptoUtils.ts";
import { NETWORK_TYPE } from "../constants.ts";
import AppModal from "./AppModal.tsx";
import PasswordForm from "./PasswordForm.tsx";

export const UnlockWalletDialog: React.FC<{ selectedWalletLabel: string }> = ({
  selectedWalletLabel,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { setCurrentWallet, wallets } = useAppContext();

  const handleUnlockWallet = async (password: string) => {
    const encryptedWallet = wallets.find(
      (w) => w.label === selectedWalletLabel,
    );
    if (!encryptedWallet) {
      return;
      //todo: handle error
    }
    const decryptedMnemonic = await decryptMnemonic(
      encryptedWallet.mnemonic,
      password,
    );
    const wallet = new KaspaClient({
      networkType: NETWORK_TYPE,
      password,
      seedPhrase: decryptedMnemonic,
      label: selectedWalletLabel,
    });

    setCurrentWallet(wallet);
  };

  return (
    <>
      <button
        disabled={!selectedWalletLabel}
        onClick={() => setDialogOpen(true)}
      >
        Unlock wallet
      </button>
      <AppModal
        title="Enter wallet password"
        isOpen={dialogOpen}
        close={() => setDialogOpen(false)}
      >
        <PasswordForm
          onSubmit={handleUnlockWallet}
          onCancel={() => setDialogOpen(false)}
        />
      </AppModal>
    </>
  );
};
