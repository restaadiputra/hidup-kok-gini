import type { Player } from "../../game/types";
import { Dialog } from "../dialog/dialog";
import { PlayerCard } from "./player-card";
import "./squad-dialog.css";

export function SquadDialog({
  players,
  activeId,
  onClose,
}: {
  players: Player[];
  activeId: number | null;
  onClose: () => void;
}) {
  return (
    <Dialog title="Skuad pejuang realita" onClose={onClose}>
      <p className="dialog-lead">
        Cek Dompet, Kewarasan, Relasi, dan Hoki semua pemain.
      </p>
      <div className="players-grid">
        {players.map((p) => (
          <PlayerCard key={p.id} player={p} active={activeId === p.id} />
        ))}
      </div>
    </Dialog>
  );
}
