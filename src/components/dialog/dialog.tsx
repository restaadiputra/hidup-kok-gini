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
  scrollKey,
  stickyContent,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  /** Reset the modal scroll position when a new step replaces its content. */
  scrollKey?: string | number;
  /** Optional content that stays attached to the dialog header while it scrolls. */
  stickyContent?: ReactNode;
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
  useEffect(() => {
    if (scrollKey !== undefined) ref.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [scrollKey]);
  const header = (
    <div className="dialog-header">
      <h2 id="dialog-title">{title}</h2>
      {dismissible ? (
        <button className="icon-button" onClick={onClose} aria-label="Tutup">
          <Icon name="close" />
        </button>
      ) : null}
    </div>
  );
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
        {stickyContent ? <div className="dialog-sticky">{header}{stickyContent}</div> : header}
        {children}
      </div>
    </dialog>
  );
}
