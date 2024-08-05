import React from "react";

import { KaspaClient } from "@repo/kaspa";
import { useAppContext } from "../AppContext.tsx";
import { decryptMnemonic } from "../cryptoUtils.ts";
import { NETWORK_TYPE } from "../constants.ts";
import Dialog from "./Dialog.tsx";
import PasswordForm from "./PasswordForm.tsx";

export const UnlockWalletDialog: React.FC<{ selectedWalletLabel: string }> = ({
  selectedWalletLabel,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { setCurrentWallet, wallets } = useAppContext();
  const [error, setError] = React.useState<string | null>(null);

  const handleUnlockWallet = async (password: string) => {
    const encryptedWallet = wallets.find(
      (w) => w.label === selectedWalletLabel,
    );
    if (!encryptedWallet) {
      return;
    }
    decryptMnemonic(encryptedWallet.mnemonic, password)
      .then((decryptedMnemonic) => {
        const wallet = new KaspaClient({
          networkType: NETWORK_TYPE,
          password,
          seedPhrase: decryptedMnemonic,
          label: selectedWalletLabel,
        });
        setCurrentWallet(wallet);
      })
      .catch((e) => {
        console.error(e);
        if (e.name === "InvalidPasswordException") {
          setError("Invalid password");
          return;
        } else {
          setError("Error decrypting mnemonic");
        }
      });
  };

  return (
    <>
      <button
        disabled={!selectedWalletLabel}
        onClick={() => setDialogOpen(true)}
      >
        Unlock wallet
      </button>
      <Dialog
        title="Enter wallet password"
        isOpen={dialogOpen}
        close={() => setDialogOpen(false)}
      >
        <>
          {error && <code className="error">{error}</code>}
          <PasswordForm
            onSubmit={handleUnlockWallet}
            onCancel={() => setDialogOpen(false)}
          />
        </>
      </Dialog>
    </>
  );
};
