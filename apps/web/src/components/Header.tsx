import React from "react";
import "./Header.css";
import { useAppContext } from "../AppContext.tsx";

export const Header: React.FC = () => {
  const { currentWallet } = useAppContext();
  return (
    <header>
      <span>Silver Wallet</span>
      <span>{currentWallet?.label}</span>
    </header>
  );
};
