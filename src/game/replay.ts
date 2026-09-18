import { TOTAL_MONTHS } from "../data/calendar";
import { createGame } from "./create-game";
import { MAX_PLAYERS } from "./limits";
import { gameReducer } from "./reducer";
import type { Action, GameState, Session } from "./types";

export const SAVE_VERSION = 5;
const ACTIONS_PER_TURN = 4;
const MAX_JOURNAL_LENGTH = MAX_PLAYERS * TOTAL_MONTHS * ACTIONS_PER_TURN;

function parseAction(item: unknown): Action | null {
  if (!item || typeof item !== "object") return null;
  const { type, index } = item as { type?: unknown; index?: unknown };
  if (type === "ROLL" || type === "NEXT" || type === "CONTINUE_PAYDAY") return { type };
  if (type === "CHOOSE" && Number.isInteger(index)) return { type, index: index as number };
  return null;
}

function isJournal(value: unknown): value is { names: string[]; seed: number; actions: unknown[] } {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    data.version === SAVE_VERSION &&
    Array.isArray(data.names) &&
    data.names.every((name) => typeof name === "string") &&
    typeof data.seed === "number" &&
    Array.isArray(data.actions) &&
    data.actions.length <= MAX_JOURNAL_LENGTH
  );
}

// Saves store a small action journal rather than serialized game internals, and are
// rebuilt by replaying it. Any action the rules would ignore marks the save as invalid.
export function replaySession(value: unknown): { session: Session; game: GameState } | null {
  if (!isJournal(value)) return null;
  try {
    let game = createGame(value.names, value.seed);
    const actions: Action[] = [];
    for (const item of value.actions) {
      const action = parseAction(item);
      if (!action) return null;
      const next = gameReducer(game, action);
      if (next === game) return null;
      game = next;
      actions.push(action);
    }
    return { session: { version: SAVE_VERSION, names: value.names, seed: value.seed, actions }, game };
  } catch {
    return null;
  }
}
