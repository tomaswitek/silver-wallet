import React, { useState } from "react";

interface PasswordFormProps {
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit, onCancel }) => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    onSubmit(password);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-container">
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
          onChange={(e) => handleConfirmPasswordChange(e)}
          required
        />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="flex-row justify-between">
        <button
          type="button"
          onClick={() => {
            onCancel();
          }}
        >
          Close
        </button>
        <button
          className="btn-primary"
          type="submit"
          disabled={password !== confirmPassword || !password.length}
        >
          Confirm
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;
