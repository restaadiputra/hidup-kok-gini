import { Dialog } from "../dialog/dialog";
import "./log-dialog.css";

const EMPTY_LOG = ["Belum ada drama. Nikmati selagi bisa."];

export function LogDialog({ log, onClose }: { log: string[] | null; onClose: () => void }) {
  return (
    <Dialog title="Jejak digital kehidupan" onClose={onClose}>
      <p className="dialog-lead">Bukti kalau tadi bukan cuma mimpi.</p>
      <ol className="game-log">
        {(log ?? EMPTY_LOG).map((entry, i) => (
          <li key={i}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <p>{entry}</p>
          </li>
        ))}
      </ol>
    </Dialog>
  );
}
