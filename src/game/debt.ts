import { ECONOMY } from "../data/economy";
import { applyEffects } from "./stats";
import type { DebtRules, Stats } from "./types";

const INTEREST_STEP = 1_000;

export function borrowCost(shortfall: number, debt: DebtRules = ECONOMY.debt): number {
  return Math.ceil(shortfall * (1 + debt.feeRate));
}

export function coverShortfall(stats: Stats, debt: DebtRules = ECONOMY.debt): Stats {
  if (stats.dompet >= 0) return stats;
  return { ...stats, dompet: 0, hutang: stats.hutang + borrowCost(-stats.dompet, debt) };
}

export function applyWithDebt(stats: Stats, effects: Partial<Stats>, debt: DebtRules = ECONOMY.debt): Stats {
  return coverShortfall(applyEffects(stats, effects), debt);
}

export interface DebtCharge {
  stats: Stats;
  interest: number;
  installment: number;
}

export function chargeDebt(stats: Stats, debt: DebtRules = ECONOMY.debt): DebtCharge {
  const interest = Math.floor((stats.hutang * debt.interestRate) / INTEREST_STEP) * INTEREST_STEP;
  const owed = stats.hutang + interest;
  const installment = Math.min(owed, debt.installmentMax, stats.dompet);
  return {
    stats: { ...stats, dompet: stats.dompet - installment, hutang: owed - installment },
    interest,
    installment,
  };
}
