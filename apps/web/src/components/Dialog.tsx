import React, { ReactNode, useEffect } from "react";

interface DialogProps {
  title?: string;
  children: ReactNode;
  isOpen?: boolean;
  close?: () => void;
}

const Dialog: React.FC<DialogProps> = ({ title, children, isOpen, close }) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  return (
    <>
      <dialog ref={dialogRef} onClose={close}>
        {isOpen ? (
          <>
            <h2>{title || "Modal"}</h2>
            <div className="flex-container">{children}</div>
          </>
        ) : null}
      </dialog>
    </>
  );
};

export default Dialog;
