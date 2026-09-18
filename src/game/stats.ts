import { pickIndex, random } from "./random";
import type { BoundedStat, MoneyStat, Stat, Stats } from "./types";

export const STATS: Stat[] = ["dompet", "kewarasan", "relasi", "hoki", "hutang"];
export const SHOWN_STATS: Stat[] = ["dompet", "kewarasan", "relasi", "hoki"];
export const BOUNDED_STATS: BoundedStat[] = ["kewarasan", "relasi", "hoki"];
const MONEY_STATS: readonly Stat[] = ["dompet", "hutang"] satisfies MoneyStat[];
export const isMoney = (stat: Stat): stat is MoneyStat => MONEY_STATS.includes(stat);

const BOUNDED_MIN = 0;
const BOUNDED_MAX = 100;
const MONEY_STEP = 5_000;
const MIN_SWING = 0.6;
const MAX_SWING = 1.4;

const clamp = (value: number) => Math.max(BOUNDED_MIN, Math.min(BOUNDED_MAX, value));

// Dompet may dip below zero here; debt.ts turns any shortfall into hutang.
export function applyEffects(stats: Stats, effects: Partial<Stats>): Stats {
  return {
    dompet: stats.dompet + (effects.dompet ?? 0),
    kewarasan: clamp(stats.kewarasan + (effects.kewarasan ?? 0)),
    relasi: clamp(stats.relasi + (effects.relasi ?? 0)),
    hoki: clamp(stats.hoki + (effects.hoki ?? 0)),
    hutang: Math.max(0, stats.hutang + (effects.hutang ?? 0)),
  };
}

// The change each effect really made once bounds were applied.
export function appliedChanges(before: Stats, after: Stats, effects: Partial<Stats>): Partial<Stats> {
  const changes: Partial<Stats> = {};
  for (const stat of Object.keys(effects) as Stat[]) changes[stat] = after[stat] - before[stat];
  if (after.hutang !== before.hutang) changes.hutang = after.hutang - before.hutang;
  return changes;
}

// Keeps each effect's direction and varies its size within 60–140%, one draw per
// effect in written order. Money moves in Rp5.000 steps, other stats in whole points.
export function randomizeEffects(effects: Partial<Stats>, seed: number) {
  let rng = seed;
  const rolled: Partial<Stats> = {};
  for (const [key, value] of Object.entries(effects)) {
    const stat = key as Stat;
    if (value === 0) {
      rolled[stat] = 0;
      continue;
    }
    const step = isMoney(stat) ? MONEY_STEP : 1;
    const min = Math.ceil((Math.abs(value) * MIN_SWING) / step);
    const max = Math.floor((Math.abs(value) * MAX_SWING) / step);
    if (max < min) {
      rolled[stat] = value;
      continue;
    }
    const draw = random(rng);
    rng = draw.rng;
    rolled[stat] = Math.sign(value) * (min + pickIndex(draw.value, max - min + 1)) * step;
  }
  return { rng, effects: rolled };
}
