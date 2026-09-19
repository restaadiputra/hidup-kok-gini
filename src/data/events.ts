import type { EventCard } from "../game/types";
import { CATEGORY_IDS } from "./categories";
import anakKos from "./content/cards/anak-kos.json";
import dramaKantor from "./content/cards/drama-kantor.json";
import eCommerce from "./content/cards/e-commerce.json";
import grupWhatsapp from "./content/cards/grup-whatsapp.json";
import internet from "./content/cards/internet.json";
import keluarga from "./content/cards/keluarga.json";
import kendaraan from "./content/cards/kendaraan.json";
import kerja from "./content/cards/kerja.json";
import kondangan from "./content/cards/kondangan.json";
import mudik from "./content/cards/mudik.json";
import nongkrong from "./content/cards/nongkrong.json";
import ojol from "./content/cards/ojol.json";
import tagihan from "./content/cards/tagihan.json";
import tanggalTua from "./content/cards/tanggal-tua.json";
import { DataError } from "./parse/data-error";
import { assertStatusRefs, assertUniqueIds, parseDeck } from "./parse/parse-cards";
import { COLLECTOR_CARDS, KRISIS_CARDS } from "./special-decks";
import { STATUSES } from "./statuses";
import { SUDDEN_EVENTS } from "./sudden-events";
import { BONUS_EVENTS } from "./bonus-events";
import { TRANSFER_EVENTS } from "./transfer-events";

// This order is part of the save format: seeded draws index into it, so it
// must match categories.json, and reordering or adding cards needs a new save version.
const DECKS = {
  kerja,
  keluarga,
  "anak-kos": anakKos,
  kendaraan,
  nongkrong,
  "e-commerce": eCommerce,
  tagihan,
  "tanggal-tua": tanggalTua,
  kondangan,
  "grup-whatsapp": grupWhatsapp,
  ojol,
  internet,
  mudik,
  "drama-kantor": dramaKantor,
};

if (Object.keys(DECKS).join() !== CATEGORY_IDS.join())
  throw new DataError("events.ts", "deck order must match the category order in categories.json");

export const EVENTS: EventCard[] = CATEGORY_IDS.flatMap((category) =>
  parseDeck(DECKS[category], category),
).concat(BONUS_EVENTS);
assertStatusRefs(EVENTS, STATUSES);

export const ALL_CARDS: EventCard[] = [...EVENTS, ...KRISIS_CARDS, ...COLLECTOR_CARDS, ...SUDDEN_EVENTS, ...TRANSFER_EVENTS];
assertUniqueIds(ALL_CARDS);
export const EVENT_BY_ID = Object.fromEntries(
  ALL_CARDS.map((event) => [event.id, event]),
) as Record<string, EventCard>;
