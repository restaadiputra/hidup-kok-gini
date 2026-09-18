import { ECONOMY } from "../data/economy";
import { STATUSES } from "../data/statuses";
import { borrowCost } from "./debt";
import { STAT_LABELS } from "./format";
import { GHOSTED, HELP_TAG } from "./status-ids";
import { hasStatus } from "./statuses";
import type { BoundedStat, Choice, DebtRules, Player, StatusCatalog, Stats } from "./types";

export type Availability =
  | { kind: "ok" }
  | { kind: "debt"; shortfall: number; added: number }
  | { kind: "locked"; reason: string };

export function choiceAvailability(
  player: Player,
  choice: Choice,
  rolled: Partial<Stats>,
  catalog: StatusCatalog = STATUSES,
  debt: DebtRules = ECONOMY.debt,
): Availability {
  if (choice.requiresStatus && !hasStatus(player, choice.requiresStatus))
    return { kind: "locked", reason: `Butuh status “${catalog[choice.requiresStatus].label}”` };
  if (choice.blockedByStatus && hasStatus(player, choice.blockedByStatus))
    return { kind: "locked", reason: `Nggak bisa selama “${catalog[choice.blockedByStatus].label}”` };
  if (choice.tags.includes(HELP_TAG) && hasStatus(player, GHOSTED))
    return { kind: "locked", reason: "Lagi di-ghosting, nggak ada yang bisa dimintain tolong" };
  for (const [stat, min] of Object.entries(choice.requires) as [BoundedStat, number][])
    if (player.stats[stat] < min) return { kind: "locked", reason: `Butuh ${STAT_LABELS[stat]} ${min}+` };
  const cost = -(rolled.dompet ?? 0);
  if (cost > player.stats.dompet) {
    const shortfall = cost - player.stats.dompet;
    return { kind: "debt", shortfall, added: borrowCost(shortfall, debt) };
  }
  return { kind: "ok" };
}
