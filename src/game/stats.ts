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

// Negative outcomes are intentionally sharper than positive outcomes. This
// keeps a “safe” choice from preserving every bar near 100 for twelve months,
// while the written card values remain easy for content authors to reason about.
export function applyPressure(effects: Partial<Stats>): Partial<Stats> {
  const pressured: Partial<Stats> = {};
  for (const [key, value] of Object.entries(effects)) {
    if (value === undefined) {
      pressured[key as Stat] = value;
      continue;
    }
    const stat = key as Stat;
    const factor = value < 0
      ? (isMoney(stat) ? 1.4 : 2.25)
      : (isMoney(stat) ? 0.8 : 0.5);
    const step = isMoney(stat) ? MONEY_STEP : 1;
    pressured[stat] = Math.sign(value) * Math.ceil((Math.abs(value) * factor) / step) * step;
  }
  return pressured;
}

// Compare choices on a common score-like scale, then gently compress outliers
// toward the card's median. Signs and stat trade-offs stay intact; only an
// obviously dominant or punishing magnitude is pulled closer to the table's
// real decision range.
export function choiceUtility(effects: Partial<Stats>): number {
  return (effects.dompet ?? 0) / 100_000 - (effects.hutang ?? 0) / 100_000 +
    (effects.kewarasan ?? 0) + (effects.relasi ?? 0) + (effects.hoki ?? 0);
}

export function balanceChoiceEffects(allEffects: Partial<Stats>[]): Partial<Stats>[] {
  const utilities = allEffects.map(choiceUtility);
  const magnitudes = utilities.map(Math.abs).filter((value) => value > 0);
  if (magnitudes.length < 2) return allEffects;
  const sorted = [...magnitudes].sort((a, b) => a - b);
  const reference = sorted[Math.floor(sorted.length / 2)];
  return allEffects.map((effects, index) => {
    const utility = utilities[index];
    if (!utility || !reference) return effects;
    const target = Math.abs(utility) * 0.45 + reference * 0.55;
    const scale = Math.max(0.55, Math.min(1.45, target / Math.abs(utility)));
    const balanced: Partial<Stats> = {};
    for (const [key, value] of Object.entries(effects)) {
      if (value === undefined || value === 0) {
        balanced[key as Stat] = value;
        continue;
      }
      const stat = key as Stat;
      const step = isMoney(stat) ? MONEY_STEP : 1;
      const amount = Math.max(1, Math.round((Math.abs(value) * scale) / step)) * step;
      balanced[stat] = Math.sign(value) * amount;
    }
    return balanced;
  });
}
