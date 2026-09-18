import type { MoneyRange } from "./types";

export interface Draw {
  rng: number;
  value: number;
}

// All randomness is explicit state: the same seed and actions always replay identically.
export function random(rng: number): Draw {
  const next = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return { rng: next, value: next / 4_294_967_296 };
}

export function pickIndex(value: number, length: number): number {
  return Math.floor(value * length);
}

export function rollDie(value: number): number {
  return 1 + pickIndex(value, 6);
}

export function rollInRange({ min, max, step }: MoneyRange, value: number): number {
  return min + pickIndex(value, (max - min) / step + 1) * step;
}
