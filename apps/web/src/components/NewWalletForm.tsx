import React, { useState } from "react";
import { EncryptedWallet } from "../types.ts";
import PasswordStrengthMeter from "./PasswordStrengthMeter.tsx";

export interface NewWalletFormResult {
  label: string;
  password: string;
}

interface NewWalletFormProps {
  wallets: EncryptedWallet[];
  onSubmit: (result: NewWalletFormResult) => void;
  onCancel: () => void;
}

const NewWalletForm: React.FC<NewWalletFormProps> = ({
  onSubmit,
  onCancel,
  wallets,
}) => {
  const [label, setLabel] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSetConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  };

  const labelExists = (label: string) => {
    return wallets.some((wallet) => wallet.label === label);
  };

  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLabel(e.target.value);
    if (labelExists(e.target.value)) {
      setError("Label already exists");
    } else {
      setError("");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!label) {
      setError("Label is required");
      return;
    }
    onSubmit({
      label,
      password,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex-container">
      <div className="flex-row justify-between">
        <label htmlFor="label">Label:</label>
        <input
          type="text"
          id="label"
          name="label"
          value={label}
          onChange={(e) => handleLabelChange(e)}
          required
        />
      </div>
      <div className="flex-row justify-between">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex-row justify-between">
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => handleSetConfirmPassword(e)}
          required
        />
      </div>
      <PasswordStrengthMeter password={password} />
      {error && <p className="error">{error}</p>}
      <div className="flex-row justify-between">
        <button
          onClick={() => {
            onCancel();
          }}
        >
          Close
        </button>
        <button
          className="btn-primary"
          type="submit"
          disabled={
            password !== confirmPassword ||
            !password.length ||
            !label ||
            labelExists(label)
          }
        >
          Confirm
        </button>
      </div>
    </form>
  );
};

export default NewWalletForm;
