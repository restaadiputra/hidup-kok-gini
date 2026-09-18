import economyJson from "./content/economy.json";
import paydayReasonsJson from "./content/payday-reasons.json";
import { parseEconomy, parsePaydayReasons } from "./parse/parse-economy";

export const ECONOMY = parseEconomy(economyJson);
export const PAYDAY_REASONS = parsePaydayReasons(paydayReasonsJson);
