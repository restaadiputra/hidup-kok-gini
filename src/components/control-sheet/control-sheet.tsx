import type { ReactNode } from "react";
import type { GameState } from "../../game/types";
import { Icon } from "../icon/icon";
import "./control-sheet.css";

function reopenLabel(game: GameState | null, finished: boolean): string {
  if (!game) return "Atur pemain & mulai";
  if (finished) return "Lihat hasil akhir";
  return game.phase === "event" ? "Buka kartu nasib" : "Lihat hasil pilihan";
}

// On phones the control panel is a bottom sheet over the board: a backdrop to
// dismiss it and a button to bring it back. On desktop it is a plain sidebar.
export function ControlSheet({
  game,
  finished,
  expanded,
  open,
  onOpen,
  onClose,
  children,
}: {
  game: GameState | null;
  finished: boolean;
  expanded: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      {expanded && open ? <button className="sheet-backdrop" aria-label="Lihat papan" onClick={onClose} /> : null}
      <aside
        className={["sidebar", expanded ? "sheet-mode" : "", open ? "sheet-open" : "sheet-closed"].join(" ")}
        aria-label="Kontrol permainan"
      >
        {expanded && !open ? (
          <button className="primary-button reopen-sheet" onClick={onOpen}>
            {reopenLabel(game, finished)}
            <Icon name="arrow" size={19} />
          </button>
        ) : null}
        {children}
      </aside>
    </>
  );
}
