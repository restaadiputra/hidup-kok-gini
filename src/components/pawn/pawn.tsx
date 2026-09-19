import { PLAYER_COLORS } from "../../data/players";
import type { Player } from "../../game/types";
import "./pawn.css";

export function Pawn({
  player,
  small = false,
  hopping = false,
  heavy = false,
}: {
  player: Player;
  small?: boolean;
  hopping?: boolean;
  /** The last hop of a move: slower, higher, and it lands with a thud. */
  heavy?: boolean;
}) {
  return (
    <span
      className={`pawn ${small ? "pawn-small" : ""} ${hopping ? (heavy ? "is-landing" : "is-hopping") : ""}`}
      style={{ background: PLAYER_COLORS[player.id] }}
      title={player.name}
      aria-label={`Pion ${player.name}`}
    >
      <span>{player.id + 1}</span>
      <i aria-hidden="true" />
    </span>
  );
}
