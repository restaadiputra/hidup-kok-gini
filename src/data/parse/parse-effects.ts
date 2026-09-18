import { STATS } from "../../game/stats";
import type { Stats } from "../../game/types";
import { DataError } from "./data-error";
import { expectInteger, expectOneOf, expectRecord } from "./primitives";

export function parseEffects(value: unknown, path: string): Partial<Stats> {
  const effects: Partial<Stats> = {};
  for (const [key, amount] of Object.entries(expectRecord(value, path))) {
    const stat = expectOneOf(key, STATS, `${path}.${key}`);
    effects[stat] = expectInteger(amount, `${path}.${key}`);
  }
  if (Object.keys(effects).length === 0) throw new DataError(path, "an effect set cannot be empty");
  return effects;
}
