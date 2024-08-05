import React, { ReactNode, useEffect } from "react";

interface AppModalProps {
  title?: string;
  children: ReactNode;
  isOpen?: boolean;
  close?: () => void;
}

const AppModal: React.FC<AppModalProps> = ({
  title,
  children,
  isOpen,
  close,
}) => {
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

export default AppModal;
