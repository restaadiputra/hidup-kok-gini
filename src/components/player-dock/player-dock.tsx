import type { CSSProperties } from "react";
import { PLAYER_COLORS } from "../../data/players";
import { shortMoney } from "../../game/format";
import type { Player } from "../../game/types";
import { Pawn } from "../pawn/pawn";
import "./player-dock.css";

export function PlayerDock({
  players,
  activeId,
  onOpenSquad,
}: {
  players: Player[];
  activeId: number | null;
  onOpenSquad: () => void;
}) {
  return (
    <div className="player-dock" aria-label="Ringkasan pemain">
      {players.map((p) => (
        <button
          key={p.id}
          className={"dock-player " + (activeId === p.id ? "dock-active" : "")}
          style={{ "--player-color": PLAYER_COLORS[p.id] } as CSSProperties}
          onClick={onOpenSquad}
          aria-label={"Lihat statistik " + p.name}
        >
          <Pawn player={p} small />
          <span>
            <strong>{p.name}</strong>
            <small>{shortMoney(p.stats.dompet)}</small>
          </span>
          {activeId === p.id ? <i className="status-dot" /> : null}
        </button>
      ))}
    </div>
  );
}
