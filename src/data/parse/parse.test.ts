import assert from "node:assert/strict";
import { test } from "vitest";
import { parseDeck } from "./parse-cards";
import { parseEconomy } from "./parse-economy";
import { parseEndings } from "./parse-endings";

const deck = (effects: Record<string, number>) => ({
  category: "ojol",
  cards: [
    {
      id: "ojol-1",
      title: "Judul",
      description: "Situasi yang cukup panjang.",
      choices: [
        { label: "Satu", effects, result: "Akibat satu." },
        { label: "Dua", effects: { hoki: -3 }, result: "Akibat dua." },
      ],
    },
  ],
});

test("effects keep the order they are written in, because draws follow it", () => {
  const [card] = parseDeck(deck({ relasi: 6, dompet: -50_000, kewarasan: 4 }), "ojol");
  assert.deepEqual(Object.keys(card.choices[0].effects), ["relasi", "dompet", "kewarasan"]);
});

test("bad card data fails with the file and exact path", () => {
  assert.throws(
    () => parseDeck(deck({ dompt: -50_000 }), "ojol"),
    /cards\/ojol\.json › cards\[0\]\.choices\[0\]\.effects\.dompt: expected one of/,
  );
  assert.throws(() => parseDeck({ ...deck({ hoki: 3 }), category: "kerja" }, "ojol"), /expected "ojol"/);
});

test("money ranges step evenly and debt rates are fractions", () => {
  const range = { min: 50_000, max: 750_000, step: 25_000 };
  const debt = { feeRate: 0.2, interestRate: 0.1, installmentMax: 500_000, collectorChance: 0.35 };
  const economy = { salary: range, livingCost: range, deduction: range, rareChance: 0.08, rareBill: range, debt };
  assert.doesNotThrow(() => parseEconomy(economy));
  assert.throws(
    () => parseEconomy({ ...economy, rareBill: { min: 0, max: 100_000, step: 30_000 } }),
    /economy\.json › rareBill: needs min ≤ max/,
  );
  assert.throws(
    () => parseEconomy({ ...economy, debt: { ...debt, feeRate: 1.5 } }),
    /economy\.json › debt\.feeRate: expected a number between 0 and 1/,
  );
  assert.throws(
    () => parseEconomy({ ...economy, debt: { ...debt, installmentMax: 0 } }),
    /economy\.json › debt\.installmentMax: expected a positive amount/,
  );
});

test("an ending rule uses exactly one comparison", () => {
  const ending = { title: "T", text: "Teks." };
  assert.throws(
    () => parseEndings({ rules: [{ when: { stat: "hoki", atLeast: 75, below: 3 }, ...ending }], fallback: ending }),
    /use exactly one of below, atMost, atLeast/,
  );
});
