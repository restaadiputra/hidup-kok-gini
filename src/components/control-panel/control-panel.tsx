import type { ReactNode } from "react";
import { TOTAL_MONTHS } from "../../data/calendar";
import type { GameState } from "../../game/types";
import { Icon } from "../icon/icon";
import "./control-panel.css";

function panelLabel(game: GameState | null, finished: boolean): string {
  if (!game) return "Atur pemain";
  return finished ? "Hasil akhir" : "Giliran aktif";
}

function panelStatus(game: GameState | null, finished: boolean, moving: boolean): string {
  if (!game) return "LOBI MANUSIA";
  if (finished) return "YEAR-END WRAPPED";
  return moving ? "SEMESTA LAGI KERJA" : "YOUR NEXT PLOT TWIST";
}

function turnCounter(game: GameState | null, playerCount: number): string {
  if (!game) return "IRL →";
  return String(game.turn).padStart(2, "0") + " / " + playerCount * TOTAL_MONTHS;
}

export function ControlPanel({
  game,
  finished,
  moving,
  playerCount,
  onClose,
  children,
}: {
  game: GameState | null;
  finished: boolean;
  moving: boolean;
  playerCount: number;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <section className={"control-panel " + (!game ? "setup-panel" : "")} aria-label={panelLabel(game, finished)}>
      <div className="panel-topline">
        <span>
          <i className="status-dot" />
          {panelStatus(game, finished, moving)}
        </span>
        <button className="sheet-close" aria-label="Lihat papan" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <span className="panel-code">{turnCounter(game, playerCount)}</span>
      </div>
      {children}
    </section>
  );
}
