import { test } from "vitest";
import assert from "node:assert/strict";
import { MONTHLY_NOTES } from "./calendar";
import { CATEGORIES } from "./categories";
import { PAYDAY_REASONS } from "./economy";
import { EVENTS } from "./events";
import { INITIAL_STATS } from "./players";
import { HELP_TAG } from "../game/status-ids";
import type { Choice } from "../game/types";
import { COLLECTOR_CARDS, KRISIS_CARDS } from "./special-decks";

const SPECIAL_CARDS = [...KRISIS_CARDS, ...COLLECTOR_CARDS];

// Mechanical half of docs/copy-guide.md. The rest of the guide needs a human read.

const SPELLING: [RegExp, string][] = [
  [/\b(tidak|gak|ga|enggak)\b/i, "nggak"],
  [/\bsudah\b/i, "udah"],
  [/\bsaja\b/i, "aja"],
  [/\bmembuat\b/i, "bikin"],
  [/\bsangat\b/i, "banget"],
  [/\bAnda\b/, "kamu"],
];

const SLOP = [
  "namun", "tentunya", "sebuah", "merupakan", "adalah", "hal ini",
  "tidak hanya", "bukan sekadar", "di era", "perjalanan hidup", "momen",
  "semesta", "memutuskan untuk", "memilih untuk", "sang", "sosok",
  "menjadi saksi", "melakukan",
];

function wordingProblems(text: string): string[] {
  const problems: string[] = [];
  for (const [pattern, fix] of SPELLING) {
    const hit = text.match(pattern);
    if (hit) problems.push(`write “${fix}”, not “${hit[0]}”`);
  }
  for (const phrase of SLOP) {
    if (new RegExp(`\\b${phrase}\\b`, "i").test(text))
      problems.push(`avoid the filler phrase “${phrase}”`);
  }
  if (text.includes("—")) problems.push("no em dash; use a full stop or comma");
  if (text.includes("!!")) problems.push("no “!!”");
  return problems;
}

const cardLines = [...EVENTS, ...SPECIAL_CARDS].flatMap((event) => [
  { where: `${event.id} title`, text: event.title },
  { where: `${event.id} description`, text: event.description },
  ...event.choices.flatMap((choice, i) => [
    { where: `${event.id} choice ${i + 1} label`, text: choice.label },
    { where: `${event.id} choice ${i + 1} result`, text: choice.result },
  ]),
]);

const otherLines = [
  ...PAYDAY_REASONS.common.map((text, i) => ({ where: `payday reason ${i + 1}`, text })),
  ...PAYDAY_REASONS.rare.map((text, i) => ({ where: `rare payday reason ${i + 1}`, text })),
  ...MONTHLY_NOTES.map((text, i) => ({ where: `monthly note ${i + 1}`, text })),
];

test("every joke follows the spelling and anti-slop rules in docs/copy-guide.md", () => {
  const failures = [...cardLines, ...otherLines].flatMap(({ where, text }) =>
    wordingProblems(text).map((problem) => `${where}: ${problem}\n    “${text}”`),
  );
  assert.deepEqual(failures, [], "\n" + failures.join("\n"));
});

test("each category file holds ten cards with unique ids and titles", () => {
  const playable = Object.keys(CATEGORIES).filter((key) => key !== "gajian" && key !== "kejutan");
  for (const category of playable)
    assert.equal(EVENTS.filter((event) => event.category === category).length, 10, category);
  assert.equal(new Set(EVENTS.map((event) => event.id)).size, EVENTS.length, "duplicate id");
  assert.equal(new Set(EVENTS.map((event) => event.title.toLowerCase())).size, EVENTS.length, "duplicate title");
});

test("card parts stay inside their length limits", () => {
  const failures: string[] = [];
  const check = (where: string, text: string, min: number, max: number) => {
    if (text.length < min || text.length > max)
      failures.push(`${where} is ${text.length} characters (allowed ${min}–${max}): “${text}”`);
  };
  for (const event of [...EVENTS, ...SPECIAL_CARDS]) {
    check(`${event.id} title`, event.title, 4, 42);
    check(`${event.id} description`, event.description, 25, 150);
    event.choices.forEach((choice, i) => {
      check(`${event.id} choice ${i + 1} label`, choice.label, 4, 40);
      check(`${event.id} choice ${i + 1} result`, choice.result, 10, 110);
      if (/\.$/.test(choice.label)) failures.push(`${event.id} choice ${i + 1} label ends with a full stop`);
    });
  }
  assert.deepEqual(failures, [], "\n" + failures.join("\n"));
});

const alwaysOpen = (choice: Choice) =>
  Object.keys(choice.requires).length === 0 && choice.requiresStatus === null &&
  choice.blockedByStatus === null && !choice.tags.includes(HELP_TAG);

test("every card has an always-open choice", () => {
  assert.deepEqual([...EVENTS, ...SPECIAL_CARDS].filter((event) => !event.choices.some(alwaysOpen)).map((event) => event.id), []);
});

test("crisis choices can recover and special decks are stocked", () => {
  const burnout = KRISIS_CARDS.filter((card) => card.crisis === "burnout");
  const apes = KRISIS_CARDS.filter((card) => card.crisis === "apes");
  assert.ok(burnout.length >= 2 && apes.length >= 2 && COLLECTOR_CARDS.length >= 3);
  for (const card of burnout) assert.ok(card.choices.some((c) => alwaysOpen(c) && (c.effects.kewarasan ?? 0) > 0));
  for (const card of apes) assert.ok(card.choices.some((c) => alwaysOpen(c) && (c.effects.hoki ?? 0) > 0));
});

test("every card has a real cost and effect sizes that survive randomization", () => {
  const failures: string[] = [];
  for (const event of EVENTS) {
    if (!event.choices.some((choice) => Object.values(choice.effects).some((value) => value! < 0)))
      failures.push(`${event.id} has no negative effect on any choice`);
    event.choices.forEach((choice, i) => {
      for (const [stat, value] of Object.entries(choice.effects)) {
        const size = Math.abs(value!);
        if (stat === "dompet" ? size < 20_000 || size % 5_000 !== 0 : size < 3 || size > 20)
          failures.push(`${event.id} choice ${i + 1}: ${stat} ${value} is outside the allowed range`);
      }
    });
  }
  assert.deepEqual(failures, [], "\n" + failures.join("\n"));
});

test("no full sentence is reused anywhere in the deck", () => {
  const seen = new Map<string, string>();
  const repeats: string[] = [];
  for (const event of EVENTS) {
    const texts = [event.description, ...event.choices.map((choice) => choice.result)];
    for (const sentence of texts.flatMap((text) => text.split(/(?<=[.?!”])\s+/))) {
      const key = sentence.toLowerCase().replace(/[“”"]/g, "").trim();
      if (key.length < 15) continue;
      const first = seen.get(key);
      if (first && first !== event.id) repeats.push(`“${sentence}” appears in ${first} and ${event.id}`);
      else seen.set(key, event.id);
    }
  }
  assert.deepEqual(repeats, [], "\n" + repeats.join("\n"));
});

test("140 original cards cover every requested category, with valid choices and unique IDs", () => {
  assert.equal(EVENTS.length, 140);
  assert.equal(new Set(EVENTS.map((event) => event.id)).size, EVENTS.length);
  assert.equal(new Set(EVENTS.map((event) => event.title)).size, EVENTS.length);
  for (const category of Object.keys(CATEGORIES).filter(
    (key) => !["gajian", "kejutan"].includes(key),
  )) {
    assert.equal(
      EVENTS.filter((event) => event.category === category).length,
      10,
      category,
    );
  }
  for (const event of EVENTS) {
    assert.ok(event.description.length > 20);
    assert.ok(event.choices.length >= 2 && event.choices.length <= 3);
    for (const choice of event.choices) {
      assert.ok(choice.label && choice.result);
      assert.ok(Object.keys(choice.effects).length > 0);
      for (const [stat, value] of Object.entries(choice.effects)) {
        assert.ok(stat in INITIAL_STATS);
        assert.ok(Number.isFinite(value));
      }
    }
  }
});
