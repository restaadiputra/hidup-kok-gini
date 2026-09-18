import { BOUNDED_STATS } from "../../game/stats";
import type { Choice, Crisis, DeckId, EventCard, StatRequirement, StatusCatalog } from "../../game/types";
import { DataError } from "./data-error";
import { parseEffects } from "./parse-effects";
import { expectArray, expectInteger, expectOneOf, expectRecord, expectText, expectTextList } from "./primitives";

const CRISES: readonly Crisis[] = ["burnout", "apes"];
const optionalText = (value: unknown, path: string) => value === undefined ? null : expectText(value, path);
const optionalList = (value: unknown, path: string) => value === undefined ? [] : expectTextList(value, path);

function parseRequirement(value: unknown, path: string): StatRequirement {
  if (value === undefined) return {};
  const requires: StatRequirement = {};
  for (const [key, min] of Object.entries(expectRecord(value, path))) {
    const stat = expectOneOf(key, BOUNDED_STATS, `${path}.${key}`);
    const at = expectInteger(min, `${path}.${key}`);
    if (at < 1 || at > 100) throw new DataError(`${path}.${key}`, "expected a minimum between 1 and 100");
    requires[stat] = at;
  }
  return requires;
}

function parseChoice(value: unknown, path: string): Choice {
  const fields = expectRecord(value, path);
  return {
    label: expectText(fields.label, `${path}.label`),
    effects: parseEffects(fields.effects, `${path}.effects`),
    result: expectText(fields.result, `${path}.result`),
    requires: parseRequirement(fields.requires, `${path}.requires`),
    requiresStatus: optionalText(fields.requiresStatus, `${path}.requiresStatus`),
    blockedByStatus: optionalText(fields.blockedByStatus, `${path}.blockedByStatus`),
    gains: optionalList(fields.gains, `${path}.gains`),
    clears: optionalList(fields.clears, `${path}.clears`),
    tags: optionalList(fields.tags, `${path}.tags`),
  };
}

function parseCard(value: unknown, deck: DeckId, path: string): EventCard {
  const fields = expectRecord(value, path);
  const choices = expectArray(fields.choices, `${path}.choices`);
  if (choices.length < 2 || choices.length > 3) throw new DataError(`${path}.choices`, "a card needs 2 or 3 choices");
  const crisis = fields.crisis === undefined ? null : expectOneOf(fields.crisis, CRISES, `${path}.crisis`);
  if ((deck === "krisis") !== (crisis !== null))
    throw new DataError(`${path}.crisis`, deck === "krisis" ? "krisis cards need a crisis" : "only krisis cards have a crisis");
  return {
    id: expectText(fields.id, `${path}.id`), category: deck,
    title: expectText(fields.title, `${path}.title`), description: expectText(fields.description, `${path}.description`),
    choices: choices.map((choice, i) => parseChoice(choice, `${path}.choices[${i}]`)),
    requiresStatus: optionalText(fields.requiresStatus, `${path}.requiresStatus`), crisis,
  };
}

export function parseDeck(json: unknown, deck: DeckId): EventCard[] {
  const file = `cards/${deck}.json`;
  const fields = expectRecord(json, file);
  if (fields.category !== deck) throw new DataError(`${file} › category`, `expected "${deck}", got ${JSON.stringify(fields.category)}`);
  return expectArray(fields.cards, `${file} › cards`).map((card, i) => parseCard(card, deck, `${file} › cards[${i}]`));
}

export function assertUniqueIds(events: EventCard[]): void {
  const seen = new Set<string>();
  for (const event of events) {
    if (seen.has(event.id)) throw new DataError(event.id, "card id is used twice");
    seen.add(event.id);
  }
}

export function assertStatusRefs(cards: EventCard[], catalog: StatusCatalog): void {
  const known = (id: string | null, where: string) => {
    if (id !== null && !catalog[id]) throw new DataError(where, `unknown status "${id}"`);
  };
  for (const card of cards) {
    known(card.requiresStatus, `${card.id} requiresStatus`);
    if (card.requiresStatus && catalog[card.requiresStatus].trigger)
      throw new DataError(`${card.id} requiresStatus`, "follow-up cards need a status a choice can give");
    card.choices.forEach((choice, i) => {
      const where = `${card.id} choice ${i + 1}`;
      known(choice.requiresStatus, `${where} requiresStatus`);
      known(choice.blockedByStatus, `${where} blockedByStatus`);
      for (const id of [...choice.gains, ...choice.clears]) known(id, `${where} gains/clears`);
      for (const id of choice.gains)
        if (catalog[id].trigger) throw new DataError(`${where} gains`, `"${id}" is automatic and cannot be gained by a choice`);
    });
  }
}
