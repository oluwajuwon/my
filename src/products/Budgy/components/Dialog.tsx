import React, { useEffect, useRef } from "react";

export const Dialog: React.FC<{
  open: boolean; title: string; description?: string; onClose: () => void; children: React.ReactNode;
}> = ({ open, title, description, onClose, children }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="budgy-dialog-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()} onKeyDown={(event) => event.key === "Escape" && onClose()}>
      <section className="budgy-dialog" role="dialog" aria-modal="true" aria-labelledby="budgy-dialog-title">
        <header><div><p className="budgy-eyebrow">Budgy</p><h2 id="budgy-dialog-title">{title}</h2>{description && <p>{description}</p>}</div><button ref={closeRef} className="budgy-icon-button" type="button" onClick={onClose} aria-label="Close dialog">×</button></header>
        {children}
      </section>
    </div>
  );
};

export const ConfirmationDialog: React.FC<{
  open: boolean; title: string; description: string; confirmLabel?: string; strong?: boolean;
  onCancel: () => void; onConfirm: () => void;
}> = ({ open, title, description, confirmLabel = "Confirm", strong, onCancel, onConfirm }) => (
  <Dialog open={open} title={title} description={description} onClose={onCancel}>
    <div className="budgy-dialog-actions"><button className="budgy-button budgy-button--quiet" type="button" onClick={onCancel}>Cancel</button><button className={`budgy-button ${strong ? "budgy-button--danger" : "budgy-button--primary"}`} type="button" onClick={onConfirm}>{confirmLabel}</button></div>
  </Dialog>
);
