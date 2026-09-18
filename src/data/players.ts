import playersJson from "./content/players.json";
import { parsePlayers } from "./parse/parse-players";

const players = parsePlayers(playersJson);

export const INITIAL_STATS = players.initialStats;
export const PLAYER_COLORS = players.colors;
export const DEFAULT_NAMES = players.defaultNames;
