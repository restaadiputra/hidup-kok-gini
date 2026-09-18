import { ENDINGS } from "../data/endings";
import type { Ending, EndingRule, Endings, Player, Stats } from "./types";

const RUPIAH_PER_POINT = 100_000;

export function score(player: Player): number {
  const { dompet, kewarasan, relasi, hoki } = player.stats;
  return Math.floor(dompet / RUPIAH_PER_POINT) + kewarasan + relasi + hoki;
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
export function ending(player: Player, endings: Endings = ENDINGS): Ending {
  const rule = endings.rules.find((candidate) => matches(candidate, player.stats));
  return rule ? { title: rule.title, text: rule.text } : endings.fallback;
}
