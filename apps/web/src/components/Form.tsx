import React, { ReactNode } from "react";

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

const Form: React.FC<FormProps> = ({ onSubmit, children }) => {
  return (
    <form onSubmit={onSubmit} className="flex-container">
      {children}
    </form>
  );
};

export default Form;
