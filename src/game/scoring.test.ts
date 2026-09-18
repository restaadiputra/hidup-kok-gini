import assert from "node:assert/strict";
import { test } from "vitest";
import { createGame } from "./create-game";
import { ending, score } from "./scoring";

test("score counts every stat and treats debt with floor rounding", () => {
  const p = createGame(["A", "B"], 1).players[0];
  assert.equal(score(p), 175);
  assert.equal(
    score({
      ...p,
      stats: { dompet: -150_000, kewarasan: 20, relasi: 30, hoki: 40 },
    }),
    88,
  );
  assert.equal(
    score({ ...p, id: 3 }),
    score(p),
    "tied stats have tied scores regardless of player order",
  );
  assert.equal(
    ending({ ...p, stats: { ...p.stats, dompet: -1 } }).title,
    "CEO Cicilan & Optimisme",
  );
});
