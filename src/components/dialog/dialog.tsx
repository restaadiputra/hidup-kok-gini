import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "../icon/icon";
import "./dialog.css";

// A dialog that must be answered (dismissible=false) has no close button and
// ignores backdrop taps; Escape still calls onClose.
export function Dialog({
  title,
  children,
  onClose,
  dismissible = true,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-inner">
        <div className="dialog-header">
          <h2 id="dialog-title">{title}</h2>
          {dismissible ? (
            <button className="icon-button" onClick={onClose} aria-label="Tutup">
              <Icon name="close" />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </dialog>
  );
}
