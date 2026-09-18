import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const [money, points] = process.argv.slice(2).map(Number);
if (!(money > 0 && points > 0)) {
  console.error("usage: node scripts/scale-effects.mjs <moneyFactor> <pointFactor>");
  process.exit(1);
}
const dir = new URL("../src/data/content/cards/", import.meta.url);
const SPECIAL = new Set(["krisis.json", "debt-collector.json"]);
const MONEY = new Set(["dompet", "hutang"]);
const MONEY_STEP = 5000;
const scale = (stat, value) => MONEY.has(stat)
  ? Math.sign(value) * Math.max(MONEY_STEP, Math.round((Math.abs(value) * money) / MONEY_STEP) * MONEY_STEP)
  : Math.sign(value) * Math.max(1, Math.round(Math.abs(value) * points));

for (const name of readdirSync(dir).filter((file) => file.endsWith(".json") && !SPECIAL.has(file))) {
  const url = new URL(name, dir);
  const deck = JSON.parse(readFileSync(url, "utf8"));
  for (const card of deck.cards) for (const choice of card.choices)
    for (const stat of Object.keys(choice.effects)) choice.effects[stat] = scale(stat, choice.effects[stat]);
  writeFileSync(url, JSON.stringify(deck, null, 2) + "\n");
}
