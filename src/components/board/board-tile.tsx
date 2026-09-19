import { EVENTS } from "../../data/events";
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
  const deck = EVENTS.filter((e) => e.category === tile.category);
  const sample = deck.length ? deck[index % deck.length].title : "";
  const count = deck.length ? String(deck.length) : "";
  const tileClass = `tile-${tile.color} ${active ? "tile-active" : ""} ${active && moving ? "tile-landing" : ""} ${index === 0 ? "tile-start" : ""}`;
  const tileStyle = {
    gridRow: RING_POSITIONS[index][0],
    gridColumn: RING_POSITIONS[index][1],
  };
  const number = index === 0 ? "START" : String(index).padStart(2, "0");
  const pawns =
    occupants.length > 0 ? (
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
    ) : null;
  const countEl = count ? (
    <span className="tile-count" aria-hidden="true">
      ×{count}
    </span>
  ) : null;
  const teaserEl = sample ? (
    <span className="tile-teaser" aria-hidden="true">
      {sample}
    </span>
  ) : null;
  const directionEl = (
    <span className={`tile-direction direction-${directionOf(index)}`} aria-hidden="true">
      <Icon name="arrow" size={11} />
    </span>
  );
  const ariaLabel = `${index + 1}. ${tile.label}${names}`;
  return (

    <div
      className={`board-tile tile-card ${tileClass}`}
      style={tileStyle}
      aria-label={ariaLabel}
    >
      <span className="tile-number">
        {index === 0 ? (
          <>
            <span className="number-full">START</span>
            <span className="number-short">00</span>
          </>
        ) : (
          number
        )}
      </span>
      {countEl}
      <span className="tile-token">
        <Icon name={tile.icon} size={25} />
      </span>
      <span className="tile-label">{tile.label}</span>
      {teaserEl}
      {directionEl}
      {pawns}
    </div>

  );
}
