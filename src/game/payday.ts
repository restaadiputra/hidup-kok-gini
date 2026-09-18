import { ECONOMY, PAYDAY_REASONS } from "../data/economy";
import { pickIndex, random, rollInRange } from "./random";
import type { Paycheck } from "./types";

// Draw order is part of the save format: salary, living cost, rare roll, bill amount, reason.
export function rollPaycheck(rng: number): { paycheck: Paycheck; rng: number } {
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
