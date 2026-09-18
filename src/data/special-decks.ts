import type { DeckId, SpecialDeck, TileMeta } from "../game/types";
import { CATEGORIES } from "./categories";
import collectorJson from "./content/cards/debt-collector.json";
import krisisJson from "./content/cards/krisis.json";
import specialDecksJson from "./content/special-decks.json";
import { parseTileMeta } from "./parse/parse-board";
import { assertStatusRefs, parseDeck } from "./parse/parse-cards";
import { expectRecord } from "./parse/primitives";
import { STATUSES } from "./statuses";

function parseSpecialDeckMeta(json: unknown): Record<SpecialDeck, TileMeta> {
  const file = "special-decks.json";
  const fields = expectRecord(json, file);
  return {
    krisis: parseTileMeta(fields.krisis, `${file} › krisis`),
    "debt-collector": parseTileMeta(fields["debt-collector"], `${file} › debt-collector`),
  };
}

export const DECK_META: Record<DeckId, TileMeta> = { ...CATEGORIES, ...parseSpecialDeckMeta(specialDecksJson) };
export const KRISIS_CARDS = parseDeck(krisisJson, "krisis");
export const COLLECTOR_CARDS = parseDeck(collectorJson, "debt-collector");
assertStatusRefs([...KRISIS_CARDS, ...COLLECTOR_CARDS], STATUSES);
