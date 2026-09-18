import assert from "node:assert/strict";
import { test } from "vitest";
import { applyWithDebt, borrowCost, chargeDebt } from "./debt";
import type { DebtRules, Stats } from "./types";

const RULES: DebtRules = { feeRate: 0.2, interestRate: 0.1, installmentMax: 500_000, collectorChance: 0.35 };
const stats = (dompet: number, hutang = 0): Stats => ({ dompet, kewarasan: 50, relasi: 50, hoki: 50, hutang });

test("borrowing adds the shortfall plus its fee", () => {
  assert.equal(borrowCost(100, RULES), 120);
  assert.equal(borrowCost(1, RULES), 2);
  assert.equal(borrowCost(250_000, RULES), 300_000);
});

test("an uncovered cost becomes hutang", () => {
  assert.deepEqual(applyWithDebt(stats(100_000), { dompet: -100_100 }, RULES), stats(0, 120));
  assert.deepEqual(applyWithDebt(stats(100_000), { dompet: -100_000 }, RULES), stats(0, 0));
  assert.deepEqual(applyWithDebt(stats(0, 500), { dompet: 50_000 }, RULES), stats(50_000, 500));
});

test("payday charges interest then a capped installment", () => {
  assert.deepEqual(chargeDebt(stats(2_000_000, 1_234_567), RULES), {
    stats: stats(1_500_000, 857_567), interest: 123_000, installment: 500_000,
  });
  assert.deepEqual(chargeDebt(stats(80_000, 300_000), RULES), {
    stats: stats(0, 250_000), interest: 30_000, installment: 80_000,
  });
  assert.deepEqual(chargeDebt(stats(900_000, 5_000), RULES), {
    stats: stats(895_000, 0), interest: 0, installment: 5_000,
  });
});
