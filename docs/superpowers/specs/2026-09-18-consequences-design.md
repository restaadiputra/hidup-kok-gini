# Consequences: hutang, danger zones, and statuses

Date: 2026-09-18 · Status: approved design, awaiting spec review

## Problem

Stat changes are too small to matter. Across the 282 choices today the median change is about −Rp50,000 on a Rp2,500,000 start (plus roughly Rp1,000,000 net per payday) and ±3–6 points on 0–100 stats. Nobody gets anywhere near zero by mid-year, no choice is ever out of reach, and nothing a player picks changes what they can pick later.

## Goal

A year that swings. By mid-year a player can be broke, in debt, or at breaking point, and that state changes the options on the cards they draw. Choices leave marks that shape later turns.

Target feel (option **B, swingy with comebacks**), measured by simulation:

| Metric | Target |
|---|---|
| Players who touched a danger zone (any of Kewarasan/Relasi/Hoki ≤20, or Hutang > 0) by the end of June | 45–60% |
| Players who borrowed from the debt collector at least once | 25–40% |
| Crises that recover (stat back above 20) before December | ≥60% |
| Games where the winner was below the median score at some point in April–September | ≥30% |

## Rules

### Stats

- **Dompet** is cash and never goes below Rp0.
- **Hutang** is a new stat in rupiah. It starts at Rp0 and never goes below Rp0.
- Kewarasan, Relasi, and Hoki stay within 0–100.
- **Score** is `floor((Dompet − Hutang) / 100,000) + Kewarasan + Relasi + Hoki`.

### Paying for a choice

- A choice's cost is its negative `dompet` effect, after the per-draw roll that already happens today, so the preview is exact.
- If Dompet covers the cost, the choice works as it does today.
- If Dompet does not cover the cost, the choice stays selectable as **"Bayar pakai utang"**:
  - The player pays everything they have, so Dompet becomes 0.
  - The shortfall plus the collector fee is added to Hutang: `hutang += ceil(shortfall × (1 + feeRate))`.
  - Worked example: Dompet Rp100,000 and cost Rp100,100 gives a shortfall of Rp100. Hutang goes up by Rp120 and Dompet ends at Rp0.
- Positive `dompet` effects never pay Hutang down automatically. Only payday instalments and choices with explicit `hutang` effects reduce it.

### Payday

Payday runs in this order, after salary, living costs, and the bill:

1. **Status payday effects** are applied, one receipt line per status.
2. **Interest:** `hutang += floor(hutang × interestRate)`, rounded down to Rp1,000.
3. **Cicilan:**
   - `paid = min(hutang, installmentMax, dompet)`.
   - Hutang and Dompet both drop by `paid`.
   - Any part that could not be paid stays in Hutang.

The receipt shows a line for each step that is non-zero.

### Danger zone and crises

- A stat at **≤20** is in the danger zone. The stat is shown as a warning, and any choice whose `requires` the player fails is locked.
- A stat at **0** starts a crisis status. Each crisis clears when its stat goes back above 20.

| Crisis | Trigger | Effect while active |
|---|---|---|
| `burnout` | Kewarasan 0 | Every draw comes from the krisis deck's burnout cards |
| `ghosted` | Relasi 0 | Choices tagged `minta-tolong` are locked |
| `apes` | Hoki 0 | Plot twist (kejutan) tiles draw from the krisis deck's apes cards |

A crisis must be escapable from inside itself. Every burnout card has at least one always-available choice that raises Kewarasan, and every apes card has one that raises Hoki. When a crisis pool runs out, it reshuffles the same way category pools do today.

The status **`dicari-debt-collector`** is added while Hutang is above `collectorThreshold`. While it is active, a draw has a `collectorChance` (starting value 0.35) of coming from the debt-collector deck instead of the tile's pool.

### Statuses

- A status is a named, persistent mark on a player.
- **How a status starts and ends:**
  - Choices add statuses with `gains` and remove them with `clears`.
  - A status with `months` expires after that many month changes.
  - A status without `months` lasts until a choice clears it.
- **What an active status can do:**
  - Apply a **payday effect**.
  - **Lock choices** that name it in `blockedByStatus`.
  - **Unlock choices** that name it in `requiresStatus`.
  - **Unlock follow-up cards** that name it in the card-level `requiresStatus`. Those cards join the player's pool for their category only while the status is active.
- Gaining a status the player already has resets its duration.

### Never soft-lock

Every card has at least one choice that is available in every possible player state. That choice has no `requires`, no `requiresStatus`, no `blockedByStatus`, and no `minta-tolong` tag. A choice that would go into Hutang still counts as available. This is enforced by a content test.

## Data (JSON, validated on load)

**`players.json`**: `initialStats` gains `"hutang": 0`.

**`economy.json`** gains a `debt` block. The values below are starting points that the balancing step tunes:

```json
"debt": { "feeRate": 0.2, "interestRate": 0.1, "installmentMax": 500000,
          "collectorThreshold": 1000000, "collectorChance": 0.35 }
```

**`statuses.json`** (new) holds one entry per status id:

```json
"kerja-sampingan": { "label": "Kerja sampingan", "icon": "briefcase", "months": 3,
                     "payday": { "dompet": 300000, "kewarasan": -5 } },
"burnout": { "label": "Burnout", "icon": "flame",
             "trigger": { "stat": "kewarasan", "atMost": 0, "clearAbove": 20 } },
"dicari-debt-collector": { "label": "Dicari debt collector", "icon": "phone",
             "trigger": { "stat": "hutang", "above": 1000000 } }
```

- The authored statuses are *kerja-sampingan, ikut-arisan, lagi-pdkt, punya-pacar, utang-ke-teman, langganan-gym, kredit-motor, admin-grup, anak-kesayangan-bos, paket-data-sekarat, diet-ketat, healing-mode*. The list may change during writing.
- The automatic statuses are *burnout, ghosted, apes, dicari-debt-collector*. Choices cannot `gains` them; they come only from their trigger.

**Card and choice fields** are all optional, so existing cards stay valid:

| Level | Field | Meaning |
|---|---|---|
| choice | `requires` | stat minimums, e.g. `{ "relasi": 30 }` |
| choice | `requiresStatus` / `blockedByStatus` | status id |
| choice | `gains` / `clears` | lists of status ids |
| choice | `tags` | `["minta-tolong"]` is locked while `ghosted` |
| choice | `effects.hutang` | explicit debt change, e.g. a friend lends money (+) or a windfall pays it off (−) |
| card | `requiresStatus` | makes the card a follow-up for that status |

**New decks.**
- `cards/krisis.json` holds about 8 cards, each tagged `crisis: "burnout" | "apes"`.
- `cards/debt-collector.json` holds about 8 cards.
- These decks are not board categories. They are drawn only through the rules above, and they share the existing draw history so a card is not repeated until its pool runs out.

**Parser checks.** A load fails if any of these is wrong:
- status ids referenced from cards exist
- automatic statuses are never in `gains`
- `requires` keys are real stats
- follow-up cards name a non-automatic status

**Scaling.** Scaling factors are applied to the JSON by a one-off script, so the files show the real numbers. There is no runtime multiplier.

## Engine

Each concern is its own pure module, in the style of the existing `src/game/` split:

| Module | Responsibility |
|---|---|
| `availability.ts` | `choiceAvailability(player, choice, rolledEffects)` returns `{ kind: "ok" } \| { kind: "debt", shortfall, added } \| { kind: "locked", reason }`. It is the single source for both the UI and the reducer. |
| `debt.ts` | borrowing on choose; interest and cicilan on payday |
| `statuses.ts` | gain, clear, expire on month change, derive automatic statuses from stats, payday effects |
| `deck.ts` | `eligiblePool(player, tile)`, which covers crisis override, collector chance, and follow-ups, then draws as today |
| `reducer.ts` | `choose` rejects locked choices the same way it rejects invalid ones today; it applies the debt, the effects, and the status changes, then re-derives the automatic statuses |
| `payday.ts` | the receipt gains `statusLines`, `interest`, and `installment` |
| `scoring.ts` | the new score formula; endings rules may test `hutang` and statuses |

- **Player state** gains `stats.hutang` and `statuses: { id: string; untilMonth: number | null }[]`.
- **Determinism.** New random draws happen only where they belong: the collector-chance roll and the draws from the new pools. Their order within a turn is fixed and documented next to the code.
- **Saves.**
  - The save key becomes `hidup-kok-gini:v5` and `SAVE_VERSION` becomes 5.
  - v4 moves into `LEGACY_SAVE_KEYS`, so v4 players see the existing "start a new game" notice.
  - The golden fingerprints are regenerated in a commit labelled as an intentional rules change.

## UI

Everything follows DESIGN.md: flat printed pieces with hard edges, no faded fills, and one viewport with no page scroll.

**Choice buttons** have three states:
- **ok:** unchanged.
- **debt:** a strip reading "Bayar pakai utang · +Rp…" in the loss colours.
- **locked:** the piece is pressed flat (no bottom edge, `--raised` fill) with a lock icon and a one-line reason. It is not clickable, and the reason is exposed to assistive technology.

**Where the new state shows:**
- **Active player:** a Hutang chip when Hutang is above 0, and status pills under the name (at most 2 on phones, then "+n").
- **Danger zone:** the stat's chip and meter use the loss colours and show a warning icon.
- **Crisis:** a tilted sticker on the drawn card ("MODE BURNOUT", "LAGI APES") and a crisis-coloured category bar.
- **Squad dialog:** a Hutang row and a status list with months remaining.
- **Payday popup:** lines for status effects, interest, and cicilan, with the net total kept last.
- **Log, endings, and rules:**
  - The game log gets lines for borrowing, status changes, and crises.
  - New endings cover Hutang and crises.
  - The rules dialog gains sections on Hutang, Zona bahaya, and Status.

## Content

- Scale all existing effects with per-stat factors chosen by the balancing step. Joke text is unchanged.
- Hand-edit about 95 choices, spread across all 14 categories, to add costs, requirements, tags, and status gains and clears.
- Write about 12 statuses, about 30 follow-up cards, about 8 krisis cards, and about 8 debt-collector cards.
- All new text passes `content.test.ts` and follows `docs/copy-guide.md`. The guide gains a debt-collector rule: the collector and the situation are the joke, never the borrower's poverty. There are no threats of violence, and borrowing never looks attractive.

## Testing

- **Balancing simulation.** A seeded Vitest suite runs about 3,000 games with three policies: random, greedy (best immediate score), and cautious (avoids debt and danger). It asserts every target in the Goal table. It stays in the suite as a regression guard.
- **Invariants,** checked in every simulated state:
  - Dompet ≥ 0 and Hutang ≥ 0.
  - Kewarasan, Relasi, and Hoki stay within 0–100.
  - Every drawn card has at least one available choice.
  - A locked choice is rejected by the reducer.
  - Replaying the journal reproduces the same state.
- **Unit tests:**
  - `availability`: the worked Rp100,000 vs Rp100,100 example
  - `debt`: fee, interest, and a partial cicilan
  - `statuses`: expiry, re-gain, and trigger/clear thresholds
  - `deck`: crisis override, collector chance, and follow-up eligibility
- **Content tests:** the never-soft-lock rule, referenced ids exist, and follow-ups name valid statuses.
- **Screenshots.** Capture the new states (locked choice, debt choice, each crisis, status pills, receipt with cicilan) on desktop and phone in light and dark. The user reviews them and they become the new baseline.

## Build order

A commit after each step, with the full suite passing each time.

1. Engine and data model, running on the current cards.
2. Balancing: the simulation, then the scale factors baked into the JSON.
3. Content: statuses, choice edits, and the new cards and decks.
4. UI, with the screenshots reviewed by the user.
5. Docs: README rules and save checklist, DESIGN.md components, and copy-guide additions.

## Out of scope

- Loans as separate items with lenders and due dates (option C from the hutang discussion).
- Negative values for Kewarasan, Relasi, and Hoki.
- Players trading, lending, or targeting each other.
- Migrating v4 saves.
