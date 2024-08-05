import React from "react";
import { useAppContext } from "../AppContext.tsx";

export type LocalWalletsProps = {
  selectedWalletLabel: string;
  setSelectedWalletLabel: (label: string) => void;
};

export const LocalWallets: React.FC<LocalWalletsProps> = ({
  selectedWalletLabel,
  setSelectedWalletLabel,
}) => {
  const { wallets } = useAppContext();

  return (
    <>
      {wallets?.length ? (
        <div className="flex-container">
          <label htmlFor="wallets">Wallets</label>
          <select
            id="wallets"
            value={selectedWalletLabel}
            onChange={(e) => {
              setSelectedWalletLabel(e.target.value);
            }}
          >
            <option
              value=""
              style={{
                color: "grey",
              }}
            >
              Select wallet
            </option>
            {wallets.map((wallet) => (
              <option key={wallet.label} value={wallet.label}>
                {wallet.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <p>No wallets found</p>
        </div>
      )}
    </>
  );
};
