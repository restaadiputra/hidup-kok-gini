import assert from "node:assert/strict";
import { test } from "vitest";
import { INITIAL_STATS } from "../data/players";
import { createGame } from "./create-game";
import { gameReducer } from "./reducer";
import { replaySession } from "./replay";
import { applyWithDebt } from "./debt";
import type { Session } from "./types";

test("pending choices survive refresh and apply exactly the previewed effects", () => {
  const names = ["A", "B"];
  const seed = 57;
  const rolled = gameReducer(createGame(names, seed), { type: "ROLL" });
  const restored = replaySession({ version: 9, names, seed, actions: [{ type: "ROLL" }] })!;
  assert.deepEqual(restored.game, rolled);
  for (let index = 0; index < rolled.choiceEffects.length; index++) {
    const resolved = gameReducer(restored.game, { type: "CHOOSE", index });
    assert.deepEqual(resolved.players[0].stats, applyWithDebt(rolled.players[0].stats, rolled.choiceEffects[index]));
    for (const [key, value] of Object.entries(resolved.lastEffects)) {
      const stat = key as keyof typeof INITIAL_STATS;
      assert.equal(value, resolved.players[0].stats[stat] - rolled.players[0].stats[stat]);
    }
  }
});

test("save replay rejects corrupt, oversized and impossible journals", () => {
  const base: Session = { version: 9, names: ["A", "B"], seed: 1, actions: [] };
  for (const invalid of [
    null,
    {},
    { ...base, version: 1 },
    { ...base, version: 4 },
    { ...base, seed: -1 },
    { ...base, names: [1, 2] },
    { ...base, actions: [{ type: "NEXT" }] },
    { ...base, actions: [{ type: "ROLL" }, { type: "CHOOSE", index: 80 }] },
    { ...base, actions: [{ type: "HACK" }] },
    { ...base, actions: Array(193).fill({ type: "ROLL" }) },
  ])
    assert.equal(replaySession(invalid), null);
  assert.ok(replaySession(base));
});
