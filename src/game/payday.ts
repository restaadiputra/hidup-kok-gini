import { ECONOMY, PAYDAY_REASONS } from "../data/economy";
import { STATUSES } from "../data/statuses";
import { applyWithDebt, chargeDebt } from "./debt";
import { pickIndex, random, rollInRange } from "./random";
import { paydayEffects, syncAutomatic } from "./statuses";
import type { DebtRules, Paycheck, Player, StatusCatalog } from "./types";

export type PaycheckRoll = Omit<Paycheck, "statusEffects" | "interest" | "installment">;

export const PAYDAY_OPTIONS = [
  { label: "Bayar aman", walletLabel: "Bayar utang", effects: { dompet: -150_000, hutang: -250_000, kewarasan: 4 }, result: "Hutang turun sedikit. Napas naik sedikit." },
  { label: "Gaya dulu", walletLabel: "Traktiran", effects: { dompet: -200_000, relasi: 6, hoki: 2 }, result: "Gajian belum dingin, traktiran sudah jalan." },
  { label: "Simpan rapat-rapat", walletLabel: "Uang dihemat", effects: { dompet: 150_000, kewarasan: -3, relasi: -3 }, result: "Saldo aman. Ajakan nongkrong masuk arsip." },
] as const;

// Draw order is part of the save format: salary, living cost, rare roll, bill amount, reason.
export function rollPaycheck(rng: number): { paycheck: PaycheckRoll; rng: number } {
  const salaryRoll = random(rng);
  const livingRoll = random(salaryRoll.rng);
  const rareRoll = random(livingRoll.rng);
  const amountRoll = random(rareRoll.rng);
  const reasonRoll = random(amountRoll.rng);

  const salary = rollInRange(ECONOMY.salary, salaryRoll.value);
  const livingCost = rollInRange(ECONOMY.livingCost, livingRoll.value);
  const rare = rareRoll.value < ECONOMY.rareChance;
  const deduction = rollInRange(rare ? ECONOMY.rareBill : ECONOMY.deduction, amountRoll.value);
  const reasons = rare ? PAYDAY_REASONS.rare : PAYDAY_REASONS.common;

  return {
    paycheck: {
      salary,
      livingCost,
      rare,
      deduction,
      reason: reasons[pickIndex(reasonRoll.value, reasons.length)],
      net: salary - livingCost - deduction,
    },
    rng: reasonRoll.rng,
  };
}

export function settlePayday(
  player: Player, roll: PaycheckRoll, catalog: StatusCatalog = STATUSES, debt: DebtRules = ECONOMY.debt,
): { player: Player; paycheck: Paycheck } {
  let stats = applyWithDebt(player.stats, { dompet: roll.net }, debt);
  const statusEffects = paydayEffects(player.statuses, catalog);
  for (const { effects } of statusEffects) stats = applyWithDebt(stats, effects, debt);
  const charged = chargeDebt(stats, debt);
  return {
    player: { ...player, stats: charged.stats, statuses: syncAutomatic(player.statuses, charged.stats, catalog) },
    paycheck: { ...roll, statusEffects, interest: charged.interest, installment: charged.installment },
  };
}
