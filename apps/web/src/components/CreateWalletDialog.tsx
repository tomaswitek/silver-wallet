import React from "react";

import { KaspaClient } from "@repo/kaspa";
import { useAppContext } from "../AppContext.tsx";
import CreateWalletForm, {
  CreateWalletFormResult,
} from "./CreateWalletForm.tsx";
import { NETWORK_TYPE } from "../constants.ts";
import { encryptMnemonic } from "../cryptoUtils.ts";
import Dialog from "./Dialog.tsx";

export const CreateWalletDialog: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { addWallet, setCurrentWallet, wallets } = useAppContext();
  const [error, setError] = React.useState<string | null>(null);
  const [initializingWallet, setInitializingWallet] = React.useState(false);

  const handleCreateWallet = async ({
    label,
    password,
  }: CreateWalletFormResult) => {
    if (!password || !label) {
      return;
    }
    setInitializingWallet(true);
    const client = new KaspaClient({
      networkType: NETWORK_TYPE,
      password,
      label,
    });
    await client.connect((e) => {
      if (e.event === "connect") {
        console.log("Connected");
      }
    });
    const { seedPhrase } = client.setPrivateKey(password);
    await client.disconnect();
    setInitializingWallet(false);
    encryptMnemonic(seedPhrase, password)
      .then((encryptedMnemonic) => {
        addWallet({ label, mnemonic: encryptedMnemonic });
        setCurrentWallet(client);
      })
      .catch((e) => {
        console.error(e);
        setError("Error encrypting mnemonic");
      });
  };

  return (
    <>
      <button onClick={() => setIsDialogOpen(true)}>New wallet</button>
      <Dialog
        title="Create New Wallet"
        isOpen={isDialogOpen}
        close={() => setIsDialogOpen(false)}
      >
        {!initializingWallet ? (
          <>
            <CreateWalletForm
              wallets={wallets}
              onSubmit={handleCreateWallet}
              onCancel={() => setIsDialogOpen(false)}
            />
            {error && <code>{error}</code>}
          </>
        ) : (
          <div>Initializing wallet...</div>
        )}
      </Dialog>
    </>
  );
};
