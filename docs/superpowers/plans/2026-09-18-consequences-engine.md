# Consequences Engine Implementation Plan (plan 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add hutang, stat-gated and status-gated choices, crises, statuses and the debt collector to the game engine, then tune card effect sizes until simulated games hit the "swingy with comebacks" targets.

**Architecture:** Every new rule is a pure, single-purpose module in `src/game/`: `debt.ts`, `statuses.ts`, `availability.ts`, and a status-aware `deck.ts`. They take their data catalogs as defaulted parameters, the same way `ending(player, endings = ENDINGS)` works today. New content fields are optional JSON keys, validated on load by the hand-written parsers in `src/data/parse/`. A seeded simulation (`src/game/simulation.ts`) measures balance. A tuner script grid-searches scale factors and bakes the best one into the card JSON.

**Tech Stack:** React 19, TypeScript 5.9 (strict), Vite 7, Vitest 5 (node environment). There are no new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-18-consequences-design.md`

**This is plan 1 of 3.**
- **Plan 2 (content)** writes the authored statuses, the ~95 hand-edited choices and the ~46 new cards, then re-runs the tuner.
- **Plan 3 (UI and docs)** shows hutang, locked and debt choices, status pills, crises and the receipt lines, then updates the docs.

Until plan 3 lands, hutang works in the engine but is not yet shown on screen. So all three plans are built on the branch `feature/consequences` and merged to `master` together.

## Spec adjustments made while planning

These refine the spec. Nothing here changes a decision the user made.

1. **The debt-collector threshold lives in one place:** the `dicari-debt-collector` trigger in `statuses.json` (`"above": 1000000`). `economy.json › debt` therefore has no `collectorThreshold` key.
2. **Every money shortfall is borrowed with the fee, not only card choices.** This includes a rare payday bill and a status payday effect, which keeps "Dompet never below Rp0" true everywhere.
3. **New draw order within a turn:** die → paycheck (5 draws, only when passing GAJIAN) → debt-collector chance (1 draw, only while `dicari-debt-collector` is active) → card pick → one draw per choice effect. Settling the paycheck before the draw means that a crisis caused by payday already changes which card comes up.
4. **What counts as a recovered crisis:** a crisis status that clears while the month is 1–11.

## Global Constraints

- **Code style:** file and folder names are kebab-case; exported React components stay PascalCase. No barrel files.
- **No new runtime or dev dependencies.** The scripts in `scripts/` use only Node built-ins.
- **Game content lives in JSON under `src/data/content/`,** validated by `src/data/parse/*`. Bad data throws `DataError` with a `file › path` message. Never `as`-cast unvalidated data.
- **JSON formatting:** `JSON.stringify(value, null, 2)` plus a trailing newline, LF line endings.
- **Determinism:** the engine stays deterministic. All randomness goes through `random()` in `src/game/random.ts`, and the draw order above is documented in code.
- **Money:** Dompet never ends an action below 0, and Hutang is never below 0. Kewarasan, Relasi and Hoki stay within 0–100.
- **Indonesian text** follows `docs/copy-guide.md` and passes `src/data/content.test.ts`:
  - write `nggak`, `udah`, `aja`, `bikin`, `banget` and `kamu`
  - no em dash (`—`)
  - no filler phrases from the lint list
  - lengths: title 4–42, description 25–150, label 4–40 (no final full stop), result 10–110
- **Numbers:** `feeRate 0.2`, `interestRate 0.1` (interest rounded down to Rp1,000), `installmentMax 500000`, `collectorChance 0.35`, debt-collector trigger `above 1000000`, danger line 20, crisis at 0, clear above 20.
- **Balance targets:**

  | Metric | Target |
  |---|---|
  | Players in a danger zone by the end of June | 0.45–0.60 |
  | Players who borrowed at least once | 0.25–0.40 |
  | Crises recovered | ≥ 0.60 |
  | Games with a comeback winner | ≥ 0.30 |

- **Commits:** every commit message ends with a blank line and `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`. Run `npm run typecheck` and `npm test` before each commit.

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/game/types.ts` | modify | `hutang` stat, statuses, choice/card gates, special decks, debt rules, paycheck lines |
| `src/game/stats.ts` | modify | stat lists, `isMoney`, raw `applyEffects`, `appliedChanges` reporting borrowing |
| `src/game/format.ts` | modify | Hutang label/icon, money formatting for hutang |
| `src/game/scoring.ts` | modify | `(Dompet − Hutang)` score |
| `src/game/debt.ts` | create | borrowing, fee, interest, instalment |
| `src/game/status-ids.ts` | create | ids the engine gives meaning to, and the `minta-tolong` tag |
| `src/game/statuses.ts` | create | gain/clear/expire, automatic triggers, payday effects, change diff |
| `src/game/availability.ts` | create | ok / debt / locked for a choice |
| `src/game/deck.ts` | modify | per-player pool: crisis override, debt-collector chance, follow-ups |
| `src/game/payday.ts` | modify | `settlePayday` after `rollPaycheck` |
| `src/game/reducer.ts` | modify | wires everything; locked choices rejected; statuses expire |
| `src/game/log-messages.ts` | modify | borrowing, status, interest and cicilan notes |
| `src/game/create-game.ts` | modify | `statuses: []` |
| `src/game/replay.ts`, `src/storage-keys.ts` | modify | save v5 |
| `src/game/simulation.ts` | create | seeded policies, balance metrics |
| `src/data/parse/parse-effects.ts` | create | effect parser shared by cards and statuses |
| `src/data/parse/parse-statuses.ts` | create | `statuses.json` |
| `src/data/parse/parse-cards.ts` | modify | new optional fields, special decks, status references |
| `src/data/parse/parse-board.ts` | modify | exported `parseTileMeta` |
| `src/data/parse/parse-economy.ts` | modify | `debt` block |
| `src/data/statuses.ts`, `src/data/special-decks.ts` | create | load and validate |
| `src/data/events.ts` | modify | `ALL_CARDS`, status reference check, `EVENT_BY_ID` over all decks |
| `src/data/content/statuses.json`, `special-decks.json`, `cards/krisis.json`, `cards/debt-collector.json` | create | data |
| `src/data/content/players.json`, `economy.json`, `endings.json` | modify | `hutang`, `debt`, first ending rule |
| `src/components/effects/effects.tsx`, `active-player/active-player.tsx`, `squad-dialog/player-card.tsx`, `event-panel/event-card.tsx` | modify | minimal changes so the UI keeps working until plan 3 |
| `scripts/scale-effects.mjs`, `scripts/tune-balance.mjs` | create | bake scale factors; grid-search them |
| tests | create/modify | `debt.test.ts`, `statuses.test.ts`, `availability.test.ts`, `deck.test.ts`, `balance.test.ts`, plus edits to existing tests |

---

### Task 1: Hutang stat and the new score

**Files:**
- Modify: `src/game/types.ts:11-12`
- Modify: `src/game/stats.ts`
- Modify: `src/game/format.ts`
- Modify: `src/game/scoring.ts:6-9`
- Modify: `src/components/effects/effects.tsx`, `src/components/active-player/active-player.tsx:4,36`, `src/components/squad-dialog/player-card.tsx:4,33`
- Modify: `src/data/content/players.json`, `src/data/content/endings.json`
- Test: `src/game/stats.test.ts`, `src/game/scoring.test.ts`, `src/data/content-fingerprint.test.ts`

**Interfaces:**
- Produces:
  - `type Stat = "dompet" | "kewarasan" | "relasi" | "hoki" | "hutang"`
  - `type BoundedStat = "kewarasan" | "relasi" | "hoki"`
  - `type MoneyStat = "dompet" | "hutang"`
  - `STATS: Stat[]` (all five)
  - `SHOWN_STATS: Stat[]` (four, for the UI until plan 3)
  - `BOUNDED_STATS: BoundedStat[]`
  - `isMoney(stat): stat is MoneyStat`
  - `applyEffects(stats, effects): Stats`: Dompet may go below 0 here; Hutang is floored at 0
  - `appliedChanges(before, after, effects): Partial<Stats>`: also reports a Hutang change

- [ ] **Step 0: Create the feature branch**

```bash
git switch -c feature/consequences
```

- [ ] **Step 1: Write the failing tests**

In `src/game/stats.test.ts`:
- Change the import on line 6 to `import { applyEffects, appliedChanges, randomizeEffects } from "./stats";`.
- Replace the whole test `"stat bounds preserve debt and report only actual applied changes"` (lines 30–59) with:

```ts
test("applyEffects clamps points, floors hutang at zero and leaves money settling to debt.ts", () => {
  const stats = applyEffects(
    { dompet: 0, kewarasan: 98, relasi: 2, hoki: 99, hutang: 50_000 },
    { dompet: -100_000, kewarasan: 20, relasi: -15, hoki: 5, hutang: -80_000 },
  );
  assert.deepEqual(stats, { dompet: -100_000, kewarasan: 100, relasi: 0, hoki: 100, hutang: 0 });
  const initial = createGame(["A", "B"], 1);
  const state: GameState = {
    ...initial,
    phase: "event",
    eventId: "kerja-1",
    choiceEffects: EVENT_BY_ID["kerja-1"].choices.map((choice) => choice.effects),
    players: initial.players.map((p) => ({
      ...p,
      stats: { ...p.stats, kewarasan: 2 },
    })),
  };
  const resolved = gameReducer(state, { type: "CHOOSE", index: 0 });
  assert.equal(resolved.lastEffects.kewarasan, -2);
  assert.equal(resolved.players[0].stats.kewarasan, 0);
});

test("applied changes report borrowing even when the choice never named hutang", () => {
  const before = { dompet: 100_000, kewarasan: 50, relasi: 50, hoki: 50, hutang: 0 };
  assert.deepEqual(
    appliedChanges(before, { ...before, dompet: 0, hutang: 120 }, { dompet: -100_100 }),
    { dompet: -100_000, hutang: 120 },
  );
});
```

Replace the body of `src/game/scoring.test.ts` from line 6 to the end with:

```ts
test("score counts every stat and subtracts hutang from Dompet with floor rounding", () => {
  const p = createGame(["A", "B"], 1).players[0];
  assert.equal(score(p), 175);
  assert.equal(
    score({
      ...p,
      stats: { dompet: 50_000, kewarasan: 20, relasi: 30, hoki: 40, hutang: 200_000 },
    }),
    88,
  );
  assert.equal(
    score({ ...p, id: 3 }),
    score(p),
    "tied stats have tied scores regardless of player order",
  );
  assert.equal(
    ending({ ...p, stats: { ...p.stats, hutang: 1 } }).title,
    "CEO Cicilan & Optimisme",
  );
});
```

In `src/data/content-fingerprint.test.ts`:
- Change both `test(` calls on lines 103 and 107 to `test.skip(`.
- Add this comment above the first one:

```ts
// Rules v5 in progress: both hashes are re-recorded in Task 10 of
// docs/superpowers/plans/2026-09-18-consequences-engine.md.
```

- Replace the seven ending probes (lines 59–65) with:

```ts
      { dompet: 0, kewarasan: 50, relasi: 50, hoki: 50, hutang: 1 },
      { dompet: 0, kewarasan: 25, relasi: 50, hoki: 50, hutang: 0 },
      { dompet: 0, kewarasan: 50, relasi: 75, hoki: 50, hutang: 0 },
      { dompet: 4_000_000, kewarasan: 50, relasi: 50, hoki: 50, hutang: 0 },
      { dompet: 0, kewarasan: 50, relasi: 50, hoki: 75, hutang: 0 },
      { dompet: 0, kewarasan: 75, relasi: 50, hoki: 50, hutang: 0 },
      { dompet: 0, kewarasan: 50, relasi: 50, hoki: 50, hutang: 0 },
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run typecheck`
Expected: FAIL. The errors say `hutang` does not exist on type `Stats`.

- [ ] **Step 3: Implement**

`src/game/types.ts`: replace lines 11–12 with:

```ts
export type Stat = "dompet" | "kewarasan" | "relasi" | "hoki" | "hutang";
export type BoundedStat = "kewarasan" | "relasi" | "hoki";
export type MoneyStat = "dompet" | "hutang";
export type Stats = Record<Stat, number>;
```

`src/game/stats.ts`: replace the whole file with:

```ts
import { pickIndex, random } from "./random";
import type { BoundedStat, MoneyStat, Stat, Stats } from "./types";

export const STATS: Stat[] = ["dompet", "kewarasan", "relasi", "hoki", "hutang"];
// The stats the player panels show until the hutang UI lands (plan 3).
export const SHOWN_STATS: Stat[] = ["dompet", "kewarasan", "relasi", "hoki"];
export const BOUNDED_STATS: BoundedStat[] = ["kewarasan", "relasi", "hoki"];
const MONEY_STATS: readonly Stat[] = ["dompet", "hutang"] satisfies MoneyStat[];

export const isMoney = (stat: Stat): stat is MoneyStat => MONEY_STATS.includes(stat);

const BOUNDED_MIN = 0;
const BOUNDED_MAX = 100;
const MONEY_STEP = 5_000;
const MIN_SWING = 0.6;
const MAX_SWING = 1.4;

const clamp = (value: number) => Math.max(BOUNDED_MIN, Math.min(BOUNDED_MAX, value));

// Dompet may dip below zero here; debt.ts turns any shortfall into hutang.
export function applyEffects(stats: Stats, effects: Partial<Stats>): Stats {
  return {
    dompet: stats.dompet + (effects.dompet ?? 0),
    kewarasan: clamp(stats.kewarasan + (effects.kewarasan ?? 0)),
    relasi: clamp(stats.relasi + (effects.relasi ?? 0)),
    hoki: clamp(stats.hoki + (effects.hoki ?? 0)),
    hutang: Math.max(0, stats.hutang + (effects.hutang ?? 0)),
  };
}

// The change each effect really made once bounds were applied. Borrowing moves
// hutang even when the choice never mentioned it, so that change is reported too.
export function appliedChanges(before: Stats, after: Stats, effects: Partial<Stats>): Partial<Stats> {
  const changes: Partial<Stats> = {};
  for (const stat of Object.keys(effects) as Stat[]) changes[stat] = after[stat] - before[stat];
  if (after.hutang !== before.hutang) changes.hutang = after.hutang - before.hutang;
  return changes;
}

// Keeps each effect's direction and varies its size within 60–140%, one draw per
// effect in written order. Money moves in Rp5.000 steps, other stats in whole points.
export function randomizeEffects(effects: Partial<Stats>, seed: number) {
  let rng = seed;
  const rolled: Partial<Stats> = {};
  for (const [key, value] of Object.entries(effects)) {
    const stat = key as Stat;
    if (value === 0) {
      rolled[stat] = 0;
      continue;
    }
    const step = isMoney(stat) ? MONEY_STEP : 1;
    const min = Math.ceil((Math.abs(value) * MIN_SWING) / step);
    const max = Math.floor((Math.abs(value) * MAX_SWING) / step);
    if (max < min) {
      rolled[stat] = value;
      continue;
    }
    const draw = random(rng);
    rng = draw.rng;
    rolled[stat] = Math.sign(value) * (min + pickIndex(draw.value, max - min + 1)) * step;
  }
  return { rng, effects: rolled };
}
```

`src/game/format.ts`:
- Change the first line to `import { isMoney } from "./stats";` followed by `import type { Stat } from "./types";`.
- Add `hutang: "Hutang",` to `STAT_LABELS` and `hutang: "receipt",` to `STAT_ICONS`, each as the last entry.
- Replace `effectLabel` with:

```ts
export function effectLabel(stat: Stat, value: number): string {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${isMoney(stat) ? shortMoney(Math.abs(value)) : Math.abs(value)}`;
}
```

`src/game/scoring.ts`: replace lines 6–9 with:

```ts
// Hutang counts against Dompet, so a debt-free wallet always beats a borrowed one.
export function score(player: Player): number {
  const { dompet, hutang, kewarasan, relasi, hoki } = player.stats;
  return Math.floor((dompet - hutang) / RUPIAH_PER_POINT) + kewarasan + relasi + hoki;
}
```

`src/components/effects/effects.tsx`: replace the `.map(...)` callback so that the colours flip for hutang:

```tsx
      {(Object.entries(effects) as [Stat, number][]).map(([stat, value]) => {
        // More hutang is bad news, so its colours run the other way.
        const good = stat === "hutang" ? value <= 0 : value >= 0;
        return (
          <span
            key={stat}
            className={`effect ${good ? "effect-positive" : "effect-negative"}`}
            title={`${STAT_LABELS[stat]} ${effectLabel(stat, value)}`}
          >
            <Icon name={STAT_ICONS[stat]} size={13} />
            <span className="sr-only">{STAT_LABELS[stat]} </span>
            {effectLabel(stat, value)}
          </span>
        );
      })}
```

`src/components/active-player/active-player.tsx` and `src/components/squad-dialog/player-card.tsx`: in both files, change `import { STATS } from "../../game/stats";` to `import { SHOWN_STATS } from "../../game/stats";`, and change `STATS.map(` to `SHOWN_STATS.map(`.

`src/data/content/players.json`: add `"hutang": 0` as the last key of `initialStats`.

`src/data/content/endings.json`: in `rules[0].when`, replace `"stat": "dompet", "below": 0` with `"stat": "hutang", "atLeast": 1`. Keep the title and text.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: typecheck is clean. All tests pass except the two skipped fingerprint tests, which report as skipped.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add hutang as a stat and count it against Dompet in the score

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Borrowing, interest and cicilan

**Files:**
- Create: `src/game/debt.ts`
- Create: `src/game/debt.test.ts`
- Modify: `src/game/types.ts` (the `Economy` interface)
- Modify: `src/data/parse/parse-economy.ts`
- Modify: `src/data/content/economy.json`
- Test: `src/data/parse/parse.test.ts:35-43`

**Interfaces:**
- Consumes: `applyEffects` (Task 1)
- Produces:
  - `interface DebtRules { feeRate: number; interestRate: number; installmentMax: number; collectorChance: number }`
  - `Economy.debt: DebtRules`
  - `borrowCost(shortfall: number, debt?: DebtRules): number`
  - `coverShortfall(stats: Stats, debt?: DebtRules): Stats`
  - `applyWithDebt(stats: Stats, effects: Partial<Stats>, debt?: DebtRules): Stats`
  - `chargeDebt(stats: Stats, debt?: DebtRules): { stats: Stats; interest: number; installment: number }`

- [ ] **Step 1: Write the failing tests**

Create `src/game/debt.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "vitest";
import { applyWithDebt, borrowCost, chargeDebt } from "./debt";
import type { DebtRules, Stats } from "./types";

const RULES: DebtRules = { feeRate: 0.2, interestRate: 0.1, installmentMax: 500_000, collectorChance: 0.35 };
const stats = (dompet: number, hutang = 0): Stats => ({ dompet, kewarasan: 50, relasi: 50, hoki: 50, hutang });

test("borrowing adds the shortfall plus a 20% fee, rounded up", () => {
  assert.equal(borrowCost(100, RULES), 120);
  assert.equal(borrowCost(1, RULES), 2);
  assert.equal(borrowCost(250_000, RULES), 300_000);
});

test("a cost the wallet can't cover empties Dompet and books the rest as hutang", () => {
  assert.deepEqual(applyWithDebt(stats(100_000), { dompet: -100_100 }, RULES), stats(0, 120));
  assert.deepEqual(applyWithDebt(stats(100_000), { dompet: -100_000 }, RULES), stats(0, 0));
  assert.deepEqual(
    applyWithDebt(stats(0, 500), { dompet: 50_000 }, RULES),
    stats(50_000, 500),
    "income never repays hutang by itself",
  );
});

test("payday charges interest in Rp1.000 steps, then a capped instalment", () => {
  assert.deepEqual(chargeDebt(stats(2_000_000, 1_234_567), RULES), {
    stats: stats(1_500_000, 857_567),
    interest: 123_000,
    installment: 500_000,
  });
  assert.deepEqual(
    chargeDebt(stats(80_000, 300_000), RULES),
    { stats: stats(0, 250_000), interest: 30_000, installment: 80_000 },
    "a thin wallet pays what it can",
  );
  assert.deepEqual(chargeDebt(stats(900_000, 5_000), RULES), {
    stats: stats(895_000, 0),
    interest: 0,
    installment: 5_000,
  });
  assert.deepEqual(chargeDebt(stats(900_000), RULES), { stats: stats(900_000), interest: 0, installment: 0 });
});
```

In `src/data/parse/parse.test.ts`, replace the test `"money ranges must step evenly from min to max"` with:

```ts
test("money ranges must step evenly from min to max, and debt rates are fractions", () => {
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/debt.test.ts src/data/parse/parse.test.ts`
Expected: FAIL. `debt.test.ts` cannot resolve `./debt`, and the parse test fails on `debt.feeRate`.

- [ ] **Step 3: Implement**

`src/game/types.ts`: add this before `export interface Economy`:

```ts
export interface DebtRules {
  feeRate: number;
  interestRate: number;
  installmentMax: number;
  collectorChance: number;
}
```

Then add `debt: DebtRules;` as the last field of `Economy`.

`src/data/parse/parse-economy.ts`:
- Change the type import to `import type { DebtRules, Economy, MoneyRange, PaydayReasons } from "../../game/types";`.
- Add this function after `parseMoneyRange`:

```ts
function parseDebt(value: unknown, path: string): DebtRules {
  const fields = expectRecord(value, path);
  const installmentMax = expectInteger(fields.installmentMax, `${path}.installmentMax`);
  if (installmentMax <= 0) throw new DataError(`${path}.installmentMax`, "expected a positive amount");
  return {
    feeRate: expectFraction(fields.feeRate, `${path}.feeRate`),
    interestRate: expectFraction(fields.interestRate, `${path}.interestRate`),
    installmentMax,
    collectorChance: expectFraction(fields.collectorChance, `${path}.collectorChance`),
  };
}
```

- Add `debt: parseDebt(fields.debt, `${file} › debt`),` as the last field returned by `parseEconomy`.

`src/data/content/economy.json`: add this as the last key:

```json
  "debt": {
    "feeRate": 0.2,
    "interestRate": 0.1,
    "installmentMax": 500000,
    "collectorChance": 0.35
  }
```

Create `src/game/debt.ts`:

```ts
import { ECONOMY } from "../data/economy";
import { applyEffects } from "./stats";
import type { DebtRules, Stats } from "./types";

const INTEREST_STEP = 1_000;
// Rates are applied in whole permille so the rupiah maths stays exact.
const permille = (rate: number) => Math.round(rate * 1000);

// What borrowing `shortfall` adds to hutang: the shortfall plus the collector's fee, rounded up.
export function borrowCost(shortfall: number, debt: DebtRules = ECONOMY.debt): number {
  return shortfall + Math.ceil((shortfall * permille(debt.feeRate)) / 1000);
}

// Dompet never stays below zero: whatever is missing is borrowed from the debt collector.
export function coverShortfall(stats: Stats, debt: DebtRules = ECONOMY.debt): Stats {
  if (stats.dompet >= 0) return stats;
  return { ...stats, dompet: 0, hutang: stats.hutang + borrowCost(-stats.dompet, debt) };
}

export function applyWithDebt(stats: Stats, effects: Partial<Stats>, debt: DebtRules = ECONOMY.debt): Stats {
  return coverShortfall(applyEffects(stats, effects), debt);
}

export interface DebtCharge {
  stats: Stats;
  interest: number;
  installment: number;
}

// Payday order: interest first, then the collector takes what the wallet can spare, up to the cap.
export function chargeDebt(stats: Stats, debt: DebtRules = ECONOMY.debt): DebtCharge {
  const interest =
    Math.floor((stats.hutang * permille(debt.interestRate)) / (1000 * INTEREST_STEP)) * INTEREST_STEP;
  const owed = stats.hutang + interest;
  const installment = Math.min(owed, debt.installmentMax, stats.dompet);
  return {
    stats: { ...stats, dompet: stats.dompet - installment, hutang: owed - installment },
    interest,
    installment,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: all pass (the two fingerprint tests are still skipped).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add debt rules: borrowing fee, payday interest and cicilan

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Statuses and automatic crises

**Files:**
- Create: `src/game/status-ids.ts`, `src/game/statuses.ts`, `src/game/statuses.test.ts`
- Create: `src/data/parse/parse-effects.ts`, `src/data/parse/parse-statuses.ts`, `src/data/statuses.ts`, `src/data/content/statuses.json`
- Modify: `src/data/parse/parse-cards.ts:1-16`, `src/game/types.ts`, `src/game/create-game.ts:21-26`
- Test: `src/data/parse/parse.test.ts`, `src/data/content-fingerprint.test.ts:31`

**Interfaces:**
- Consumes: `STATS`, `BOUNDED_STATS` (Task 1)
- Produces:
  - Types: `StatusTrigger`, `StatusDef`, `StatusCatalog = Record<string, StatusDef>`, `ActiveStatus { id: string; untilMonth: number | null }`, `StatusEffect { status: string; effects: Partial<Stats> }`, and `Player.statuses: ActiveStatus[]`
  - From `status-ids.ts`: `BURNOUT`, `GHOSTED`, `APES`, `DEBT_COLLECTOR`, `AUTOMATIC_STATUS_IDS`, `HELP_TAG = "minta-tolong"`
  - From `statuses.ts`:
    - `hasStatus(player: Pick<Player, "statuses">, id: string): boolean`
    - `gainStatuses(statuses, ids, month, catalog?)`
    - `clearStatuses(statuses, ids)`
    - `expireStatuses(statuses, month)`
    - `syncAutomatic(statuses, stats, catalog?)`
    - `paydayEffects(statuses, catalog?): StatusEffect[]`
    - `statusChanges(before, after): { gained: string[]; lost: string[] }`
    - `statusLabel(id, catalog?): string`
  - From `data/statuses.ts`: `STATUSES: StatusCatalog`
  - From `parse-effects.ts`: `parseEffects(value, path): Partial<Stats>`

- [ ] **Step 1: Write the failing tests**

Create `src/game/statuses.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "vitest";
import { STATUSES } from "../data/statuses";
import { AUTOMATIC_STATUS_IDS } from "./status-ids";
import {
  clearStatuses,
  expireStatuses,
  gainStatuses,
  paydayEffects,
  statusChanges,
  syncAutomatic,
} from "./statuses";
import type { ActiveStatus, StatusCatalog, Stats } from "./types";

const CATALOG: StatusCatalog = {
  "kerja-sampingan": {
    id: "kerja-sampingan", label: "Kerja sampingan", icon: "briefcase", months: 3,
    payday: { dompet: 300_000, kewarasan: -5 }, trigger: null,
  },
  "punya-pacar": { id: "punya-pacar", label: "Punya pacar", icon: "heart", months: null, payday: {}, trigger: null },
  burnout: {
    id: "burnout", label: "Burnout", icon: "brain", months: null, payday: {},
    trigger: { stat: "kewarasan", atMost: 0, clearAbove: 20 },
  },
  "dicari-debt-collector": {
    id: "dicari-debt-collector", label: "Dicari debt collector", icon: "receipt", months: null, payday: {},
    trigger: { stat: "hutang", above: 1_000_000 },
  },
};
const stats = (patch: Partial<Stats> = {}): Stats => ({
  dompet: 0, kewarasan: 50, relasi: 50, hoki: 50, hutang: 0, ...patch,
});

test("gaining sets an end month, and gaining again restarts the clock without duplicates", () => {
  const once = gainStatuses([], ["kerja-sampingan"], 3, CATALOG);
  assert.deepEqual(once, [{ id: "kerja-sampingan", untilMonth: 6 }]);
  assert.deepEqual(gainStatuses(once, ["kerja-sampingan"], 5, CATALOG), [{ id: "kerja-sampingan", untilMonth: 8 }]);
  assert.deepEqual(gainStatuses([], ["punya-pacar"], 3, CATALOG), [{ id: "punya-pacar", untilMonth: null }]);
});

test("a status gained in month m with n months is gone once month m + n begins", () => {
  const statuses: ActiveStatus[] = [
    { id: "kerja-sampingan", untilMonth: 6 },
    { id: "punya-pacar", untilMonth: null },
  ];
  assert.equal(expireStatuses(statuses, 5), statuses, "nothing expired keeps the same list");
  assert.deepEqual(expireStatuses(statuses, 6), [{ id: "punya-pacar", untilMonth: null }]);
  assert.deepEqual(clearStatuses(statuses, ["punya-pacar"]), [{ id: "kerja-sampingan", untilMonth: 6 }]);
});

test("a crisis starts at its floor and lasts until the stat climbs back above its clear line", () => {
  const burnt = syncAutomatic([], stats({ kewarasan: 0 }), CATALOG);
  assert.deepEqual(burnt, [{ id: "burnout", untilMonth: null }]);
  assert.equal(syncAutomatic(burnt, stats({ kewarasan: 20 }), CATALOG), burnt);
  assert.deepEqual(syncAutomatic(burnt, stats({ kewarasan: 21 }), CATALOG), []);
  assert.deepEqual(syncAutomatic([], stats({ kewarasan: 15 }), CATALOG), [], "low but not zero is only the danger zone");
});

test("the debt collector marks anyone owing more than Rp1.000.000", () => {
  assert.deepEqual(syncAutomatic([], stats({ hutang: 1_000_001 }), CATALOG), [
    { id: "dicari-debt-collector", untilMonth: null },
  ]);
  assert.deepEqual(syncAutomatic([], stats({ hutang: 1_000_000 }), CATALOG), []);
});

test("payday effects come from active statuses that have one, in the order they were gained", () => {
  const statuses: ActiveStatus[] = [
    { id: "punya-pacar", untilMonth: null },
    { id: "kerja-sampingan", untilMonth: 6 },
  ];
  assert.deepEqual(paydayEffects(statuses, CATALOG), [
    { status: "kerja-sampingan", effects: { dompet: 300_000, kewarasan: -5 } },
  ]);
});

test("status changes list what was gained and lost", () => {
  assert.deepEqual(
    statusChanges(
      [{ id: "punya-pacar", untilMonth: null }],
      [{ id: "kerja-sampingan", untilMonth: 6 }],
    ),
    { gained: ["kerja-sampingan"], lost: ["punya-pacar"] },
  );
});

test("statuses.json ships every automatic status with a trigger", () => {
  for (const id of AUTOMATIC_STATUS_IDS) assert.ok(STATUSES[id]?.trigger, id);
});
```

Append to `src/data/parse/parse.test.ts`:
- Add `import { parseStatuses } from "./parse-statuses";` to the imports.
- Append this test:

```ts
test("statuses need their automatic entries, and a trigger never has a month count", () => {
  const auto = (stat: string) => ({ label: "Krisis", icon: "brain", trigger: { stat, atMost: 0, clearAbove: 20 } });
  const catalog = {
    burnout: auto("kewarasan"),
    ghosted: auto("relasi"),
    apes: auto("hoki"),
    "dicari-debt-collector": { label: "Dicari", icon: "receipt", trigger: { stat: "hutang", above: 1_000_000 } },
  };
  assert.doesNotThrow(() => parseStatuses(catalog));
  const withoutApes = Object.fromEntries(Object.entries(catalog).filter(([id]) => id !== "apes"));
  assert.throws(() => parseStatuses(withoutApes), /statuses\.json › apes: this automatic status must exist/);
  assert.throws(
    () => parseStatuses({ ...catalog, burnout: { ...catalog.burnout, months: 2 } }),
    /statuses\.json › burnout: an automatic status ends by its trigger/,
  );
  assert.throws(
    () => parseStatuses({ ...catalog, gym: { label: "Gym", icon: "heart", payday: { dompt: 1 } } }),
    /statuses\.json › gym\.payday\.dompt: expected one of/,
  );
});
```

In `src/data/content-fingerprint.test.ts` line 31, make the probe a complete player:

```ts
const endingProbe = (stats: Stats): Player => ({ id: 0, name: "Probe", position: 0, stats, statuses: [] });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/statuses.test.ts src/data/parse/parse.test.ts`
Expected: FAIL. The modules `../data/statuses`, `./status-ids`, `./statuses` and `./parse-statuses` are not found.

- [ ] **Step 3: Implement**

`src/game/types.ts`:
- Add these after `export type Stats = ...`:

```ts
export type StatusTrigger =
  | { stat: BoundedStat; atMost: number; clearAbove: number }
  | { stat: "hutang"; above: number };
export interface StatusDef {
  id: string;
  label: string;
  icon: string;
  months: number | null;
  payday: Partial<Stats>;
  trigger: StatusTrigger | null;
}
export type StatusCatalog = Record<string, StatusDef>;
export interface ActiveStatus {
  id: string;
  untilMonth: number | null;
}
export interface StatusEffect {
  status: string;
  effects: Partial<Stats>;
}
```

- Add `statuses: ActiveStatus[];` as the last field of `Player`.

Create `src/game/status-ids.ts`:

```ts
// Statuses the rules give meaning to. Their labels and triggers live in statuses.json.
export const BURNOUT = "burnout";
export const GHOSTED = "ghosted";
export const APES = "apes";
export const DEBT_COLLECTOR = "dicari-debt-collector";
export const AUTOMATIC_STATUS_IDS = [BURNOUT, GHOSTED, APES, DEBT_COLLECTOR] as const;

// Choices tagged with this are the "ask someone for help" options that GHOSTED locks.
export const HELP_TAG = "minta-tolong";
```

Create `src/data/parse/parse-effects.ts` by moving `parseEffects` out of `parse-cards.ts` unchanged:

```ts
import { STATS } from "../../game/stats";
import type { Stats } from "../../game/types";
import { DataError } from "./data-error";
import { expectInteger, expectOneOf, expectRecord } from "./primitives";

// Effects keep the order they are written in: the engine draws one random
// number per effect in that order, so reordering would change saved games.
export function parseEffects(value: unknown, path: string): Partial<Stats> {
  const effects: Partial<Stats> = {};
  for (const [key, amount] of Object.entries(expectRecord(value, path))) {
    const stat = expectOneOf(key, STATS, `${path}.${key}`);
    effects[stat] = expectInteger(amount, `${path}.${key}`);
  }
  if (Object.keys(effects).length === 0) throw new DataError(path, "a choice needs at least one effect");
  return effects;
}
```

In `src/data/parse/parse-cards.ts`:
- Delete lines 1 and 6–16 (the `STATS` import and `parseEffects`).
- Change the imports to:

```ts
import type { Category, Choice, EventCard } from "../../game/types";
import { DataError } from "./data-error";
import { parseEffects } from "./parse-effects";
import { expectArray, expectRecord, expectText } from "./primitives";
```

`noUnusedLocals` is on, so `expectInteger` and `expectOneOf` must leave this import. Task 4 adds back what it needs.

Create `src/data/parse/parse-statuses.ts`:

```ts
import { BOUNDED_STATS } from "../../game/stats";
import { AUTOMATIC_STATUS_IDS } from "../../game/status-ids";
import type { StatusCatalog, StatusDef, StatusTrigger } from "../../game/types";
import { DataError } from "./data-error";
import { parseEffects } from "./parse-effects";
import { expectInteger, expectOneOf, expectRecord, expectText } from "./primitives";

function parseTrigger(value: unknown, path: string): StatusTrigger {
  const fields = expectRecord(value, path);
  if (fields.stat === "hutang") return { stat: "hutang", above: expectInteger(fields.above, `${path}.above`) };
  const stat = expectOneOf(fields.stat, BOUNDED_STATS, `${path}.stat`);
  const atMost = expectInteger(fields.atMost, `${path}.atMost`);
  const clearAbove = expectInteger(fields.clearAbove, `${path}.clearAbove`);
  if (clearAbove < atMost) throw new DataError(path, "clearAbove must be at least atMost");
  return { stat, atMost, clearAbove };
}

function parseStatus(id: string, value: unknown, path: string): StatusDef {
  const fields = expectRecord(value, path);
  const months = fields.months === undefined || fields.months === null
    ? null
    : expectInteger(fields.months, `${path}.months`);
  if (months !== null && months < 1) throw new DataError(`${path}.months`, "expected at least 1");
  const trigger = fields.trigger === undefined ? null : parseTrigger(fields.trigger, `${path}.trigger`);
  if (trigger && months !== null) throw new DataError(path, "an automatic status ends by its trigger, not by months");
  return {
    id,
    label: expectText(fields.label, `${path}.label`),
    icon: expectText(fields.icon, `${path}.icon`),
    months,
    payday: fields.payday === undefined ? {} : parseEffects(fields.payday, `${path}.payday`),
    trigger,
  };
}

export function parseStatuses(json: unknown): StatusCatalog {
  const file = "statuses.json";
  const catalog: StatusCatalog = {};
  for (const [id, value] of Object.entries(expectRecord(json, file)))
    catalog[id] = parseStatus(id, value, `${file} › ${id}`);
  for (const id of AUTOMATIC_STATUS_IDS)
    if (!catalog[id]?.trigger)
      throw new DataError(`${file} › ${id}`, "this automatic status must exist and have a trigger");
  return catalog;
}
```

Create `src/data/content/statuses.json`:

```json
{
  "burnout": {
    "label": "Burnout",
    "icon": "brain",
    "trigger": {
      "stat": "kewarasan",
      "atMost": 0,
      "clearAbove": 20
    }
  },
  "ghosted": {
    "label": "Di-ghosting semua orang",
    "icon": "chat",
    "trigger": {
      "stat": "relasi",
      "atMost": 0,
      "clearAbove": 20
    }
  },
  "apes": {
    "label": "Lagi apes",
    "icon": "dice",
    "trigger": {
      "stat": "hoki",
      "atMost": 0,
      "clearAbove": 20
    }
  },
  "dicari-debt-collector": {
    "label": "Dicari debt collector",
    "icon": "receipt",
    "trigger": {
      "stat": "hutang",
      "above": 1000000
    }
  }
}
```

Create `src/data/statuses.ts`:

```ts
import statusesJson from "./content/statuses.json";
import { parseStatuses } from "./parse/parse-statuses";

export const STATUSES = parseStatuses(statusesJson);
```

Create `src/game/statuses.ts`:

```ts
import { STATUSES } from "../data/statuses";
import type { ActiveStatus, Player, StatusCatalog, StatusEffect, StatusTrigger, Stats } from "./types";

export const hasStatus = (player: Pick<Player, "statuses">, id: string) =>
  player.statuses.some((status) => status.id === id);

// Gaining a status the player already has restarts its clock.
export function gainStatuses(
  statuses: ActiveStatus[],
  ids: string[],
  month: number,
  catalog: StatusCatalog = STATUSES,
): ActiveStatus[] {
  let next = statuses;
  for (const id of ids) {
    const { months } = catalog[id];
    next = [...next.filter((status) => status.id !== id), { id, untilMonth: months === null ? null : month + months }];
  }
  return next;
}

export function clearStatuses(statuses: ActiveStatus[], ids: string[]): ActiveStatus[] {
  return ids.length ? statuses.filter((status) => !ids.includes(status.id)) : statuses;
}

// A status gained in month m with `months: n` is gone once month m + n begins.
export function expireStatuses(statuses: ActiveStatus[], month: number): ActiveStatus[] {
  const kept = statuses.filter((status) => status.untilMonth === null || month < status.untilMonth);
  return kept.length === statuses.length ? statuses : kept;
}

function triggered(trigger: StatusTrigger, stats: Stats, active: boolean): boolean {
  if (trigger.stat === "hutang") return stats.hutang > trigger.above;
  const value = stats[trigger.stat];
  return active ? value <= trigger.clearAbove : value <= trigger.atMost;
}

// Automatic statuses follow the stats: a crisis starts at its floor and lasts
// until the stat climbs back above its clear line.
export function syncAutomatic(
  statuses: ActiveStatus[],
  stats: Stats,
  catalog: StatusCatalog = STATUSES,
): ActiveStatus[] {
  let next = statuses;
  for (const def of Object.values(catalog)) {
    if (!def.trigger) continue;
    const active = next.some((status) => status.id === def.id);
    const should = triggered(def.trigger, stats, active);
    if (should && !active) next = [...next, { id: def.id, untilMonth: null }];
    if (!should && active) next = next.filter((status) => status.id !== def.id);
  }
  return next;
}

export function paydayEffects(statuses: ActiveStatus[], catalog: StatusCatalog = STATUSES): StatusEffect[] {
  return statuses.flatMap(({ id }) => {
    const { payday } = catalog[id];
    return Object.keys(payday).length ? [{ status: id, effects: payday }] : [];
  });
}

export function statusChanges(before: ActiveStatus[], after: ActiveStatus[]) {
  const had = new Set(before.map((status) => status.id));
  const has = new Set(after.map((status) => status.id));
  return {
    gained: after.filter((status) => !had.has(status.id)).map((status) => status.id),
    lost: before.filter((status) => !has.has(status.id)).map((status) => status.id),
  };
}

export const statusLabel = (id: string, catalog: StatusCatalog = STATUSES) => catalog[id].label;
```

`src/game/create-game.ts`: add `statuses: [],` after `stats: { ...INITIAL_STATS },` in the player object.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add statuses with automatic burnout, ghosted, apes and debt-collector marks

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Card gates, special decks and starter crisis cards

**Files:**
- Create: `src/data/special-decks.ts`, `src/data/content/special-decks.json`, `src/data/content/cards/krisis.json`, `src/data/content/cards/debt-collector.json`
- Modify: `src/game/types.ts` (`Choice`, `EventCard`), `src/data/parse/parse-cards.ts`, `src/data/parse/parse-board.ts:9-24`, `src/data/events.ts`, `src/data/content/statuses.json`, `src/components/event-panel/event-card.tsx:1,16`
- Test: `src/data/parse/parse.test.ts`, `src/data/content.test.ts`

**Interfaces:**
- Consumes: `STATUSES`, `HELP_TAG`, `BOUNDED_STATS`, `parseEffects` (Tasks 1 and 3)
- Produces:
  - Types:
    - `SpecialDeck = "krisis" | "debt-collector"`
    - `DeckId = Category | SpecialDeck`
    - `Crisis = "burnout" | "apes"`
    - `StatRequirement = Partial<Record<BoundedStat, number>>`
    - `Choice` gains `requires`, `requiresStatus`, `blockedByStatus`, `gains`, `clears`, `tags`
    - `EventCard.category: DeckId`, plus `requiresStatus: string | null` and `crisis: Crisis | null`
  - `parseDeck(json, deck: DeckId)`
  - `assertStatusRefs(cards, catalog)`
  - `parseTileMeta(value, path)`
  - `KRISIS_CARDS`, `COLLECTOR_CARDS`, `DECK_META: Record<DeckId, TileMeta>`
  - `ALL_CARDS`; `EVENT_BY_ID` now covers all decks
  - The status `utang-ke-teman` (no end month)
  - Card `debt-collector-1` choice index 2: requires Relasi 40, tagged `minta-tolong`, gains `utang-ke-teman`

- [ ] **Step 1: Write the failing tests**

Append to `src/data/parse/parse.test.ts`:
- Add `import { assertStatusRefs } from "./parse-cards";` to the imports; it joins the existing `parseDeck` import.
- Append these tests:

```ts
test("choice gates are validated: requirement stats, crisis tags and status references", () => {
  const gated = (choice: Record<string, unknown>) => ({
    ...deck({ hoki: 3 }),
    cards: [{ ...deck({ hoki: 3 }).cards[0], choices: [choice, deck({ hoki: 3 }).cards[0].choices[1]] }],
  });
  const base = { label: "Satu", effects: { hoki: 3 }, result: "Akibat satu." };
  const [card] = parseDeck(gated({ ...base, requires: { relasi: 30 }, tags: ["minta-tolong"], gains: ["punya-pacar"] }), "ojol");
  assert.deepEqual(card.choices[0].requires, { relasi: 30 });
  assert.deepEqual(card.choices[1].requires, {}, "missing gates default to none");
  assert.equal(card.crisis, null);
  assert.throws(() => parseDeck(gated({ ...base, requires: { dompet: 5 } }), "ojol"), /requires\.dompet: expected one of/);
  assert.throws(() => parseDeck({ ...deck({ hoki: 3 }), category: "krisis" }, "krisis"), /krisis cards need a crisis/);
  const catalog = {
    ghosted: { id: "ghosted", label: "G", icon: "chat", months: null, payday: {}, trigger: { stat: "relasi" as const, atMost: 0, clearAbove: 20 } },
  };
  assert.throws(() => assertStatusRefs([card], catalog), /unknown status "punya-pacar"/);
  const [automatic] = parseDeck(gated({ ...base, gains: ["ghosted"] }), "ojol");
  assert.throws(() => assertStatusRefs([automatic], catalog), /"ghosted" is automatic/);
});
```

In `src/data/content.test.ts`:
- Replace the imports with:

```ts
import { test } from "vitest";
import assert from "node:assert/strict";
import { HELP_TAG } from "../game/status-ids";
import type { Choice } from "../game/types";
import { MONTHLY_NOTES } from "./calendar";
import { CATEGORIES } from "./categories";
import { PAYDAY_REASONS } from "./economy";
import { EVENTS } from "./events";
import { INITIAL_STATS } from "./players";
import { COLLECTOR_CARDS, KRISIS_CARDS } from "./special-decks";

const SPECIAL_CARDS = [...KRISIS_CARDS, ...COLLECTOR_CARDS];
```

- In `cardLines`, change `EVENTS.flatMap(` to `[...EVENTS, ...SPECIAL_CARDS].flatMap(`.
- In the test `"card parts stay inside their length limits"`, change `for (const event of EVENTS)` to `for (const event of [...EVENTS, ...SPECIAL_CARDS])`.
- Append these tests:

```ts
const alwaysOpen = (choice: Choice) =>
  Object.keys(choice.requires).length === 0 &&
  choice.requiresStatus === null &&
  choice.blockedByStatus === null &&
  !choice.tags.includes(HELP_TAG);

test("every card keeps at least one choice open whatever state the player is in", () => {
  const stuck = [...EVENTS, ...SPECIAL_CARDS].filter((event) => !event.choices.some(alwaysOpen));
  assert.deepEqual(stuck.map((event) => event.id), []);
});

test("every crisis card offers a way back up, and the special decks are stocked", () => {
  const burnout = KRISIS_CARDS.filter((card) => card.crisis === "burnout");
  const apes = KRISIS_CARDS.filter((card) => card.crisis === "apes");
  assert.ok(burnout.length >= 2 && apes.length >= 2 && COLLECTOR_CARDS.length >= 3);
  for (const card of burnout)
    assert.ok(card.choices.some((c) => alwaysOpen(c) && (c.effects.kewarasan ?? 0) > 0), `${card.id} needs an open Kewarasan choice`);
  for (const card of apes)
    assert.ok(card.choices.some((c) => alwaysOpen(c) && (c.effects.hoki ?? 0) > 0), `${card.id} needs an open Hoki choice`);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data`
Expected: FAIL. `./special-decks` is not found, and `assertStatusRefs` is not exported.

- [ ] **Step 3: Implement**

`src/game/types.ts`:
- Add after `export type Category = ...`:

```ts
export type SpecialDeck = "krisis" | "debt-collector";
export type DeckId = Category | SpecialDeck;
export type Crisis = "burnout" | "apes";
```

- Add after `export type Stats = ...`: `export type StatRequirement = Partial<Record<BoundedStat, number>>;`
- Replace `Choice` and `EventCard` with:

```ts
export interface Choice {
  label: string;
  effects: Partial<Stats>;
  result: string;
  requires: StatRequirement;
  requiresStatus: string | null;
  blockedByStatus: string | null;
  gains: string[];
  clears: string[];
  tags: string[];
}
export interface EventCard {
  id: string;
  category: DeckId;
  title: string;
  description: string;
  choices: Choice[];
  // A follow-up card: only drawn by players who have this status.
  requiresStatus: string | null;
  // Only on krisis cards: which crisis draws it.
  crisis: Crisis | null;
}
```

`src/data/parse/parse-board.ts`: add `parseTileMeta` and use it inside `parseCategories`:

```ts
export function parseTileMeta(value: unknown, path: string): TileMeta {
  const meta = expectRecord(value, path);
  return {
    label: expectText(meta.label, `${path}.label`),
    icon: expectText(meta.icon, `${path}.icon`),
    color: expectText(meta.color, `${path}.color`),
  };
}
```

and in `parseCategories`, replace lines 16–21 with `categories[kind] = parseTileMeta(fields[kind], `${file} › ${kind}`);`.

`src/data/parse/parse-cards.ts`: replace the whole file with:

```ts
import { BOUNDED_STATS } from "../../game/stats";
import type { Choice, Crisis, DeckId, EventCard, StatRequirement, StatusCatalog } from "../../game/types";
import { DataError } from "./data-error";
import { parseEffects } from "./parse-effects";
import { expectArray, expectInteger, expectOneOf, expectRecord, expectText, expectTextList } from "./primitives";

const CRISES: readonly Crisis[] = ["burnout", "apes"];

const optionalText = (value: unknown, path: string) => (value === undefined ? null : expectText(value, path));
const optionalList = (value: unknown, path: string) => (value === undefined ? [] : expectTextList(value, path));

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
  if (choices.length < 2 || choices.length > 3)
    throw new DataError(`${path}.choices`, "a card needs 2 or 3 choices");
  const crisis = fields.crisis === undefined ? null : expectOneOf(fields.crisis, CRISES, `${path}.crisis`);
  if ((deck === "krisis") !== (crisis !== null))
    throw new DataError(`${path}.crisis`, deck === "krisis" ? "krisis cards need a crisis" : "only krisis cards have a crisis");
  return {
    id: expectText(fields.id, `${path}.id`),
    category: deck,
    title: expectText(fields.title, `${path}.title`),
    description: expectText(fields.description, `${path}.description`),
    choices: choices.map((choice, i) => parseChoice(choice, `${path}.choices[${i}]`)),
    requiresStatus: optionalText(fields.requiresStatus, `${path}.requiresStatus`),
    crisis,
  };
}

export function parseDeck(json: unknown, deck: DeckId): EventCard[] {
  const file = `cards/${deck}.json`;
  const fields = expectRecord(json, file);
  if (fields.category !== deck)
    throw new DataError(`${file} › category`, `expected "${deck}", got ${JSON.stringify(fields.category)}`);
  return expectArray(fields.cards, `${file} › cards`).map((card, i) =>
    parseCard(card, deck, `${file} › cards[${i}]`),
  );
}

export function assertUniqueIds(events: EventCard[]): void {
  const seen = new Set<string>();
  for (const event of events) {
    if (seen.has(event.id)) throw new DataError(event.id, "card id is used twice");
    seen.add(event.id);
  }
}

// Status ids in cards must exist, and automatic statuses come only from their triggers.
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
        if (catalog[id].trigger)
          throw new DataError(`${where} gains`, `"${id}" is automatic and cannot be gained by a choice`);
    });
  }
}
```

`src/data/content/statuses.json`: add this entry as the first key (before `burnout`):

```json
  "utang-ke-teman": {
    "label": "Utang ke teman",
    "icon": "users"
  },
```

Create `src/data/content/special-decks.json`:

```json
{
  "krisis": {
    "label": "Krisis",
    "icon": "drama",
    "color": "pink"
  },
  "debt-collector": {
    "label": "Debt collector",
    "icon": "receipt",
    "color": "peach"
  }
}
```

Create `src/data/content/cards/krisis.json`:

```json
{
  "category": "krisis",
  "cards": [
    {
      "id": "krisis-1",
      "crisis": "burnout",
      "title": "Baterai sosial nol persen",
      "description": "Pagi ini kamu natap langit-langit kamar dua jam. Chat kantor numpuk, tapi jempolmu mogok kerja.",
      "choices": [
        {
          "label": "Izin sakit, tidur seharian",
          "effects": { "kewarasan": 25, "dompet": -150000 },
          "result": "Bangun jam empat sore. Dunia masih ada, kamu juga."
        },
        {
          "label": "Paksa kerja pakai kopi tiga gelas",
          "effects": { "dompet": 100000, "kewarasan": -10, "hoki": -5 },
          "result": "Kerjaan kelar. Tanganmu gemetar kayak HP di mode getar."
        }
      ]
    },
    {
      "id": "krisis-2",
      "crisis": "burnout",
      "title": "Mode hemat daya",
      "description": "Kamu buka aplikasi kerja, lalu langsung tutup lagi. Tiga kali. Badanmu minta libur, bukan motivasi.",
      "choices": [
        {
          "label": "Matikan HP satu hari penuh",
          "effects": { "kewarasan": 30, "relasi": -10 },
          "result": "Ada 87 chat belum dibaca. Kewarasanmu pulang pelan-pelan."
        },
        {
          "label": "Jalan kaki keliling kompleks",
          "effects": { "kewarasan": 15, "hoki": 5, "dompet": -20000 },
          "result": "Ketemu kucing oren yang mau dielus. Hari ini dihitung menang."
        }
      ]
    },
    {
      "id": "krisis-3",
      "crisis": "apes",
      "title": "Kesandung terus dari pagi",
      "description": "Sandal putus, galon habis, dan charger kamu dipinjam orang yang nggak ingat pernah minjam.",
      "choices": [
        {
          "label": "Terima nasib, beli sandal baru",
          "effects": { "dompet": -60000, "hoki": 15 },
          "result": "Sandal baru, hari baru. Minimal kaki kamu aman."
        },
        {
          "label": "Salahin posisi bintang",
          "effects": { "hoki": 10, "relasi": -5 },
          "result": "Teman kosmu setuju. Kalian bikin grup khusus buat ngeluh."
        }
      ]
    },
    {
      "id": "krisis-4",
      "crisis": "apes",
      "title": "Antrean pilihanmu selalu paling lambat",
      "description": "Di kasir, di ATM, di loket. Tiap kamu pindah antrean, antrean lama langsung lancar.",
      "choices": [
        {
          "label": "Diam di satu antrean, pasrah",
          "effects": { "hoki": 20, "kewarasan": -5 },
          "result": "Akhirnya giliranmu. Kasirnya ganti shift pas kamu maju."
        },
        {
          "label": "Pulang, belanja besok aja",
          "effects": { "kewarasan": 10, "dompet": -30000 },
          "result": "Besoknya harga naik tiga ribu. Tapi hatimu tenang."
        }
      ]
    }
  ]
}
```

Create `src/data/content/cards/debt-collector.json`:

```json
{
  "category": "debt-collector",
  "cards": [
    {
      "id": "debt-collector-1",
      "title": "Tamu berjaket kulit di depan kos",
      "description": "Ada bapak-bapak ramah yang nanya kabarmu, lalu nanya kabar utangmu. Senyumnya awet banget.",
      "choices": [
        {
          "label": "Bayar sebagian sekarang",
          "effects": { "dompet": -300000, "hutang": -300000, "kewarasan": 5 },
          "result": "Bapaknya pamit sambil bilang “sampai ketemu bulan depan”. Manis, tapi bikin merinding."
        },
        {
          "label": "Pura-pura jadi sepupu sendiri",
          "effects": { "kewarasan": -10, "hoki": -5 },
          "result": "Bapaknya manggut-manggut, lalu nitip salam buat kamu. Ke kamu."
        },
        {
          "label": "Minta teman nalangin dulu",
          "effects": { "hutang": -400000, "relasi": -15 },
          "requires": { "relasi": 40 },
          "tags": ["minta-tolong"],
          "gains": ["utang-ke-teman"],
          "result": "Utang pindah tangan. Sekarang tiap ketemu dia, kamu yang traktir."
        }
      ]
    },
    {
      "id": "debt-collector-2",
      "title": "Telepon dari nomor nggak dikenal",
      "description": "Nomor asing nelepon tiap jam makan siang. Nada deringmu sekarang bikin deg-degan.",
      "choices": [
        {
          "label": "Angkat dan nego cicilan",
          "effects": { "hutang": -150000, "dompet": -100000, "kewarasan": -5 },
          "result": "Cicilan dapat keringanan dikit. Suaramu gemetar, tapi nego tetap nego."
        },
        {
          "label": "Ganti nada dering jadi lagu tidur",
          "effects": { "kewarasan": 5, "hoki": -10 },
          "result": "Tidurmu nyenyak. Utangmu juga ikut tidur, sambil tumbuh."
        }
      ]
    },
    {
      "id": "debt-collector-3",
      "title": "Surat cinta dari penagih",
      "description": "Ada amplop di bawah pintu. Isinya rincian bunga, ditulis rapi pakai stabilo pink.",
      "choices": [
        {
          "label": "Tempel di kulkas buat motivasi",
          "effects": { "kewarasan": -5, "hoki": 5 },
          "result": "Tiap buka kulkas kamu ingat. Kulkasnya juga ikut sedih."
        },
        {
          "label": "Jual barang nganggur buat nyicil",
          "effects": { "hutang": -250000, "kewarasan": 5 },
          "result": "Speaker lama laku. Tetangga lega, utangmu berkurang dikit."
        }
      ]
    }
  ]
}
```

Reformat both new card files with `node -e` so they match the repo's JSON style (2-space, one key per line):

```bash
node -e 'const fs=require("fs");for(const f of ["krisis","debt-collector"]){const p=`src/data/content/cards/${f}.json`;fs.writeFileSync(p,JSON.stringify(JSON.parse(fs.readFileSync(p,"utf8")),null,2)+"\n")}'
```

Create `src/data/special-decks.ts`:

```ts
import type { DeckId, SpecialDeck, TileMeta } from "../game/types";
import { CATEGORIES } from "./categories";
import collectorJson from "./content/cards/debt-collector.json";
import krisisJson from "./content/cards/krisis.json";
import specialDecksJson from "./content/special-decks.json";
import { parseTileMeta } from "./parse/parse-board";
import { assertStatusRefs, parseDeck } from "./parse/parse-cards";
import { expectRecord } from "./parse/primitives";
import { STATUSES } from "./statuses";

// Decks that are not board tiles: the rules draw from them during a crisis or a debt collector visit.
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
```

`src/data/events.ts`:
- Change the parse import to `import { assertStatusRefs, assertUniqueIds, parseDeck } from "./parse/parse-cards";`.
- Add the imports `import { COLLECTOR_CARDS, KRISIS_CARDS } from "./special-decks";` and `import { STATUSES } from "./statuses";`.
- Replace everything from `assertUniqueIds(EVENTS);` to the end of the file with:

```ts
assertStatusRefs(EVENTS, STATUSES);

// Every card any rule can draw, so a choice resolves the same way wherever its card came from.
export const ALL_CARDS: EventCard[] = [...EVENTS, ...KRISIS_CARDS, ...COLLECTOR_CARDS];
assertUniqueIds(ALL_CARDS);

export const EVENT_BY_ID = Object.fromEntries(
  ALL_CARDS.map((event) => [event.id, event]),
) as Record<string, EventCard>;
```

`src/components/event-panel/event-card.tsx`: change line 1 to `import { DECK_META } from "../../data/special-decks";` and line 16 to `const category = DECK_META[event.category];`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: all pass, including the wording lint over the seven new cards. If the lint flags a line, reword it until it follows `docs/copy-guide.md`; don't loosen the lint.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add choice gates, follow-up card support and the krisis and debt-collector decks

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Choice availability

**Files:**
- Create: `src/game/availability.ts`, `src/game/availability.test.ts`

**Interfaces:**
- Consumes: `borrowCost` (Task 2), `hasStatus`, `HELP_TAG`, `GHOSTED` (Task 3), `Choice` (Task 4), `STAT_LABELS` (`src/game/format.ts`)
- Produces:
  - `type Availability = { kind: "ok" } | { kind: "debt"; shortfall: number; added: number } | { kind: "locked"; reason: string }`
  - `choiceAvailability(player: Player, choice: Choice, rolled: Partial<Stats>, catalog?: StatusCatalog, debt?: DebtRules): Availability`

- [ ] **Step 1: Write the failing test**

Create `src/game/availability.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "vitest";
import { choiceAvailability } from "./availability";
import { createGame } from "./create-game";
import type { ActiveStatus, Choice, DebtRules, Player, StatusCatalog, Stats } from "./types";

const RULES: DebtRules = { feeRate: 0.2, interestRate: 0.1, installmentMax: 500_000, collectorChance: 0.35 };
const CATALOG: StatusCatalog = {
  "utang-ke-teman": { id: "utang-ke-teman", label: "Utang ke teman", icon: "users", months: null, payday: {}, trigger: null },
  ghosted: {
    id: "ghosted", label: "Di-ghosting semua orang", icon: "chat", months: null, payday: {},
    trigger: { stat: "relasi", atMost: 0, clearAbove: 20 },
  },
};
const choice = (extra: Partial<Choice> = {}): Choice => ({
  label: "Pilih", effects: { dompet: -100_100 }, result: "Akibat.",
  requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], ...extra,
});
const player = (stats: Partial<Stats> = {}, statuses: ActiveStatus[] = []): Player => {
  const base = createGame(["A", "B"], 1).players[0];
  return { ...base, stats: { ...base.stats, ...stats }, statuses };
};
const check = (p: Player, c: Choice, rolled: Partial<Stats> = { dompet: -100_100 }) =>
  choiceAvailability(p, c, rolled, CATALOG, RULES);

test("a choice the wallet can cover is simply ok", () => {
  assert.deepEqual(check(player({ dompet: 200_000 }), choice()), { kind: "ok" });
});

test("Rp100.000 in the wallet against a Rp100.100 choice borrows Rp100 plus the fee", () => {
  assert.deepEqual(check(player({ dompet: 100_000 }), choice()), { kind: "debt", shortfall: 100, added: 120 });
});

test("the rolled amount decides, not the base amount on the card", () => {
  assert.deepEqual(check(player({ dompet: 100_000 }), choice(), { dompet: -60_000 }), { kind: "ok" });
});

test("stat requirements, statuses and ghosting lock choices with a reason", () => {
  const rich = { dompet: 5_000_000 };
  assert.deepEqual(check(player({ ...rich, relasi: 25 }), choice({ requires: { relasi: 30 } })), {
    kind: "locked", reason: "Butuh Relasi 30+",
  });
  assert.deepEqual(check(player(rich), choice({ requiresStatus: "utang-ke-teman" })), {
    kind: "locked", reason: "Butuh status “Utang ke teman”",
  });
  assert.deepEqual(
    check(player(rich, [{ id: "utang-ke-teman", untilMonth: null }]), choice({ blockedByStatus: "utang-ke-teman" })),
    { kind: "locked", reason: "Nggak bisa selama “Utang ke teman”" },
  );
  const help = choice({ tags: ["minta-tolong"] });
  assert.equal(check(player(rich, [{ id: "ghosted", untilMonth: null }]), help).kind, "locked");
  assert.deepEqual(check(player(rich), help), { kind: "ok" });
});

test("a locked choice never offers hutang instead", () => {
  assert.equal(check(player({ dompet: 0, relasi: 10 }), choice({ requires: { relasi: 30 } })).kind, "locked");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/game/availability.test.ts`
Expected: FAIL. `./availability` is not found.

- [ ] **Step 3: Implement**

Create `src/game/availability.ts`:

```ts
import { ECONOMY } from "../data/economy";
import { STATUSES } from "../data/statuses";
import { borrowCost } from "./debt";
import { STAT_LABELS } from "./format";
import { GHOSTED, HELP_TAG } from "./status-ids";
import { hasStatus } from "./statuses";
import type { BoundedStat, Choice, DebtRules, Player, StatusCatalog, Stats } from "./types";

export type Availability =
  | { kind: "ok" }
  | { kind: "debt"; shortfall: number; added: number }
  | { kind: "locked"; reason: string };

// One answer for both the choice buttons and the reducer, so what a player sees
// is exactly what the rules allow. Locks are checked before money.
export function choiceAvailability(
  player: Player,
  choice: Choice,
  rolled: Partial<Stats>,
  catalog: StatusCatalog = STATUSES,
  debt: DebtRules = ECONOMY.debt,
): Availability {
  if (choice.requiresStatus && !hasStatus(player, choice.requiresStatus))
    return { kind: "locked", reason: `Butuh status “${catalog[choice.requiresStatus].label}”` };
  if (choice.blockedByStatus && hasStatus(player, choice.blockedByStatus))
    return { kind: "locked", reason: `Nggak bisa selama “${catalog[choice.blockedByStatus].label}”` };
  if (choice.tags.includes(HELP_TAG) && hasStatus(player, GHOSTED))
    return { kind: "locked", reason: "Lagi di-ghosting, nggak ada yang bisa dimintain tolong" };
  for (const [stat, min] of Object.entries(choice.requires) as [BoundedStat, number][])
    if (player.stats[stat] < min) return { kind: "locked", reason: `Butuh ${STAT_LABELS[stat]} ${min}+` };
  const cost = -(rolled.dompet ?? 0);
  if (cost > player.stats.dompet) {
    const shortfall = cost - player.stats.dompet;
    return { kind: "debt", shortfall, added: borrowCost(shortfall, debt) };
  }
  return { kind: "ok" };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add choice availability: ok, pay with hutang, or locked with a reason

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Status-aware card draws

**Files:**
- Modify: `src/game/deck.ts`
- Create: `src/game/deck.test.ts`

**Interfaces:**
- Consumes: `hasStatus`, `BURNOUT`, `APES`, `DEBT_COLLECTOR` (Task 3); `KRISIS_CARDS`, `COLLECTOR_CARDS` (Task 4); `ECONOMY.debt.collectorChance` (Task 2)
- Produces:
  - `interface Decks { events: EventCard[]; krisis: EventCard[]; collector: EventCard[] }`
  - `drawEvent(drawn: string[], tile: Tile, rng: number, player: Player, decks?: Decks, collectorChance?: number): { event: EventCard; drawn: string[]; rng: number }`

- [ ] **Step 1: Write the failing test**

Create `src/game/deck.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "vitest";
import { BOARD } from "../data/categories";
import { createGame } from "./create-game";
import { drawEvent, type Decks } from "./deck";
import { random } from "./random";
import type { ActiveStatus, Crisis, DeckId, EventCard, Player } from "./types";

const card = (id: string, category: DeckId, extra: Partial<EventCard> = {}): EventCard => ({
  id, category, title: id, description: id, choices: [], requiresStatus: null, crisis: null, ...extra,
});
const crisisCard = (id: string, crisis: Crisis) => card(id, "krisis", { crisis });
const DECKS: Decks = {
  events: [
    card("kerja-a", "kerja"),
    card("kerja-follow", "kerja", { requiresStatus: "kerja-sampingan" }),
    card("ojol-a", "ojol"),
  ],
  krisis: [crisisCard("burn-a", "burnout"), crisisCard("apes-a", "apes")],
  collector: [card("dc-a", "debt-collector")],
};
const tile = (category: string) => BOARD.find((t) => t.category === category)!;
const player = (statuses: ActiveStatus[] = []): Player => ({ ...createGame(["A", "B"], 1).players[0], statuses });
const idsOver = (p: Player, category: string, chance = 0.35) =>
  new Set(Array.from({ length: 60 }, (_, seed) => drawEvent([], tile(category), seed * 7919, p, DECKS, chance).event.id));

test("a plain player only draws the tile's own, non-follow-up cards", () => {
  assert.deepEqual(idsOver(player(), "kerja"), new Set(["kerja-a"]));
});

test("follow-up cards join the pool while the player has their status", () => {
  assert.deepEqual(idsOver(player([{ id: "kerja-sampingan", untilMonth: 5 }]), "kerja"), new Set(["kerja-a", "kerja-follow"]));
});

test("burnout overrides every tile; apes only takes over plot twists", () => {
  assert.deepEqual(idsOver(player([{ id: "burnout", untilMonth: null }]), "ojol"), new Set(["burn-a"]));
  const unlucky = player([{ id: "apes", untilMonth: null }]);
  assert.deepEqual(idsOver(unlucky, "kejutan"), new Set(["apes-a"]));
  assert.deepEqual(idsOver(unlucky, "ojol"), new Set(["ojol-a"]));
});

test("a marked player rolls the collector chance first, which costs one extra draw", () => {
  const marked = player([{ id: "dicari-debt-collector", untilMonth: null }]);
  assert.deepEqual(idsOver(marked, "ojol", 1), new Set(["dc-a"]));
  assert.deepEqual(idsOver(marked, "ojol", 0), new Set(["ojol-a"]));
  const rng = 12345;
  assert.equal(drawEvent([], tile("ojol"), rng, player(), DECKS).rng, random(rng).rng);
  assert.equal(drawEvent([], tile("ojol"), rng, marked, DECKS, 0).rng, random(random(rng).rng).rng);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/game/deck.test.ts`
Expected: FAIL. `drawEvent` ignores `player` and `decks`, and `Decks` is not exported.

- [ ] **Step 3: Implement**

Replace `src/game/deck.ts` with:

```ts
import { ECONOMY } from "../data/economy";
import { EVENTS } from "../data/events";
import { COLLECTOR_CARDS, KRISIS_CARDS } from "../data/special-decks";
import { pickIndex, random } from "./random";
import { APES, BURNOUT, DEBT_COLLECTOR } from "./status-ids";
import { hasStatus } from "./statuses";
import type { EventCard, Player, Tile } from "./types";

export interface Decks {
  events: EventCard[];
  krisis: EventCard[];
  collector: EventCard[];
}
const DEFAULT_DECKS: Decks = { events: EVENTS, krisis: KRISIS_CARDS, collector: COLLECTOR_CARDS };

const isWildcard = (tile: Tile) => tile.category === "gajian" || tile.category === "kejutan";

// Which cards this player can draw here. Burnout beats everything, apes only
// takes over plot twists, and a player marked by the debt collector rolls
// collectorChance before the normal pool. That roll is one extra draw, taken
// before the card pick; the order is part of the save format.
function choosePool(player: Player, tile: Tile, rng: number, decks: Decks, collectorChance: number) {
  if (hasStatus(player, BURNOUT))
    return { pool: decks.krisis.filter((card) => card.crisis === "burnout"), rng };
  if (tile.category === "kejutan" && hasStatus(player, APES))
    return { pool: decks.krisis.filter((card) => card.crisis === "apes"), rng };
  let next = rng;
  if (hasStatus(player, DEBT_COLLECTOR)) {
    const roll = random(rng);
    if (roll.value < collectorChance) return { pool: decks.collector, rng: roll.rng };
    next = roll.rng;
  }
  const unlocked = decks.events.filter(
    (card) => card.requiresStatus === null || hasStatus(player, card.requiresStatus),
  );
  return { pool: isWildcard(tile) ? unlocked : unlocked.filter((card) => card.category === tile.category), rng: next };
}

// Draws a card without repeating one until its pool is used up; then that
// pool's history is forgotten and it reshuffles.
export function drawEvent(
  drawn: string[],
  tile: Tile,
  rng: number,
  player: Player,
  decks: Decks = DEFAULT_DECKS,
  collectorChance: number = ECONOMY.debt.collectorChance,
) {
  const { pool, rng: poolRng } = choosePool(player, tile, rng, decks, collectorChance);
  let history = drawn;
  let available = pool.filter((event) => !history.includes(event.id));
  if (available.length === 0) {
    const poolIds = new Set(pool.map((event) => event.id));
    history = history.filter((id) => !poolIds.has(id));
    available = pool;
  }
  const draw = random(poolRng);
  const event: EventCard = available[pickIndex(draw.value, available.length)];
  return { event, drawn: [...history, event.id], rng: draw.rng };
}
```

`src/game/reducer.ts` line 26: pass the player: `drawEvent(state.drawn, tile, dieRoll.rng, player)`. Task 7 rewrites this function; this change just keeps it compiling now.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Draw cards per player: crises, debt collector visits and follow-ups

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Wire the rules into the reducer

**Files:**
- Modify: `src/game/types.ts` (`Paycheck`), `src/game/payday.ts`, `src/game/reducer.ts`, `src/game/log-messages.ts`
- Test: `src/game/reducer.test.ts`, `src/game/replay.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–6
- Produces:
  - `Paycheck` gains `statusEffects: StatusEffect[]`, `interest: number`, `installment: number`
  - `type PaycheckRoll = Omit<Paycheck, "statusEffects" | "interest" | "installment">`
  - `rollPaycheck(rng): { paycheck: PaycheckRoll; rng }`
  - `settlePayday(player, roll, catalog?, debt?): { player: Player; paycheck: Paycheck }`
  - `choiceMessage(name, choice, borrowed?, changes?)`
  - reducer behaviour:
    - `CHOOSE` on a locked choice returns the same state object
    - statuses sync after every choice and payday
    - timed statuses expire when the month changes

- [ ] **Step 1: Write the failing tests**

In `src/game/reducer.test.ts`:
- Replace line 12 (`import { applyEffects } from "./stats";`) with:

```ts
import { choiceAvailability } from "./availability";
import { applyWithDebt, borrowCost } from "./debt";
```

- Change line 13 to `import type { Action, ActiveStatus, GameState, Session, Stats } from "./types";`.

In the payday test, replace lines 37–43 (the `if (receipt.rare) { ... }` block) with:

```ts
    if (receipt.rare) {
      rareCount++;
      const broke = { ...initial, players: initial.players.map((p, i) => i === 0 ? { ...p, stats: { ...p.stats, dompet: 0 } } : p) };
      const unlucky = gameReducer(broke, { type: "ROLL" });
      assert.equal(unlucky.players[0].stats.dompet, 0, "Dompet never goes below zero");
      assert.equal(
        unlucky.players[0].stats.hutang,
        borrowCost(-receipt.net) + unlucky.paydayDetails!.interest,
        "a rare bill the wallet can't cover becomes hutang",
      );
      assert.equal(unlucky.paydayDetails!.installment, 0);
      assert.equal(unlucky.phase, "payday", "debt does not skip the paycheck or eliminate a player");
    }
```

In the 12-month test, replace the lines from `const category =` through `const expectedStats = applyEffects(...);` with:

```ts
        const category =
          BOARD[state.players[state.currentPlayer].position].category;
        const drawnFrom = EVENT_BY_ID[state.eventId!].category;
        if (category !== "kejutan" && category !== "gajian" && drawnFrom !== "krisis" && drawnFrom !== "debt-collector")
          assert.equal(drawnFrom, category);
        const event = EVENT_BY_ID[state.eventId!];
        const mover = state.players[state.currentPlayer];
        const offset = (seed + turn) % event.choices.length;
        const index = [...event.choices.keys()]
          .map((k) => (k + offset) % event.choices.length)
          .find((i) => choiceAvailability(mover, event.choices[i], state.choiceEffects[i]).kind !== "locked")!;
        const choiceAction: Action = { type: "CHOOSE", index };
        const expectedStats = applyWithDebt(mover.stats, state.choiceEffects[index]);
```

Append these tests to `src/game/reducer.test.ts`:

```ts
const eventState = (
  eventId: string,
  stats: Partial<Stats> = {},
  statuses: ActiveStatus[] = [],
  choiceEffects?: Partial<Stats>[],
): GameState => {
  const initial = createGame(["A", "B"], 1);
  return {
    ...initial,
    phase: "event",
    eventId,
    choiceEffects: choiceEffects ?? EVENT_BY_ID[eventId].choices.map((choice) => choice.effects),
    players: initial.players.map((p) => (p.id === 0 ? { ...p, stats: { ...p.stats, ...stats }, statuses } : p)),
  };
};

test("a choice the wallet can't cover empties Dompet and books the rest as hutang", () => {
  const state = eventState("kerja-1", { dompet: 100_000 }, [], [{ dompet: -100_100 }, { kewarasan: 1 }, { kewarasan: 1 }]);
  const resolved = gameReducer(state, { type: "CHOOSE", index: 0 });
  assert.equal(resolved.players[0].stats.dompet, 0);
  assert.equal(resolved.players[0].stats.hutang, borrowCost(100));
  assert.deepEqual(resolved.lastEffects, { dompet: -100_000, hutang: borrowCost(100) });
  assert.match(resolved.log[0], /Ngutang ke debt collector/);
});

test("requirements and ghosting lock a choice, and a locked choice is ignored like an invalid one", () => {
  const askFriend = 2; // debt-collector-1: needs Relasi 40+, tagged minta-tolong, gains utang-ke-teman
  const lonely = eventState("debt-collector-1", { relasi: 30, hutang: 1_500_000 });
  assert.equal(gameReducer(lonely, { type: "CHOOSE", index: askFriend }), lonely);
  const ghosted = eventState("debt-collector-1", { relasi: 50, hutang: 1_500_000 }, [{ id: "ghosted", untilMonth: null }]);
  assert.equal(gameReducer(ghosted, { type: "CHOOSE", index: askFriend }), ghosted);
  const helped = gameReducer(eventState("debt-collector-1", { relasi: 50, hutang: 1_500_000 }), { type: "CHOOSE", index: askFriend });
  assert.equal(helped.phase, "resolved");
  assert.ok(helped.players[0].statuses.some((s) => s.id === "utang-ke-teman"));
  assert.match(helped.log[0], /Status baru: Utang ke teman/);
});

test("hitting zero Kewarasan starts burnout, and burnout draws from the krisis deck", () => {
  const state = eventState("kerja-1", { kewarasan: 3 }, [], [{ kewarasan: -10 }, { kewarasan: -10 }, { kewarasan: -10 }]);
  const resolved = gameReducer(state, { type: "CHOOSE", index: 0 });
  assert.ok(resolved.players[0].statuses.some((s) => s.id === "burnout"));
  const ready: GameState = { ...resolved, phase: "ready", eventId: null, choiceEffects: [] };
  const card = EVENT_BY_ID[gameReducer(ready, { type: "ROLL" }).eventId!];
  assert.equal(card.category, "krisis");
  assert.equal(card.crisis, "burnout");
});

test("a timed status expires when its last month ends", () => {
  const initial = createGame(["A", "B"], 1);
  const state: GameState = {
    ...initial,
    phase: "resolved",
    currentPlayer: 1,
    players: initial.players.map((p) => ({ ...p, statuses: [{ id: "utang-ke-teman", untilMonth: 2 }] })),
  };
  const next = gameReducer(state, { type: "NEXT" });
  assert.equal(next.month, 2);
  assert.deepEqual(next.players.map((p) => p.statuses), [[], []]);
});

test("payday charges interest, then the collector's instalment", () => {
  const initial = createGame(["A", "B"], 1);
  const state: GameState = {
    ...initial,
    players: initial.players.map((p) =>
      p.id === 0 ? { ...p, position: BOARD.length - 1, stats: { ...p.stats, hutang: 1_000_000 } } : p,
    ),
  };
  const rolled = gameReducer(state, { type: "ROLL" });
  const receipt = rolled.paydayDetails!;
  assert.equal(receipt.interest, 100_000);
  assert.equal(receipt.installment, ECONOMY.debt.installmentMax);
  assert.equal(rolled.players[0].stats.hutang, 1_000_000 + receipt.interest - receipt.installment);
  assert.equal(rolled.players[0].stats.dompet, INITIAL_STATS.dompet + receipt.net - receipt.installment);
  assert.match(rolled.log[0], /Cicilan ke debt collector/);
});
```

In `src/game/replay.test.ts`:
- Replace `import { applyEffects } from "./stats";` with `import { applyWithDebt } from "./debt";`.
- Change `applyEffects(` to `applyWithDebt(`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/reducer.test.ts`
Expected: FAIL. `rare bill ... becomes hutang` fails because Dompet goes negative, locked choices resolve, `interest` is undefined, and so on.

- [ ] **Step 3: Implement**

`src/game/types.ts`: add these as the last fields of `Paycheck`:

```ts
  statusEffects: StatusEffect[];
  interest: number;
  installment: number;
```

Replace `src/game/payday.ts` with:

```ts
import { ECONOMY, PAYDAY_REASONS } from "../data/economy";
import { STATUSES } from "../data/statuses";
import { applyWithDebt, chargeDebt } from "./debt";
import { pickIndex, random, rollInRange } from "./random";
import { paydayEffects, syncAutomatic } from "./statuses";
import type { DebtRules, Paycheck, Player, StatusCatalog } from "./types";

export type PaycheckRoll = Omit<Paycheck, "statusEffects" | "interest" | "installment">;

// Draw order is part of the save format: salary, living cost, rare roll, bill amount, reason.
export function rollPaycheck(rng: number): { paycheck: PaycheckRoll; rng: number } {
  const salaryRoll = random(rng);
  const livingRoll = random(salaryRoll.rng);
  const rareRoll = random(livingRoll.rng);
  const amountRoll = random(rareRoll.rng);
  const reasonRoll = random(amountRoll.rng);

  const salary = rollInRange(ECONOMY.salary, salaryRoll.value);
  const livingCost = rollInRange(ECONOMY.livingCost, livingRoll.value);
  const rare = rareRoll.value < ECONOMY.rareChance;
  const deduction = rollInRange(rare ? ECONOMY.rareBill : ECONOMY.deduction, amountRoll.value);
  const reasons = rare ? PAYDAY_REASONS.rare : PAYDAY_REASONS.common;

  return {
    paycheck: {
      salary,
      livingCost,
      rare,
      deduction,
      reason: reasons[pickIndex(reasonRoll.value, reasons.length)],
      net: salary - livingCost - deduction,
    },
    rng: reasonRoll.rng,
  };
}

// Payday order: the paycheck, each status's payday effect, then hutang interest
// and the collector's instalment. Any shortfall along the way is borrowed.
export function settlePayday(
  player: Player,
  roll: PaycheckRoll,
  catalog: StatusCatalog = STATUSES,
  debt: DebtRules = ECONOMY.debt,
): { player: Player; paycheck: Paycheck } {
  let stats = applyWithDebt(player.stats, { dompet: roll.net }, debt);
  const statusEffects = paydayEffects(player.statuses, catalog);
  for (const { effects } of statusEffects) stats = applyWithDebt(stats, effects, debt);
  const charged = chargeDebt(stats, debt);
  return {
    player: { ...player, stats: charged.stats, statuses: syncAutomatic(player.statuses, charged.stats, catalog) },
    paycheck: { ...roll, statusEffects, interest: charged.interest, installment: charged.installment },
  };
}
```

Replace `src/game/log-messages.ts` with:

```ts
import { rupiah } from "./format";
import { statusLabel } from "./statuses";
import type { Choice, Paycheck } from "./types";

const MAX_LOG_ENTRIES = 60;

export const START_LOG = "Tahun baru, harapan baru. Saldo awal Rp2.500.000 per pemain.";

export function addToLog(log: string[], entry: string): string[] {
  return [entry, ...log].slice(0, MAX_LOG_ENTRIES);
}

function debtLines(paycheck: Paycheck): string {
  const statuses = paycheck.statusEffects.length
    ? ` Efek status: ${paycheck.statusEffects.map((effect) => statusLabel(effect.status)).join(", ")}.`
    : "";
  const interest = paycheck.interest ? ` Bunga utang ${rupiah(paycheck.interest)}.` : "";
  const installment = paycheck.installment ? ` Cicilan ke debt collector ${rupiah(paycheck.installment)}.` : "";
  return `${statuses}${interest}${installment}`;
}

function paydayLine(paycheck: Paycheck): string {
  const outcome = paycheck.net < 0 ? "Dompet nombok" : "Masuk dompet";
  return ` Mampir GAJIAN! Gaji ${rupiah(paycheck.salary)} − biaya hidup ${rupiah(paycheck.livingCost)} − tagihan dadakan ${rupiah(paycheck.deduction)}. ${paycheck.reason} ${outcome}: ${rupiah(Math.abs(paycheck.net))}.${debtLines(paycheck)}`;
}

export function rollMessage(name: string, dice: number, tileLabel: string, paycheck: Paycheck | null): string {
  return `${name} melempar ${dice} → ${tileLabel}.${paycheck ? paydayLine(paycheck) : ""}`;
}

export interface StatusChanges {
  gained: string[];
  lost: string[];
}

const NO_CHANGES: StatusChanges = { gained: [], lost: [] };

export function choiceMessage(name: string, choice: Choice, borrowed = 0, changes: StatusChanges = NO_CHANGES): string {
  const debt = borrowed ? ` Ngutang ke debt collector: ${rupiah(borrowed)}.` : "";
  const gained = changes.gained.length ? ` Status baru: ${changes.gained.map((id) => statusLabel(id)).join(", ")}.` : "";
  const lost = changes.lost.length ? ` Lepas dari: ${changes.lost.map((id) => statusLabel(id)).join(", ")}.` : "";
  return `${name}: ${choice.label}. ${choice.result}${debt}${gained}${lost}`;
}
```

In `src/game/reducer.ts`:
- Replace the imports (lines 1–9) with:

```ts
import { TOTAL_MONTHS } from "../data/calendar";
import { BOARD } from "../data/categories";
import { EVENT_BY_ID } from "../data/events";
import { choiceAvailability } from "./availability";
import { applyWithDebt } from "./debt";
import { drawEvent } from "./deck";
import { addToLog, choiceMessage, rollMessage } from "./log-messages";
import { rollPaycheck, settlePayday } from "./payday";
import { random, rollDie } from "./random";
import { appliedChanges, randomizeEffects } from "./stats";
import { clearStatuses, expireStatuses, gainStatuses, statusChanges, syncAutomatic } from "./statuses";
import type { Action, GameState, Paycheck, Player } from "./types";
```

- Replace `rollTurn` (lines 17–62) with:

```ts
function rollTurn(state: GameState): GameState {
  const player = currentPlayer(state);
  const dieRoll = random(state.rng);
  const dice = rollDie(dieRoll.value);
  const distance = player.position + dice;
  const position = distance % BOARD.length;
  const payday = distance >= BOARD.length;
  const tile = BOARD[position];

  // Draw order (save format): die, paycheck (5 draws) when passing GAJIAN, the
  // debt collector's chance and the card (deck.ts), then one draw per choice effect.
  // Payday settles first, so a crisis it causes already changes the draw.
  let rng = dieRoll.rng;
  let mover = player;
  let paydayDetails: Paycheck | null = null;
  if (payday) {
    const rolled = rollPaycheck(rng);
    rng = rolled.rng;
    const settled = settlePayday(player, rolled.paycheck);
    mover = settled.player;
    paydayDetails = settled.paycheck;
  }

  const draw = drawEvent(state.drawn, tile, rng, mover);
  rng = draw.rng;
  const choiceEffects = draw.event.choices.map((choice) => {
    const rolled = randomizeEffects(choice.effects, rng);
    rng = rolled.rng;
    return rolled.effects;
  });

  return {
    ...state,
    dice,
    rng,
    choiceEffects,
    paydayDetails,
    // Passing GAJIAN parks the pawn there until the paycheck is acknowledged.
    phase: payday ? "payday" : "event",
    pendingPosition: payday ? position : null,
    eventId: draw.event.id,
    drawn: draw.drawn,
    payday,
    resolution: "",
    lastEffects: {},
    players: updatePlayer(state, () => ({ ...mover, position: payday ? 0 : position })),
    log: addToLog(state.log, rollMessage(player.name, dice, tile.label, paydayDetails)),
  };
}
```

- Replace `choose` (lines 73–87) with:

```ts
function choose(state: GameState, eventId: string, index: number): GameState {
  const choice = EVENT_BY_ID[eventId]?.choices[index];
  const effects = state.choiceEffects[index];
  if (!choice || !effects || !Number.isInteger(index)) return state;
  const player = currentPlayer(state);
  const availability = choiceAvailability(player, choice, effects);
  if (availability.kind === "locked") return state;
  const stats = applyWithDebt(player.stats, effects);
  const statuses = syncAutomatic(
    clearStatuses(gainStatuses(player.statuses, choice.gains, state.month), choice.clears),
    stats,
  );
  const borrowed = availability.kind === "debt" ? availability.added : 0;
  return {
    ...state,
    phase: "resolved",
    resolution: choice.result,
    lastEffects: appliedChanges(player.stats, stats, effects),
    players: updatePlayer(state, (p) => ({ ...p, stats, statuses })),
    log: addToLog(
      state.log,
      choiceMessage(player.name, choice, borrowed, statusChanges(player.statuses, statuses)),
    ),
  };
}
```

`borrowed` is what the debt collector lent, fee included. It comes from `availability.added` rather than from the Hutang delta, because a choice can also pay Hutang down in the same move (e.g. `debt-collector-1` choice 1).

- Replace `nextTurn` with:

```ts
function nextTurn(state: GameState): GameState {
  if (isFinalTurn(state)) return { ...state, phase: "finished" };
  const endOfRound = isEndOfRound(state);
  const month = state.month + (endOfRound ? 1 : 0);
  return {
    ...state,
    currentPlayer: (state.currentPlayer + 1) % state.players.length,
    month,
    // Timed statuses run out when a new month starts.
    players: endOfRound
      ? state.players.map((p) => {
          const statuses = expireStatuses(p.statuses, month);
          return statuses === p.statuses ? p : { ...p, statuses };
        })
      : state.players,
    phase: "ready",
    eventId: null,
    choiceEffects: [],
    resolution: "",
    lastEffects: {},
    payday: false,
    paydayDetails: null,
    pendingPosition: null,
    turn: state.turn + 1,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: all pass. If `"a choice the wallet can't cover..."` fails on `lastEffects` key order, check that `appliedChanges` adds `hutang` after the effect keys (Task 1); don't reorder the assertion.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Apply hutang, gates and statuses in the turn reducer

Payday now settles before the card draw, so a crisis it causes changes
what comes up. Locked choices are rejected like invalid ones.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Save version 5

**Files:**
- Modify: `src/storage-keys.ts:4-10`, `src/game/replay.ts:7`, `src/game/types.ts` (`Session`)
- Test: `src/game/reducer.test.ts`, `src/game/replay.test.ts`

**Interfaces:**
- Produces: `SAVE_KEY = "hidup-kok-gini:v5"`, `SAVE_VERSION = 5`, `Session.version: 5`, and `"hidup-kok-gini:v4"` first in `LEGACY_SAVE_KEYS`.

- [ ] **Step 1: Write the failing test**

In `src/game/replay.test.ts`:
- Change every `version: 4` to `version: 5`.
- In the `invalid` list, add `{ ...base, version: 4 },` after `{ ...base, version: 1 },`.

In `src/game/reducer.test.ts`, change `version: 4` to `version: 5`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run typecheck`
Expected: FAIL. `Type '5' is not assignable to type '4'`.

- [ ] **Step 3: Implement**

- `src/game/types.ts`, in `Session`: `version: 5;`
- `src/game/replay.ts` line 7: `export const SAVE_VERSION = 5;`
- `src/storage-keys.ts`: replace lines 4–10 with:

```ts
export const SAVE_KEY = "hidup-kok-gini:v5";
export const SEEN_VERSION_KEY = "hidup-kok-gini:seen-version";
export const LEGACY_SAVE_KEYS = [
  "hidup-kok-gini:v4",
  "hidup-kok-gini:v3",
  "hidup-kok-gini:v2",
  "hidup-kok-gini:v1",
];
```

Then check that no other v4 literal is left:

Run: `grep -rn "version: 4\|:v4\"" src`
Expected: only the `LEGACY_SAVE_KEYS` entry.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Bump saves to v5; v4 games get the start-a-new-game notice

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Balance simulation and invariants

**Files:**
- Create: `src/game/simulation.ts`, `src/game/balance.test.ts`

**Interfaces:**
- Consumes: `choiceAvailability` (Task 5), `applyWithDebt` (Task 2), `gameReducer`, `createGame`, `rankPlayers`, `score`, `replaySession`, `SAVE_VERSION` (Task 8)
- Produces:
  - `type Policy = "random" | "greedy" | "cautious"` and `POLICIES`
  - `simulateGame(names, seed, policies, check?): GameTrace`
  - `measureBalance(gamesPerSize?): BalanceMetrics`
  - `BALANCE_TARGETS`
  - `missedTargets(metrics): string[]`
  - `targetDistance(metrics): number`
  - `openChoices(state): number[]`

- [ ] **Step 1: Write the failing test**

Create `src/game/balance.test.ts`:

```ts
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { test } from "vitest";
import { EVENT_BY_ID } from "../data/events";
import { choiceAvailability } from "./availability";
import { replaySession, SAVE_VERSION } from "./replay";
import { measureBalance, missedTargets, POLICIES, simulateGame, targetDistance } from "./simulation";
import { BOUNDED_STATS } from "./stats";

// Set by scripts/tune-balance.mjs: only measure and write the metrics.
const REPORT = process.env.BALANCE_REPORT;

test.runIf(!REPORT)("simulated games keep every invariant and replay exactly", () => {
  for (let seed = 0; seed < 150; seed++) {
    const names = ["A", "B", "C", "D"].slice(0, 2 + (seed % 3));
    const policies = names.map((_, i) => POLICIES[(seed + i) % POLICIES.length]);
    const trace = simulateGame(names, seed * 7919, policies, (state) => {
      for (const p of state.players) {
        assert.ok(p.stats.dompet >= 0, "Dompet never goes below zero");
        assert.ok(p.stats.hutang >= 0, "Hutang never goes below zero");
        for (const stat of BOUNDED_STATS) assert.ok(p.stats[stat] >= 0 && p.stats[stat] <= 100, stat);
      }
      if (state.phase === "event") {
        const player = state.players[state.currentPlayer];
        const event = EVENT_BY_ID[state.eventId!];
        assert.ok(
          event.choices.some((c, i) => choiceAvailability(player, c, state.choiceEffects[i]).kind !== "locked"),
          `${event.id} left ${player.name} with no open choice`,
        );
      }
    });
    const replayed = replaySession({ version: SAVE_VERSION, names, seed: seed * 7919, actions: trace.actions });
    assert.deepEqual(replayed?.game, trace.final);
  }
}, 120_000);

test.runIf(!REPORT)("balance metrics are proper shares", () => {
  const metrics = measureBalance(10);
  for (const key of ["dangerByJune", "borrowed", "crisisRecovery", "comeback"] as const)
    assert.ok(metrics[key] >= 0 && metrics[key] <= 1, key);
  assert.equal(metrics.games, 30);
});

test.runIf(!!REPORT)("report balance metrics", () => {
  const metrics = measureBalance();
  writeFileSync(REPORT!, JSON.stringify({ metrics, missed: missedTargets(metrics), distance: targetDistance(metrics) }));
}, 600_000);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/game/balance.test.ts`
Expected: FAIL. `./simulation` is not found.

- [ ] **Step 3: Implement**

Create `src/game/simulation.ts`:

```ts
import { EVENT_BY_ID } from "../data/events";
import { choiceAvailability } from "./availability";
import { createGame } from "./create-game";
import { applyWithDebt } from "./debt";
import { pickIndex, random } from "./random";
import { gameReducer } from "./reducer";
import { rankPlayers, score } from "./scoring";
import { BOUNDED_STATS } from "./stats";
import { APES, BURNOUT, GHOSTED } from "./status-ids";
import type { Action, GameState, Player } from "./types";

export type Policy = "random" | "greedy" | "cautious";
export const POLICIES: Policy[] = ["random", "greedy", "cautious"];

const CRISES = [BURNOUT, GHOSTED, APES];
const DANGER_LINE = 20;
const JUNE = 6;
const DECEMBER = 12;
const COMEBACK_MONTHS = [4, 5, 6, 7, 8, 9];
const NAMES = ["A", "B", "C", "D"];

export const BALANCE_TARGETS = {
  dangerByJune: [0.45, 0.6],
  borrowed: [0.25, 0.4],
  crisisRecovery: [0.6, 1],
  comeback: [0.3, 1],
} as const;

export interface PlayerTrace {
  policy: Policy;
  dangerByJune: boolean;
  borrowed: boolean;
  crises: number;
  recovered: number;
}
export interface GameTrace {
  final: GameState;
  actions: Action[];
  players: PlayerTrace[];
  comeback: boolean;
}
export interface BalanceMetrics {
  games: number;
  players: number;
  crises: number;
  dangerByJune: number;
  borrowed: number;
  crisisRecovery: number;
  comeback: number;
}

export function openChoices(state: GameState): number[] {
  const player = state.players[state.currentPlayer];
  return EVENT_BY_ID[state.eventId!].choices.flatMap((choice, i) =>
    choiceAvailability(player, choice, state.choiceEffects[i]).kind === "locked" ? [] : [i],
  );
}

const afterChoice = (state: GameState, index: number): Player => {
  const player = state.players[state.currentPlayer];
  return { ...player, stats: applyWithDebt(player.stats, state.choiceEffects[index]) };
};

// random: any open choice. greedy: best immediate score. cautious: best score
// among choices that avoid new hutang and the danger zone, else greedy.
function pick(policy: Policy, state: GameState, open: number[], rng: number) {
  if (policy === "random") {
    const draw = random(rng);
    return { index: open[pickIndex(draw.value, open.length)], rng: draw.rng };
  }
  const best = (options: number[]) =>
    options.reduce((a, b) => (score(afterChoice(state, b)) > score(afterChoice(state, a)) ? b : a));
  if (policy === "cautious") {
    const now = state.players[state.currentPlayer].stats;
    const safe = open.filter((i) => {
      const next = afterChoice(state, i).stats;
      return next.hutang === now.hutang && BOUNDED_STATS.every((stat) => next[stat] > DANGER_LINE);
    });
    if (safe.length) return { index: best(safe), rng };
  }
  return { index: best(open), rng };
}

const inDanger = (p: Player) => p.stats.hutang > 0 || BOUNDED_STATS.some((stat) => p.stats[stat] <= DANGER_LINE);

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Plays one full game with a policy per seat. Policy randomness uses its own
// seeded stream, so it never disturbs the game's rng.
export function simulateGame(
  names: string[],
  seed: number,
  policies: Policy[],
  check?: (state: GameState) => void,
): GameTrace {
  let state = createGame(names, seed);
  let policyRng = (seed ^ 0x9e3779b9) >>> 0;
  const actions: Action[] = [];
  const traces: PlayerTrace[] = policies.map((policy) => ({
    policy, dangerByJune: false, borrowed: false, crises: 0, recovered: 0,
  }));
  const openCrises = names.map(() => new Set<string>());
  const snapshots: number[][] = [];

  const act = (action: Action) => {
    const before = state;
    state = gameReducer(state, action);
    if (state === before) throw new Error(`simulation action ${action.type} was rejected`);
    actions.push(action);
    state.players.forEach((p, i) => {
      const trace = traces[i];
      if (before.month <= JUNE && inDanger(p)) trace.dangerByJune = true;
      if (p.stats.hutang > 0) trace.borrowed = true;
      for (const id of CRISES) {
        const had = before.players[i].statuses.some((s) => s.id === id);
        const has = p.statuses.some((s) => s.id === id);
        if (!had && has && before.month < DECEMBER) {
          trace.crises++;
          openCrises[i].add(id);
        }
        if (had && !has && openCrises[i].delete(id) && before.month < DECEMBER) trace.recovered++;
      }
    });
    if (action.type === "NEXT" && state.month !== before.month && COMEBACK_MONTHS.includes(before.month))
      snapshots.push(state.players.map(score));
    check?.(state);
  };

  while (state.phase !== "finished") {
    if (state.phase === "ready") act({ type: "ROLL" });
    else if (state.phase === "payday") act({ type: "CONTINUE_PAYDAY" });
    else if (state.phase === "event") {
      const picked = pick(policies[state.currentPlayer], state, openChoices(state), policyRng);
      policyRng = picked.rng;
      act({ type: "CHOOSE", index: picked.index });
    } else act({ type: "NEXT" });
  }
  const winner = rankPlayers(state.players)[0];
  return {
    final: state,
    actions,
    players: traces,
    comeback: snapshots.some((scores) => scores[winner.id] < median(scores)),
  };
}

const share = <T>(items: T[], test: (item: T) => boolean) => items.filter(test).length / items.length;

export function measureBalance(gamesPerSize = 1000): BalanceMetrics {
  const games: GameTrace[] = [];
  for (const count of [2, 3, 4])
    for (let g = 0; g < gamesPerSize; g++) {
      const policies = Array.from({ length: count }, (_, i) => POLICIES[(g + i) % POLICIES.length]);
      games.push(simulateGame(NAMES.slice(0, count), (g * 7919 + count * 104_729) >>> 0, policies));
    }
  const players = games.flatMap((game) => game.players);
  const crises = players.reduce((sum, p) => sum + p.crises, 0);
  const recovered = players.reduce((sum, p) => sum + p.recovered, 0);
  return {
    games: games.length,
    players: players.length,
    crises,
    dangerByJune: share(players, (p) => p.dangerByJune),
    borrowed: share(players, (p) => p.borrowed),
    crisisRecovery: crises ? recovered / crises : 1,
    comeback: share(games, (game) => game.comeback),
  };
}

// How far each metric sits outside its band; zero means every target is met.
export function targetDistance(metrics: BalanceMetrics): number {
  return (Object.keys(BALANCE_TARGETS) as (keyof typeof BALANCE_TARGETS)[]).reduce((sum, key) => {
    const [low, high] = BALANCE_TARGETS[key];
    const value = metrics[key];
    return sum + (value < low ? low - value : value > high ? value - high : 0);
  }, 0);
}

export function missedTargets(metrics: BalanceMetrics): string[] {
  return (Object.keys(BALANCE_TARGETS) as (keyof typeof BALANCE_TARGETS)[]).flatMap((key) => {
    const [low, high] = BALANCE_TARGETS[key];
    const value = metrics[key];
    return value < low || value > high ? [`${key} ${value.toFixed(3)} not in ${low}–${high}`] : [];
  });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: all pass. The invariant test may take up to about 30 s.

Then take a baseline measurement of the unscaled deck:

Run: `BALANCE_REPORT=balance-baseline.json npx vitest run src/game/balance.test.ts -t report && cat balance-baseline.json && rm balance-baseline.json`
Expected: a JSON line whose `missed` list is not empty (the deck is still too gentle). Paste it into the Task 9 commit message body as the "before" numbers.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add a seeded balance simulation with three player policies

Unscaled deck, before tuning: <paste the baseline JSON line here>

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Tune the scale factors and re-record the fingerprints

**Files:**
- Create: `scripts/scale-effects.mjs`, `scripts/tune-balance.mjs`
- Modify: `package.json` (`scripts`), `src/data/content/cards/*.json` (the 14 category decks, rewritten by the script), `src/game/balance.test.ts`, `src/data/content.test.ts` (the effect-size test), `src/data/content-fingerprint.test.ts`

**Interfaces:**
- Consumes: `measureBalance`, `missedTargets`, `targetDistance`, `openChoices` (Task 9); `choiceAvailability` (Task 5)
- Produces: the category decks baked at the chosen factors, and `npm run tune`

- [ ] **Step 1: Write the failing test**

Append to `src/game/balance.test.ts`:

```ts
test.runIf(!REPORT)("balance lands inside the swingy-with-comebacks targets", () => {
  const metrics = measureBalance();
  assert.deepEqual(missedTargets(metrics), [], JSON.stringify(metrics));
}, 600_000);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/game/balance.test.ts -t "targets"`
Expected: FAIL, listing the missed targets. They match the Task 9 baseline.

- [ ] **Step 3: Write the scale script and check it is lossless at 1×**

Create `scripts/scale-effects.mjs`:

```js
// Multiplies every effect in the 14 category decks. Money rounds to Rp5.000 and
// points to whole numbers. The special decks (krisis, debt collector) are written
// at their final size and are left alone.
// Usage: node scripts/scale-effects.mjs <moneyFactor> <pointFactor>
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

const scale = (stat, value) =>
  MONEY.has(stat)
    ? Math.sign(value) * Math.max(MONEY_STEP, Math.round((Math.abs(value) * money) / MONEY_STEP) * MONEY_STEP)
    : Math.sign(value) * Math.max(1, Math.round(Math.abs(value) * points));

for (const name of readdirSync(dir).filter((file) => file.endsWith(".json") && !SPECIAL.has(file))) {
  const url = new URL(name, dir);
  const deck = JSON.parse(readFileSync(url, "utf8"));
  for (const card of deck.cards)
    for (const choice of card.choices)
      for (const stat of Object.keys(choice.effects)) choice.effects[stat] = scale(stat, choice.effects[stat]);
  writeFileSync(url, JSON.stringify(deck, null, 2) + "\n");
}
```

Run: `node scripts/scale-effects.mjs 1 1 && git diff --stat src/data/content/cards`
Expected: no output (1× rewrites every file byte for byte). If a file shows a diff, stop: the file's formatting differs from `JSON.stringify(…, null, 2)`. Commit a formatting-only normalisation of that file first, in its own commit, before going on.

- [ ] **Step 4: Write the tuner**

Create `scripts/tune-balance.mjs`:

```js
// Tries every scale combination against the balance simulation and bakes the
// best one into the category decks. Factors are relative to the committed deck,
// and uncommitted changes in src/data/content/cards are discarded.
// Usage: npm run tune
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MONEY = [2, 3, 4, 5, 6];
const POINTS = [1.5, 2, 2.5, 3, 3.5];
const report = join(tmpdir(), "hidup-kok-gini-balance.json");
const run = (cmd, args, env = {}) =>
  execFileSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env }, shell: process.platform === "win32" });
const restore = () => run("git", ["checkout", "--", "src/data/content/cards"]);

const results = [];
for (const money of MONEY)
  for (const points of POINTS) {
    restore();
    run("node", ["scripts/scale-effects.mjs", String(money), String(points)]);
    run("npx", ["vitest", "run", "src/game/balance.test.ts", "-t", "report"], { BALANCE_REPORT: report });
    const { metrics, missed, distance } = JSON.parse(readFileSync(report, "utf8"));
    results.push({ money, points, distance, missed, ...metrics });
    console.log(`money ×${money}, points ×${points}: ${missed.length ? missed.join("; ") : "all targets met"}`);
  }
restore();

results.sort((a, b) => a.distance - b.distance || a.money - b.money || a.points - b.points);
console.table(
  results.map(({ money, points, distance, dangerByJune, borrowed, crisisRecovery, comeback }) => ({
    money, points, distance: +distance.toFixed(3), dangerByJune, borrowed, crisisRecovery, comeback,
  })),
);
const best = results[0];
run("node", ["scripts/scale-effects.mjs", String(best.money), String(best.points)]);
if (best.missed.length) {
  console.error(`Best combination still misses: ${best.missed.join("; ")}`);
  process.exit(1);
}
console.log(`Baked money ×${best.money}, points ×${best.points}.`);
```

In `package.json` `scripts`, add `"tune": "node scripts/tune-balance.mjs"` after `"test"`.

- [ ] **Step 5: Commit everything so far, then run the tuner**

The tuner restores the card folder from git, so the tree must be committed first.

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add the effect scaling and balance tuning scripts

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
npm run tune
```

Expected: 25 lines of progress, then a table sorted by distance, ending with `Baked money ×M, points ×P.` and exit code 0. It takes several minutes.

**Decision point:** if the tuner exits 1 ("Best combination still misses"), stop. Report the table to the user. Adding card costs and gates in plan 2 is the intended lever for the missed targets, so don't widen the targets or invent new knobs here.

- [ ] **Step 6: Loosen the per-effect size lint to the new scale**

In `src/data/content.test.ts`, in the test `"every card has a real cost and effect sizes that survive randomization"`:
- Replace `size < 3 || size > 20` with `size < 3 || size > 70`.
- Add this comment above that line: `// Points were scaled by the balance tuner (at most ×3.5 on a 20-point maximum).`

Run: `npx vitest run src/data src/game/balance.test.ts`
Expected: PASS, including `"balance lands inside the swingy-with-comebacks targets"`.

- [ ] **Step 7: Re-record the fingerprints**

In `src/data/content-fingerprint.test.ts`:
- Update the imports: add `import { choiceAvailability } from "../game/availability";`, `import { STATUSES } from "./statuses";` and `import { DECK_META } from "./special-decks";`, and change the `EVENTS` import to `import { ALL_CARDS, EVENT_BY_ID } from "./events";`.
- In `contentFingerprint`, replace the `events:` entry with:

```ts
    events: ALL_CARDS.map((event) => [
      event.id,
      event.category,
      event.title,
      event.description,
      event.requiresStatus,
      event.crisis,
      event.choices.map((choice) => [
        choice.label,
        Object.entries(choice.effects),
        choice.result,
        Object.entries(choice.requires),
        choice.requiresStatus,
        choice.blockedByStatus,
        choice.gains,
        choice.clears,
        choice.tags,
      ]),
    ]),
    statuses: Object.values(STATUSES).map((s) => [s.id, s.label, s.icon, s.months, Object.entries(s.payday), s.trigger]),
    deckMeta: Object.entries(DECK_META).map(([id, meta]) => [id, meta.label, meta.icon, meta.color]),
```

- Add `ECONOMY.debt,` as the last element of the `economy:` array.
- In `playFixedPolicy`, replace the `else if (state.phase === "event")` branch with:

```ts
    else if (state.phase === "event") {
      const player = state.players[state.currentPlayer];
      const event = EVENT_BY_ID[state.eventId!];
      const offset = state.turn % event.choices.length;
      const index = [...event.choices.keys()]
        .map((k) => (k + offset) % event.choices.length)
        .find((i) => choiceAvailability(player, event.choices[i], state.choiceEffects[i]).kind !== "locked")!;
      state = gameReducer(state, { type: "CHOOSE", index });
    }
```

- Change both `test.skip(` back to `test(`.
- Rename the first test to `"content fingerprint is unchanged (cards, statuses, board, economy, jokes, endings)"`.
- Replace the "Rules v5 in progress" comment with:

```ts
// Re-recorded for rules v5 (hutang, statuses, crises, scaled effects).
```

Run: `npx vitest run src/data/content-fingerprint.test.ts`
Expected: FAIL twice, with `expected '<new hash>' to equal 'e307…'` and `… 'ef79…'`. Copy each actual hash into its `assert.equal` line.

Run it again. Expected: PASS.

- [ ] **Step 8: Full verification**

Run: `npm run typecheck && npm test && npm run build`
Expected: typecheck clean, every test passes, and the build succeeds.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Scale card effects to the tuned balance and re-record the fingerprints

Tuner result: money ×M, points ×P (replace with the baked factors), with
<paste the winning table row: dangerByJune, borrowed, crisisRecovery,
comeback>.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## After this plan

- **Plan 2 (content)** runs on the same branch. It covers:
  - about 11 more authored statuses
  - the ~95 hand-edited choices
  - ~30 follow-up cards, plus the krisis and debt-collector decks grown to about 8 cards each
  - new endings for Hutang and crises
  - a copy-guide rule for debt-collector jokes
  - a `npm run tune` pass with factors around 1.0, followed by re-recorded fingerprints
- **Plan 3 (UI and docs)** covers:
  - the three choice-button states, the Hutang chip, status pills, the danger-zone look, crisis stickers, the receipt lines, the squad dialog and the rules dialog
  - the new screenshots for the user to review
  - README, DESIGN.md and copy-guide updates
  - the merge of `feature/consequences`
