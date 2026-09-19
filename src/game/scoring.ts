import { ENDINGS } from "../data/endings";
import type { Ending, EndingRule, Endings, Player, Stats } from "./types";

const RUPIAH_PER_POINT = 100_000;

export function score(player: Player): number {
  return scoreBreakdown(player).total;
}

export interface ScoreBreakdown {
  /** Dompet minus Hutang, in rupiah. */
  netWallet: number;
  /** Points from the net wallet: one per Rp100,000, rounded down. */
  wallet: number;
  kewarasan: number;
  relasi: number;
  hoki: number;
  total: number;
}

// Each part of the final score, so the results screen can show its working.
export function scoreBreakdown(player: Player): ScoreBreakdown {
  const { dompet, hutang, kewarasan, relasi, hoki } = player.stats;
  const netWallet = dompet - hutang;
  const wallet = Math.floor(netWallet / RUPIAH_PER_POINT);
  return { netWallet, wallet, kewarasan, relasi, hoki, total: wallet + kewarasan + relasi + hoki };
}

// Highest score first; equal scores keep seat order.
export function rankPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => score(b) - score(a) || a.id - b.id);
}

// Equal scores share a rank, including a shared first place.
export function rankOf(rankings: Player[], player: Player): number {
  return rankings.findIndex((other) => score(other) === score(player)) + 1;
}

export function isSharedRank(rankings: Player[], player: Player): boolean {
  return rankings.filter((other) => score(other) === score(player)).length > 1;
}

function matches({ stat, test, threshold }: EndingRule, stats: Stats): boolean {
  const value = stats[stat];
  if (test === "below") return value < threshold;
  if (test === "atMost") return value <= threshold;
  return value >= threshold;
}

// The first matching rule wins, so endings.json is ordered by priority.
// Null means no stat stood out and the player gets the fallback ending.
export function endingRuleFor(player: Player, endings: Endings = ENDINGS): EndingRule | null {
  return endings.rules.find((candidate) => matches(candidate, player.stats)) ?? null;
}

export function ending(player: Player, endings: Endings = ENDINGS): Ending {
  const rule = endingRuleFor(player, endings);
  return rule ? { title: rule.title, text: rule.text } : endings.fallback;
}
