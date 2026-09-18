import assert from "node:assert/strict";
import { test } from "vitest";
import { EVENT_BY_ID, EVENTS } from "../data/events";
import { createGame } from "./create-game";
import { gameReducer } from "./reducer";
import { applyEffects, randomizeEffects } from "./stats";
import type { GameState } from "./types";

test("random effects preserve stat keys, signs, bounds and vary across seeds", () => {
  for (const event of EVENTS) for (const choice of event.choices) {
    const variations = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const rolled = randomizeEffects(choice.effects, seed * 7919);
      assert.deepEqual(randomizeEffects(choice.effects, seed * 7919), rolled);
      assert.deepEqual(Object.keys(rolled.effects), Object.keys(choice.effects));
      for (const [key, base] of Object.entries(choice.effects)) {
        const value = rolled.effects[key as keyof typeof choice.effects]!;
        assert.equal(Math.sign(value), Math.sign(base));
        assert.ok(Math.abs(value) >= Math.abs(base) * 0.6);
        assert.ok(Math.abs(value) <= Math.abs(base) * 1.4);
        assert.equal(value % (key === "dompet" ? 5000 : 1), 0 * Math.sign(value));
      }
      variations.add(JSON.stringify(rolled.effects));
    }
    assert.ok(variations.size > 1, `${event.id}: effects must vary`);
  }
  assert.deepEqual(randomizeEffects({ hoki: 0 }, 42), { rng: 42, effects: { hoki: 0 } });
});

test("stat bounds preserve debt and report only actual applied changes", () => {
  const stats = applyEffects(
    { dompet: 0, kewarasan: 98, relasi: 2, hoki: 99 },
    { dompet: -100_000, kewarasan: 20, relasi: -15, hoki: 5 },
  );
  assert.deepEqual(stats, {
    dompet: -100_000,
    kewarasan: 100,
    relasi: 0,
    hoki: 100,
  });
  const initial = createGame(["A", "B"], 1);
  const state: GameState = {
    ...initial,
    phase: "event",
    eventId: "kerja-1",
    choiceEffects: EVENT_BY_ID["kerja-1"].choices.map((choice) => choice.effects),
    players: initial.players.map((p) => ({
      ...p,
      stats: { ...p.stats, kewarasan: 2 },
    })),
  };
  const resolved = gameReducer(state, { type: "CHOOSE", index: 0 });
  assert.equal(resolved.lastEffects.kewarasan, -2);
  assert.equal(resolved.players[0].stats.kewarasan, 0);
});
