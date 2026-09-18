import { STATS } from "../../game/stats";
import { MAX_PLAYERS } from "../../game/limits";
import type { Stats } from "../../game/types";
import { expectInteger, expectRecord, expectTextList } from "./primitives";

export interface PlayerSetup {
  initialStats: Stats;
  colors: string[];
  defaultNames: string[];
}

export function parsePlayers(json: unknown): PlayerSetup {
  const file = "players.json";
  const fields = expectRecord(json, file);
  const stats = expectRecord(fields.initialStats, `${file} › initialStats`);
  const initialStats = {} as Stats;
  for (const stat of STATS)
    initialStats[stat] = expectInteger(stats[stat], `${file} › initialStats.${stat}`);
  return {
    initialStats,
    colors: expectTextList(fields.colors, `${file} › colors`, MAX_PLAYERS),
    defaultNames: expectTextList(fields.defaultNames, `${file} › defaultNames`, MAX_PLAYERS),
  };
}
