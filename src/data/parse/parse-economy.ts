import type { DebtRules, Economy, MoneyRange, PaydayReasons } from "../../game/types";
import { DataError } from "./data-error";
import { expectFraction, expectInteger, expectRecord, expectTextList } from "./primitives";

function parseMoneyRange(value: unknown, path: string): MoneyRange {
  const fields = expectRecord(value, path);
  const range = {
    min: expectInteger(fields.min, `${path}.min`),
    max: expectInteger(fields.max, `${path}.max`),
    step: expectInteger(fields.step, `${path}.step`),
  };
  if (range.step <= 0 || range.min > range.max || (range.max - range.min) % range.step !== 0)
    throw new DataError(path, "needs min ≤ max and a positive step that divides max − min");
  return range;
}

function parseDebt(value: unknown, path: string): DebtRules {
  const fields = expectRecord(value, path);
  const installmentMax = expectInteger(fields.installmentMax, `${path}.installmentMax`);
  if (installmentMax <= 0) throw new DataError(`${path}.installmentMax`, "expected a positive amount");
  return {
    feeRate: expectFraction(fields.feeRate, `${path}.feeRate`),
    interestRate: expectFraction(fields.interestRate, `${path}.interestRate`),
    installmentMax,
    collectorChance: expectFraction(fields.collectorChance, `${path}.collectorChance`),
  };
}

export function parseEconomy(json: unknown): Economy {
  const file = "economy.json";
  const fields = expectRecord(json, file);
  return {
    salary: parseMoneyRange(fields.salary, `${file} › salary`),
    livingCost: parseMoneyRange(fields.livingCost, `${file} › livingCost`),
    deduction: parseMoneyRange(fields.deduction, `${file} › deduction`),
    rareChance: expectFraction(fields.rareChance, `${file} › rareChance`),
    rareBill: parseMoneyRange(fields.rareBill, `${file} › rareBill`),
    debt: parseDebt(fields.debt, `${file} › debt`),
  };
}

export function parsePaydayReasons(json: unknown): PaydayReasons {
  const file = "payday-reasons.json";
  const fields = expectRecord(json, file);
  return {
    common: expectTextList(fields.common, `${file} › common`),
    rare: expectTextList(fields.rare, `${file} › rare`),
  };
}
