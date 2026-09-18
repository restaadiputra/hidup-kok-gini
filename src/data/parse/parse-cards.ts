import { STATS } from "../../game/stats";
import type { Category, Choice, EventCard, Stats } from "../../game/types";
import { DataError } from "./data-error";
import { expectArray, expectInteger, expectOneOf, expectRecord, expectText } from "./primitives";

// Effects keep the order they are written in: the engine draws one random
// number per effect in that order, so reordering would change saved games.
function parseEffects(value: unknown, path: string): Partial<Stats> {
  const effects: Partial<Stats> = {};
  for (const [key, amount] of Object.entries(expectRecord(value, path))) {
    const stat = expectOneOf(key, STATS, `${path}.${key}`);
    effects[stat] = expectInteger(amount, `${path}.${key}`);
  }
  if (Object.keys(effects).length === 0) throw new DataError(path, "a choice needs at least one effect");
  return effects;
}

function parseChoice(value: unknown, path: string): Choice {
  const fields = expectRecord(value, path);
  return {
    label: expectText(fields.label, `${path}.label`),
    effects: parseEffects(fields.effects, `${path}.effects`),
    result: expectText(fields.result, `${path}.result`),
  };
}

function parseCard(value: unknown, category: Category, path: string): EventCard {
  const fields = expectRecord(value, path);
  const choices = expectArray(fields.choices, `${path}.choices`);
  if (choices.length < 2 || choices.length > 3)
    throw new DataError(`${path}.choices`, "a card needs 2 or 3 choices");
  return {
    id: expectText(fields.id, `${path}.id`),
    category,
    title: expectText(fields.title, `${path}.title`),
    description: expectText(fields.description, `${path}.description`),
    choices: choices.map((choice, i) => parseChoice(choice, `${path}.choices[${i}]`)),
  };
}

export function parseDeck(json: unknown, category: Category): EventCard[] {
  const file = `cards/${category}.json`;
  const fields = expectRecord(json, file);
  if (fields.category !== category)
    throw new DataError(`${file} › category`, `expected "${category}", got ${JSON.stringify(fields.category)}`);
  return expectArray(fields.cards, `${file} › cards`).map((card, i) =>
    parseCard(card, category, `${file} › cards[${i}]`),
  );
}

export function assertUniqueIds(events: EventCard[]): void {
  const seen = new Set<string>();
  for (const event of events) {
    if (seen.has(event.id)) throw new DataError(event.id, "card id is used twice");
    seen.add(event.id);
  }
}
