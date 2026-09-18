import { ECONOMY } from "../data/economy";
import { EVENTS } from "../data/events";
import { COLLECTOR_CARDS, KRISIS_CARDS } from "../data/special-decks";
import { pickIndex, random } from "./random";
import { APES, BURNOUT, DEBT_COLLECTOR } from "./status-ids";
import { hasStatus } from "./statuses";
import type { EventCard, Player, Tile } from "./types";

export interface Decks { events: EventCard[]; krisis: EventCard[]; collector: EventCard[] }
const DEFAULT_DECKS: Decks = { events: EVENTS, krisis: KRISIS_CARDS, collector: COLLECTOR_CARDS };
const isWildcard = (tile: Tile) => tile.category === "gajian" || tile.category === "kejutan";

function choosePool(player: Player, tile: Tile, rng: number, decks: Decks, collectorChance: number) {
  if (hasStatus(player, BURNOUT)) return { pool: decks.krisis.filter((card) => card.crisis === "burnout"), rng };
  if (tile.category === "kejutan" && hasStatus(player, APES))
    return { pool: decks.krisis.filter((card) => card.crisis === "apes"), rng };
  let next = rng;
  if (hasStatus(player, DEBT_COLLECTOR)) {
    const roll = random(rng);
    if (roll.value < collectorChance) return { pool: decks.collector, rng: roll.rng };
    next = roll.rng;
  }
  const unlocked = decks.events.filter((card) => card.requiresStatus === null || hasStatus(player, card.requiresStatus));
  return { pool: isWildcard(tile) ? unlocked : unlocked.filter((card) => card.category === tile.category), rng: next };
}

export function drawEvent(
  drawn: string[], tile: Tile, rng: number, player: Player,
  decks: Decks = DEFAULT_DECKS, collectorChance: number = ECONOMY.debt.collectorChance,
) {
  const { pool, rng: poolRng } = choosePool(player, tile, rng, decks, collectorChance);
  let history = drawn;
  let available = pool.filter((event) => !history.includes(event.id));
  if (available.length === 0) {
    const poolIds = new Set(pool.map((event) => event.id));
    history = history.filter((id) => !poolIds.has(id));
    available = pool;
  }
  if (available.length === 0) throw new Error(`No eligible cards for ${tile.category}`);
  const draw = random(poolRng);
  const event = available[pickIndex(draw.value, available.length)];
  return { event, drawn: [...history, event.id], rng: draw.rng };
}
