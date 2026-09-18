import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MONEY = [2, 3, 4, 5, 6];
const POINTS = [1.5, 2, 2.5, 3, 3.5];
const cardsDir = new URL("../src/data/content/cards/", import.meta.url);
const names = readdirSync(cardsDir).filter((file) => file.endsWith(".json"));
const originals = new Map(names.map((name) => [name, readFileSync(new URL(name, cardsDir), "utf8")]));
const restore = () => { for (const [name, contents] of originals) writeFileSync(new URL(name, cardsDir), contents); };
const report = join(tmpdir(), "hidup-kok-gini-balance.json");
const run = (cmd, args, env = {}) => execFileSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env }, shell: process.platform === "win32" });
const results = [];

try {
  for (const money of MONEY) for (const points of POINTS) {
    restore();
    run("node", ["scripts/scale-effects.mjs", String(money), String(points)]);
    run("npx", ["vitest", "run", "src/game/balance.test.ts", "-t", "report"], { BALANCE_REPORT: report });
    const { metrics, missed, distance } = JSON.parse(readFileSync(report, "utf8"));
    results.push({ money, points, distance, missed, ...metrics });
    console.log(`money ×${money}, points ×${points}: ${missed.length ? missed.join("; ") : "all targets met"}`);
  }
} finally {
  restore();
}

results.sort((a, b) => a.distance - b.distance || a.money - b.money || a.points - b.points);
console.table(results.map(({ money, points, distance, dangerByJune, borrowed, crisisRecovery, comeback }) => ({
  money, points, distance: +distance.toFixed(3), dangerByJune, borrowed, crisisRecovery, comeback,
})));
const best = results[0];
run("node", ["scripts/scale-effects.mjs", String(best.money), String(best.points)]);
if (best.missed.length) {
  console.error(`Best combination still misses: ${best.missed.join("; ")}`);
  process.exit(1);
}
console.log(`Baked money ×${best.money}, points ×${best.points}.`);
