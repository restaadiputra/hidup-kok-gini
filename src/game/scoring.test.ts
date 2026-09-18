import assert from "node:assert/strict";
import { test } from "vitest";
import { createGame } from "./create-game";
import { ending, score } from "./scoring";

test("score counts every stat and subtracts hutang from Dompet with floor rounding", () => {
  const p = createGame(["A", "B"], 1).players[0];
  assert.equal(score(p), 175);
  assert.equal(
    score({
      ...p,
      stats: { dompet: 50_000, kewarasan: 20, relasi: 30, hoki: 40, hutang: 200_000 },
    }),
    88,
  );
  assert.equal(
    score({ ...p, id: 3 }),
    score(p),
    "tied stats have tied scores regardless of player order",
  );
  assert.equal(
    ending({ ...p, stats: { ...p.stats, hutang: 1 } }).title,
    "CEO Cicilan & Optimisme",
  );
});
