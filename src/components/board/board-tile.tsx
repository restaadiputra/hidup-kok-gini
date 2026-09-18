import type { Player, Tile } from "../../game/types";
import type { TurnMotion } from "../../hooks/use-turn-motion";
import { Icon } from "../icon/icon";
import { Pawn } from "../pawn/pawn";
import { directionOf, RING_POSITIONS } from "./ring-layout";
import "./board-tile.css";

export function BoardTile({
  tile,
  index,
  occupants,
  active,
  motion,
}: {
  tile: Tile;
  index: number;
  occupants: Player[];
  active: boolean;
  motion: TurnMotion | null;
}) {
  const moving = motion?.stage === "moving";
  const names = occupants.length ? `: ${occupants.map((p) => p.name).join(", ")}` : "";
  return (
    <div
      className={`board-tile tile-${tile.color} ${active ? "tile-active" : ""} ${active && moving ? "tile-landing" : ""} ${index === 0 ? "tile-start" : ""}`}
      style={{
        gridRow: RING_POSITIONS[index][0],
        gridColumn: RING_POSITIONS[index][1],
      }}
      aria-label={`${index + 1}. ${tile.label}${names}`}
    >
      <span className="tile-number">{index === 0 ? "START" : String(index).padStart(2, "0")}</span>
      <Icon name={tile.icon} size={25} />
      <span className="tile-label">{tile.label}</span>
      <span className={`tile-direction direction-${directionOf(index)}`} aria-hidden="true">
        <Icon name="arrow" size={11} />
      </span>
      {occupants.length > 0 ? (
        <span className="tile-pawns">
          {occupants.map((p) => (
            <Pawn
              key={`${p.id}-${p.position}`}
              player={p}
              small
              hopping={moving && motion?.playerId === p.id}
            />
          ))}
        </span>
      ) : null}
    </div>
  );
}
