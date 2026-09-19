# Dynamics overhaul task log

Status: implementation complete; manual playtest follow-up pending
Last updated: 2026-09-19

This file is the continuation point for the gameplay-dynamics overhaul requested by testers. Complete tasks in order and update the status/checklist after each verified slice. Keep the engine deterministic: all new randomness must flow through `src/game/random.ts`.

## Task 1 — Baseline and balance instrumentation

- [x] Add simulation metrics for critical statuses, score spread, debt, card/theme repetition, and sudden-event frequency.
- [x] Record a baseline report in `docs/dynamics-baseline.json`.
- [x] Add regression assertions for the target ranges.

## Task 2 — Make the economy and status pressure harsher

- [x] Rebalance effective card pressure and add meaningful trade-offs.
- [x] Tune status thresholds/durations and monthly status costs.
- [x] Tune salary, living cost, bills, and debt pressure.
- [x] Re-run simulations and update the baseline report.

## Task 3 — Reset and expand joke content

- [x] Audit stale/repeated milenial jokes using `docs/copy-guide.md`.
- [x] Rewrite/add the first content batch across milenial, Gen Z, and Gen Alpha themes.
- [x] Expand each category to at least 18 cards; current pool is 18 per category (252 total including the existing decks).
- [x] Add content tests for audience coverage, tone, and minimum pool sizes.

## Task 4 — Reduce perceived repetition

- [x] Add card theme metadata (with category fallback for legacy cards).
- [x] Track recent themes in draw state and bias away from recent themes.
- [x] Preserve deterministic replay and reset history safely when a pool is exhausted.
- [x] Add tests for card and theme diversity.

## Task 5 — Replace tile-based payday with monthly settlement

- [x] Add a month-end phase after the last player resolves their turn.
- [x] Settle salary, living cost, debt, and payday statuses once per month.
- [x] Make the gajian tile a normal encounter; salary no longer triggers on board laps.
- [x] Update UI, replay version, saves, reducer tests, and simulations.

## Task 6 — Add guaranteed sudden events

- [x] Add a deterministic sudden-event deck with very lucky and very unlucky outcomes.
- [x] Guarantee at least one event per game, with a bounded maximum.
- [x] Add state, reducer actions, log messages, UI resolution, replay, and tests.

## Task 7 — Add table-wide card effects

- [x] Extend choice data with effect targets: self, all, others.
- [x] Add a non-blocking interaction flow: table-wide choices resolve all targeted players atomically.
- [x] Add a watch-party patungan card that affects the whole table.
- [x] Add reducer, UI, replay, and balance tests for automatic table-wide effects.

## Task 8 — Verification and playtest handoff

- [x] Run `npm run typecheck`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Run seeded simulations for 2, 3, and 4 players.
- [x] Record remaining issues and manual playtest prompts.

## Continuation protocol

If work stops mid-task, update the task checkbox and add a short note under `## Progress notes` with the files changed, tests run, and the next smallest action. Do not restart completed tasks.

## Progress notes

- 2026-09-19: Added theme-aware card draws, harsher economy/status thresholds, a guaranteed sudden-event deck, monthly payday settlement, a 252-card pool, and table-wide choice targeting. `typecheck`, full tests, build, and seeded dynamics report pass. Remaining work is manual playtest tuning and optional expansion of targeted-player interaction beyond automatic all/others effects.
- 2026-09-19: Manual playtest prompts: verify month-end gajian is understood, confirm forced Plot twist feels surprising rather than scripted, check that a table-wide patungan choice is readable before confirmation, and watch whether the 49.3% danger-by-June baseline feels tense rather than punishing.
- 2026-09-19: Implemented the recommended payday flow: monthly settlement now opens a shared roster summary for every player, and the former Gajian tile is now a dedicated Bonus Dadakan deck. Verification passed after the change.
- 2026-09-19: Payday is now an interactive mini-phase. Each player chooses Bayar aman, Gaya dulu, or Simpan rapat-rapat, followed by one shared payday event. Save format is v7; typecheck, tests, and build pass.
- 2026-09-19: Rebalanced choice magnitudes with deterministic median compression. Extreme options now move toward parity without changing their signs or trade-off direction; the refreshed baseline reports 56.9% danger-by-June.
