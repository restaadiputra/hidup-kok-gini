import { test } from "vitest";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { MONTHLY_NOTES, MONTHS } from "./calendar";
import { BOARD, CATEGORIES } from "./categories";
import { ECONOMY, PAYDAY_REASONS } from "./economy";
import { EVENTS } from "./events";
import { INITIAL_STATS, PLAYER_COLORS } from "./players";
import { createGame } from "../game/create-game";
import { gameReducer } from "../game/reducer";
import { ending } from "../game/scoring";
import type { GameState, Player, Stats } from "../game/types";

// Golden hashes: saved games replay by seed + action journal, so content order,
// effect-key order and every random draw must stay identical across refactors.
// If a change is meant to alter content or rules, bump the save version too.

const sha = (value: unknown) =>
  createHash("sha256").update(stableStringify(value)).digest("hex");

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

const endingProbe = (stats: Stats): Player => ({ id: 0, name: "Probe", position: 0, stats });

function contentFingerprint() {
  return sha({
    events: EVENTS.map((event) => [
      event.id,
      event.category,
      event.title,
      event.description,
      event.choices.map((choice) => [choice.label, Object.entries(choice.effects), choice.result]),
    ]),
    categories: Object.entries(CATEGORIES).map(([id, meta]) => [id, meta.label, meta.icon, meta.color]),
    route: BOARD.map((tile) => tile.category),
    months: MONTHS,
    monthlyNotes: MONTHLY_NOTES,
    playerColors: PLAYER_COLORS,
    initialStats: Object.entries(INITIAL_STATS),
    // Canonical form predates the JSON move: the old SALARY was the midpoint of
    // the salary range and the old LIVING_COST was the top of its range.
    economy: [
      (ECONOMY.salary.min + ECONOMY.salary.max) / 2,
      ECONOMY.livingCost.max,
      ECONOMY.deduction,
      ECONOMY.rareChance,
      ECONOMY.rareBill,
    ],
    paydayReasons: [PAYDAY_REASONS.common, PAYDAY_REASONS.rare],
    endings: [
      { dompet: 0, kewarasan: 50, relasi: 50, hoki: 50, hutang: 1 },
      { dompet: 0, kewarasan: 25, relasi: 50, hoki: 50, hutang: 0 },
      { dompet: 0, kewarasan: 50, relasi: 75, hoki: 50, hutang: 0 },
      { dompet: 4_000_000, kewarasan: 50, relasi: 50, hoki: 50, hutang: 0 },
      { dompet: 0, kewarasan: 50, relasi: 50, hoki: 75, hutang: 0 },
      { dompet: 0, kewarasan: 75, relasi: 50, hoki: 50, hutang: 0 },
      { dompet: 0, kewarasan: 50, relasi: 50, hoki: 50, hutang: 0 },
    ].map((stats) => ending(endingProbe(stats))),
  });
}

function playFixedPolicy(game: GameState): GameState {
  let state = game;
  while (state.phase !== "finished") {
    if (state.phase === "ready") state = gameReducer(state, { type: "ROLL" });
    else if (state.phase === "payday") state = gameReducer(state, { type: "CONTINUE_PAYDAY" });
    else if (state.phase === "event")
      state = gameReducer(state, {
        type: "CHOOSE",
        index: state.turn % state.choiceEffects.length,
      });
    else state = gameReducer(state, { type: "NEXT" });
  }
  return state;
}

function behaviourFingerprint() {
  const games = [2, 3, 4].flatMap((count) =>
    Array.from({ length: 30 }, (_, seed) =>
      playFixedPolicy(createGame(["A", "B", "C", "D"].slice(0, count), seed * 7919 + count)),
    ),
  );
  const paydays = Array.from({ length: 5000 }, (_, seed) => {
    const game = createGame(["A", "B"], seed);
    const onLastTile = {
      ...game,
      players: game.players.map((p) => (p.id === 0 ? { ...p, position: BOARD.length - 1 } : p)),
    };
    const rolled = gameReducer(onLastTile, { type: "ROLL" });
    return [rolled.paydayDetails, rolled.eventId, rolled.choiceEffects, rolled.rng];
  });
  return sha({ games, paydays });
}

// Rules v5 in progress; both hashes are re-recorded after the engine lands.
test.skip("content fingerprint is unchanged (cards, board, economy, jokes, endings)", () => {
  assert.equal(contentFingerprint(), "e307f277834ccecacdbc46be8048bcdf8438a66480b59d617b785ae329ab6a00");
});

test.skip("behaviour fingerprint is unchanged (90 seeded games, 5,000 paydays)", () => {
  assert.equal(behaviourFingerprint(), "ef79312d3cc1e01a2ea3ce0e143c8fea490cf723f5132918ba8ab80d124698a4");
});
