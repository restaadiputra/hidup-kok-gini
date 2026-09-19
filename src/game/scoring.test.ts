import assert from "node:assert/strict";
import { test } from "vitest";
import { createGame } from "./create-game";
import { ending, endingRuleFor, score, scoreBreakdown } from "./scoring";

test("score counts every stat and subtracts hutang from Dompet with floor rounding", () => {
  const p = createGame(["A", "B"], 1).players[0];
  assert.equal(score(p), 130);
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

test("the results screen can explain which stat earned an ending", () => {
  const p = createGame(["A", "B"], 1).players[0];
  const rich = { ...p, stats: { ...p.stats, dompet: 4_600_000 } };
  const rule = endingRuleFor(rich);
  assert.equal(rule?.title, ending(rich).title);
  assert.equal(rule?.stat, "dompet");
  assert.equal(rule?.threshold, 4_000_000);
  const plain = { ...p, stats: { ...p.stats, dompet: 1_000_000, kewarasan: 50, relasi: 50, hoki: 50 } };
  assert.equal(endingRuleFor(plain), null, "the fallback ending has no triggering stat");
});

test("the score breakdown adds up to the score, with debt taken off Dompet", () => {
  const p = createGame(["A", "B"], 1).players[0];
  for (const stats of [
    p.stats,
    { dompet: 2_950_000, kewarasan: 52, relasi: 31, hoki: 35, hutang: 0 },
    { dompet: 50_000, kewarasan: 20, relasi: 30, hoki: 40, hutang: 200_000 },
  ]) {
    const player = { ...p, stats };
    const parts = scoreBreakdown(player);
    assert.equal(parts.wallet + parts.kewarasan + parts.relasi + parts.hoki, score(player));
    assert.equal(parts.total, score(player));
    assert.equal(parts.netWallet, stats.dompet - stats.hutang);
  }
});
