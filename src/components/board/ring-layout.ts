import type { CSSProperties } from "react";
import { BOARD } from "../../data/categories";
import { FOCUS_MS, HOP_MS, isCameraOn, LANDING_MS, SETTLE_MS, type TurnMotion } from "../../hooks/use-turn-motion";

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
// How close the camera gets to the travelling pawn.
const CAMERA_ZOOM = 1.7;
const CAMERA_MS = { rolling: HOP_MS, focus: FOCUS_MS, moving: HOP_MS, landing: LANDING_MS, settling: SETTLE_MS };

export function directionOf(index: number): "up" | "right" | "down" | "left" {
  if (index < 4) return "up";
  if (index < 8) return "right";
  return index < 12 ? "down" : "left";
}

// While the pawn travels the camera zooms in and keeps its tile at the centre
// of the board, tilting slightly toward it; each hop starts from the previous
// tile's offset so the CSS animation can arc between cells. Settling pulls
// the camera back to the whole board.
export function boardMotionStyle(motion: TurnMotion | null): CSSProperties {
  const moving = isCameraOn(motion);
  const position = motion?.position ?? 0;
  const [row, column] = RING_POSITIONS[position];
  const [previousRow, previousColumn] = RING_POSITIONS[(position + BOARD.length - 1) % BOARD.length];
  return {
    "--board-turn": moving ? `${(column - GRID_CENTRE) * TURN_PER_COLUMN_DEG}deg` : "0deg",
    "--board-lean": moving ? `${(GRID_CENTRE - row) * LEAN_PER_ROW_DEG}deg` : "0deg",
    // translate() percentages are of the grid's own size, so shifting by the
    // tile's distance from the centre (in fifths), times the zoom, centres it.
    "--cam-zoom": moving ? String(CAMERA_ZOOM) : "1",
    "--cam-x": moving ? `${((GRID_CENTRE - column) / 5) * 100 * CAMERA_ZOOM}%` : "0%",
    "--cam-y": moving ? `${((GRID_CENTRE - row) / 5) * 100 * CAMERA_ZOOM}%` : "0%",
    "--cam-ms": `${CAMERA_MS[motion?.stage ?? "settling"]}ms`,
    "--hop-x": `calc(${previousColumn - column} * (100cqw + var(--board-gap)) / 5)`,
    "--hop-y": `calc(${previousRow - row} * (100cqh + var(--board-gap)) / 5)`,
  } as CSSProperties;
}
