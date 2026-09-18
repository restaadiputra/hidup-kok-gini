import type { CSSProperties } from "react";
import { BOARD } from "../../data/categories";
import type { TurnMotion } from "../../hooks/use-turn-motion";

// Grid [row, column] for each route index: the outer ring of a 5×5 grid,
// starting bottom-left and running clockwise.
export const RING_POSITIONS = [
  [5, 1], [4, 1], [3, 1], [2, 1], [1, 1],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 5], [3, 5], [4, 5], [5, 5],
  [5, 4], [5, 3], [5, 2],
];

const GRID_CENTRE = 3;
const TURN_PER_COLUMN_DEG = 0.65;
const LEAN_PER_ROW_DEG = 0.7;

export function directionOf(index: number): "up" | "right" | "down" | "left" {
  if (index < 4) return "up";
  if (index < 8) return "right";
  return index < 12 ? "down" : "left";
}

// The board tilts slightly toward the hopping pawn, and each hop starts from the
// previous tile's offset so the CSS animation can arc between cells.
export function boardMotionStyle(motion: TurnMotion | null): CSSProperties {
  const moving = motion?.stage === "moving";
  const position = motion?.position ?? 0;
  const [row, column] = RING_POSITIONS[position];
  const [previousRow, previousColumn] = RING_POSITIONS[(position + BOARD.length - 1) % BOARD.length];
  return {
    "--board-turn": moving ? `${(column - GRID_CENTRE) * TURN_PER_COLUMN_DEG}deg` : "0deg",
    "--board-lean": moving ? `${(GRID_CENTRE - row) * LEAN_PER_ROW_DEG}deg` : "0deg",
    "--hop-x": `calc(${previousColumn - column} * (100cqw + var(--board-gap)) / 5)`,
    "--hop-y": `calc(${previousRow - row} * (100cqh + var(--board-gap)) / 5)`,
  } as CSSProperties;
}
