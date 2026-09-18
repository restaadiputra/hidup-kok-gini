import { STATUSES } from "../data/statuses";
import type { ActiveStatus, Player, StatusCatalog, StatusEffect, StatusTrigger, Stats } from "./types";

export const hasStatus = (player: Pick<Player, "statuses">, id: string) =>
  player.statuses.some((status) => status.id === id);

export function gainStatuses(statuses: ActiveStatus[], ids: string[], month: number, catalog: StatusCatalog = STATUSES): ActiveStatus[] {
  let next = statuses;
  for (const id of ids) {
    const { months } = catalog[id];
    next = [...next.filter((status) => status.id !== id), { id, untilMonth: months === null ? null : month + months }];
  }
  return next;
}

export function clearStatuses(statuses: ActiveStatus[], ids: string[]): ActiveStatus[] {
  return ids.length ? statuses.filter((status) => !ids.includes(status.id)) : statuses;
}

export function expireStatuses(statuses: ActiveStatus[], month: number): ActiveStatus[] {
  const kept = statuses.filter((status) => status.untilMonth === null || month < status.untilMonth);
  return kept.length === statuses.length ? statuses : kept;
}

function triggered(trigger: StatusTrigger, stats: Stats, active: boolean): boolean {
  if (trigger.stat === "hutang") return stats.hutang > trigger.above;
  return active ? stats[trigger.stat] <= trigger.clearAbove : stats[trigger.stat] <= trigger.atMost;
}

export function syncAutomatic(statuses: ActiveStatus[], stats: Stats, catalog: StatusCatalog = STATUSES): ActiveStatus[] {
  let next = statuses;
  for (const def of Object.values(catalog)) {
    if (!def.trigger) continue;
    const active = next.some((status) => status.id === def.id);
    const should = triggered(def.trigger, stats, active);
    if (should && !active) next = [...next, { id: def.id, untilMonth: null }];
    if (!should && active) next = next.filter((status) => status.id !== def.id);
  }
  return next;
}

export function paydayEffects(statuses: ActiveStatus[], catalog: StatusCatalog = STATUSES): StatusEffect[] {
  return statuses.flatMap(({ id }) => Object.keys(catalog[id].payday).length ? [{ status: id, effects: catalog[id].payday }] : []);
}

export function statusChanges(before: ActiveStatus[], after: ActiveStatus[]) {
  const had = new Set(before.map((status) => status.id));
  const has = new Set(after.map((status) => status.id));
  return {
    gained: after.filter((status) => !had.has(status.id)).map((status) => status.id),
    lost: before.filter((status) => !has.has(status.id)).map((status) => status.id),
  };
}

export const statusLabel = (id: string, catalog: StatusCatalog = STATUSES) => catalog[id].label;
