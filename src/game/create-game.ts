import { INITIAL_STATS } from "../data/players";
import { MAX_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS } from "./limits";
import { START_LOG } from "./log-messages";
import type { GameState } from "./types";

const MAX_SEED = 0xffffffff;

function isValidRoster(names: string[]): boolean {
  return (
    names.length >= MIN_PLAYERS &&
    names.length <= MAX_PLAYERS &&
    names.every((name) => name.trim() && name.length <= MAX_NAME_LENGTH)
  );
}

export function createGame(names: string[], seed: number): GameState {
  if (!isValidRoster(names))
    throw new Error("Gunakan 2–4 nama pemain, masing-masing 1–20 karakter.");
  if (!Number.isInteger(seed) || seed < 0 || seed > MAX_SEED) throw new Error("Seed tidak valid.");
  return {
    players: names.map((name, id) => ({
      id,
      name: name.trim(),
      position: 0,
      stats: { ...INITIAL_STATS },
      statuses: [],
    })),
    currentPlayer: 0,
    month: 1,
    phase: "ready",
    rng: seed,
    dice: null,
    eventId: null,
    choiceEffects: [],
    drawn: [],
    recentThemes: [],
    suddenEventSeen: false,
    resolution: "",
    lastEffects: {},
    payday: false,
    paydayDetails: null,
    pendingPosition: null,
    log: [START_LOG],
    turn: 1,
  };
}
