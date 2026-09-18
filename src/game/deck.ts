import { EVENTS } from "../data/events";
import { pickIndex, random } from "./random";
import type { EventCard, Tile } from "./types";

const isWildcard = (tile: Tile) => tile.category === "gajian" || tile.category === "kejutan";

// Draws a card for the tile without repeating one until its pool is used up;
// then that pool's history is forgotten and it reshuffles.
export function drawEvent(drawn: string[], tile: Tile, rng: number) {
  const pool = isWildcard(tile) ? EVENTS : EVENTS.filter((event) => event.category === tile.category);
  let history = drawn;
  let available = pool.filter((event) => !history.includes(event.id));
  if (available.length === 0) {
    const poolIds = new Set(pool.map((event) => event.id));
    history = history.filter((id) => !poolIds.has(id));
    available = pool;
  }
  const draw = random(rng);
  const event: EventCard = available[pickIndex(draw.value, available.length)];
  return { event, drawn: [...history, event.id], rng: draw.rng };
}
