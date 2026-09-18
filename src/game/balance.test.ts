import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { test } from "vitest";
import { replaySession, SAVE_VERSION } from "./replay";
import { BOUNDED_STATS } from "./stats";
import { measureBalance, missedTargets, POLICIES, simulateGame, targetDistance } from "./simulation";

const REPORT = process.env.BALANCE_REPORT;

test.runIf(!REPORT)("simulated games preserve invariants and replay", () => {
  for (let seed = 0; seed < 150; seed++) {
    const names = ["A", "B", "C", "D"].slice(0, 2 + seed % 3);
    const policies = names.map((_, i) => POLICIES[(seed + i) % POLICIES.length]);
    const trace = simulateGame(names, seed * 7919, policies, (state) => {
      for (const p of state.players) {
        assert.ok(p.stats.dompet >= 0);
        assert.ok(p.stats.hutang >= 0);
        for (const stat of BOUNDED_STATS) assert.ok(p.stats[stat] >= 0 && p.stats[stat] <= 100);
      }
    });
    assert.deepEqual(replaySession({ version: SAVE_VERSION, names, seed: seed * 7919, actions: trace.actions })?.game, trace.final);
  }
}, 120_000);

test.runIf(!REPORT)("balance metrics are shares", () => {
  const metrics = measureBalance(10);
  for (const key of ["dangerByJune", "borrowed", "crisisRecovery", "comeback"] as const) assert.ok(metrics[key] >= 0 && metrics[key] <= 1);
  assert.equal(metrics.games, 30);
});

test.runIf(!!REPORT)("report balance metrics", () => {
  const metrics = measureBalance();
  writeFileSync(REPORT!, JSON.stringify({ metrics, missed: missedTargets(metrics), distance: targetDistance(metrics) }));
}, 600_000);
