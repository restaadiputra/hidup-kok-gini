import { Dialog } from "../dialog/dialog";
import { Icon } from "../icon/icon";
import "./restart-dialog.css";

export function RestartDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <Dialog title="Reset hidup? Bisa di sini." onClose={onCancel}>
      <p className="dialog-lead">
        Progres yang ini akan diganti. Semua balik ke Januari, lengkap
        dengan harapan baru.
      </p>
      <div className="dialog-actions">
        <button className="secondary-button" onClick={onCancel}>
          Lanjut yang ini
        </button>
        <button className="primary-button" onClick={onConfirm}>
          Ya, mulai ulang <Icon name="reset" size={17} />
        </button>
      </div>
    </Dialog>
  );
}
