import { PLAYER_COLORS } from "../../data/players";
import type { Player } from "../../game/types";
import "./pawn.css";

export function Pawn({
  player,
  small = false,
  hopping = false,
}: {
  player: Player;
  small?: boolean;
  hopping?: boolean;
}) {
  return (
    <span
      className={`pawn ${small ? "pawn-small" : ""} ${hopping ? "is-hopping" : ""}`}
      style={{ background: PLAYER_COLORS[player.id] }}
      title={player.name}
      aria-label={`Pion ${player.name}`}
    >
      <span>{player.id + 1}</span>
      <i aria-hidden="true" />
    </span>
  );
}
