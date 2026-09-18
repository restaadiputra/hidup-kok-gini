import assert from "node:assert/strict";
import { test } from "vitest";
import { BOARD } from "../data/categories";
import { ECONOMY, PAYDAY_REASONS } from "../data/economy";
import { EVENT_BY_ID, EVENTS } from "../data/events";
import { INITIAL_STATS } from "../data/players";
import { createGame } from "./create-game";
import { random } from "./random";
import { gameReducer } from "./reducer";
import { replaySession } from "./replay";
import { ending, score } from "./scoring";
import { applyEffects } from "./stats";
import type { Action, Session } from "./types";

test("payday deductions vary within range, match balances and reset next turn", () => {
  const amounts = new Set<number>();
  const reasons = new Set<string>();
  const salaries = new Set<number>();
  const livingCosts = new Set<number>();
  let rareCount = 0;
  for (let seed = 0; seed < 1000; seed++) {
    const initial = createGame(["A", "B"], seed * 7919);
    initial.players[0].position = BOARD.length - 1;
    const rolled = gameReducer(initial, { type: "ROLL" });
    const receipt = rolled.paydayDetails!;
    assert.ok(receipt);
    const range = receipt.rare ? ECONOMY.rareBill : ECONOMY.deduction;
    assert.ok(receipt.deduction >= range.min && receipt.deduction <= range.max);
    assert.equal(receipt.deduction % range.step, 0);
    assert.ok((receipt.rare ? PAYDAY_REASONS.rare : PAYDAY_REASONS.common).includes(receipt.reason));
    assert.ok(receipt.salary >= ECONOMY.salary.min && receipt.salary <= ECONOMY.salary.max);
    assert.ok(receipt.livingCost >= ECONOMY.livingCost.min && receipt.livingCost <= ECONOMY.livingCost.max);
    assert.equal(receipt.salary % 50_000, 0);
    assert.equal(receipt.livingCost % 50_000, 0);
    assert.equal(receipt.net, receipt.salary - receipt.livingCost - receipt.deduction);
    assert.equal(receipt.net < 0, receipt.rare);
    if (receipt.rare) {
      rareCount++;
      const broke = { ...initial, players: initial.players.map((p, i) => i === 0 ? { ...p, stats: { ...p.stats, dompet: 0 } } : p) };
      const unlucky = gameReducer(broke, { type: "ROLL" });
      assert.equal(unlucky.players[0].stats.dompet, receipt.net, "rare bills can put Dompet into debt");
      assert.equal(unlucky.phase, "payday", "debt does not skip the paycheck or eliminate a player");
    }
    assert.equal(rolled.players[0].stats.dompet - initial.players[0].stats.dompet, receipt.net);
    assert.ok(rolled.log[0].includes(receipt.reason));
    amounts.add(receipt.deduction);
    reasons.add(receipt.reason);
    salaries.add(receipt.salary);
    livingCosts.add(receipt.livingCost);
    assert.equal(rolled.phase, "payday");
    assert.equal(rolled.players[0].position, 0);
    for (const action of [{ type: "CHOOSE", index: 0 }, { type: "NEXT" }, { type: "ROLL" }] as Action[])
      assert.equal(gameReducer(rolled, action), rolled);
    const continued = gameReducer(rolled, { type: "CONTINUE_PAYDAY" });
    assert.equal(continued.players[0].position, rolled.pendingPosition);
    assert.equal(continued.players[0].stats.dompet, rolled.players[0].stats.dompet);
    assert.equal(continued.rng, rolled.rng);
    assert.equal(gameReducer(continued, { type: "CONTINUE_PAYDAY" }), continued);
    const resolved = gameReducer(continued, { type: "CHOOSE", index: 0 });
    assert.deepEqual(resolved.paydayDetails, receipt);
    const next = gameReducer(resolved, { type: "NEXT" });
    assert.equal(next.paydayDetails, null);
    assert.deepEqual(next.choiceEffects, []);
  }
  assert.ok(amounts.size > 20);
  assert.equal(reasons.size, PAYDAY_REASONS.common.length + PAYDAY_REASONS.rare.length);
  assert.equal(salaries.size, 9);
  assert.equal(livingCosts.size, 9);
  assert.ok(rareCount >= 40 && rareCount <= 120, `Rare payday frequency: ${rareCount}/1000`);
});

test("reject invalid player counts, names and seeds", () => {
  for (const names of [
    [],
    ["A"],
    ["A", "B", "C", "D", "E"],
    [" ", "B"],
    ["A".repeat(21), "B"],
  ])
    assert.throws(() => createGame(names, 1));
  for (const seed of [-1, 0x100000000, NaN, Infinity, 2.5])
    assert.throws(() => createGame(["A", "B"], seed));
  assert.equal(createGame([" A ", "B"], 0).players[0].name, "A");
});

test("seeded dice are repeatable and produce all six faces", () => {
  let rng = 17;
  const faces = new Set<number>();
  for (let i = 0; i < 100; i++) {
    const result = random(rng);
    assert.deepEqual(random(rng), result);
    rng = result.rng;
    const face = Math.floor(result.value * 6) + 1;
    assert.ok(face >= 1 && face <= 6);
    faces.add(face);
  }
  assert.equal(faces.size, 6);
});

test("phase guards prevent duplicate rolls, choices, invalid choices and premature turns", () => {
  const initial = createGame(["A", "B"], 1);
  assert.equal(gameReducer(initial, { type: "NEXT" }), initial);
  assert.equal(gameReducer(initial, { type: "CONTINUE_PAYDAY" }), initial);
  assert.equal(gameReducer(initial, { type: "CHOOSE", index: 0 }), initial);
  const rolled = gameReducer(initial, { type: "ROLL" });
  assert.equal(gameReducer(rolled, { type: "ROLL" }), rolled);
  assert.equal(gameReducer(rolled, { type: "NEXT" }), rolled);
  for (const index of [-1, 999, 0.5, NaN])
    assert.equal(gameReducer(rolled, { type: "CHOOSE", index }), rolled);
  const resolved = gameReducer(rolled, { type: "CHOOSE", index: 0 });
  assert.equal(gameReducer(resolved, { type: "CHOOSE", index: 0 }), resolved);
  assert.equal(gameReducer(resolved, { type: "ROLL" }), resolved);
});

test("landing or passing GAJIAN pays exactly once, with no salary on initial START", () => {
  const initial = createGame(["A", "B"], 1);
  assert.equal(initial.players[0].stats.dompet, INITIAL_STATS.dompet);
  const rollValue = Math.floor(random(initial.rng).value * 6) + 1;
  for (const [position, expectedPayday] of [
    [0, false],
    [BOARD.length - rollValue, true],
    [BOARD.length - 1, true],
  ] as const) {
    const state = {
      ...initial,
      players: initial.players.map((p, i) =>
        i === 0 ? { ...p, position } : p,
      ),
    };
    const next = gameReducer(state, { type: "ROLL" });
    assert.equal(next.payday, expectedPayday);
    assert.equal(
      next.players[0].position,
      expectedPayday ? 0 : (position + rollValue) % BOARD.length,
    );
    assert.equal(
      next.players[0].stats.dompet,
      INITIAL_STATS.dompet + (next.paydayDetails?.net ?? 0),
    );
    if (expectedPayday) {
      assert.ok(next.paydayDetails);
      assert.equal(next.pendingPosition, (position + rollValue) % BOARD.length);
      assert.equal(next.paydayDetails.net, next.paydayDetails.salary - next.paydayDetails.livingCost - next.paydayDetails.deduction);
      const continued = gameReducer(next, { type: "CONTINUE_PAYDAY" });
      assert.equal(continued.phase, "event");
      assert.equal(continued.players[0].position, (position + rollValue) % BOARD.length);
      assert.equal(continued.players[0].stats.dompet, next.players[0].stats.dompet);
    } else assert.equal(next.paydayDetails, null);
    assert.ok(next.eventId);
    assert.equal(next.players[1], state.players[1]);
    assert.equal(gameReducer(next, { type: "ROLL" }), next);
  }
});

test("category deck avoids repeating a card until its pool is exhausted", () => {
  let state = createGame(["A", "B"], 45);
  const pool = EVENTS.filter((event) => event.category === "kerja").length;
  const seen: string[] = [];
  for (let i = 0; i <= pool; i++) {
    const dice = 1 + Math.floor(random(state.rng).value * 6);
    const position = (1 - dice + BOARD.length) % BOARD.length;
    state = {
      ...state,
      phase: "ready",
      players: state.players.map((p, j) => (j === 0 ? { ...p, position } : p)),
    };
    state = gameReducer(state, { type: "ROLL" });
    assert.equal(EVENT_BY_ID[state.eventId!].category, "kerja");
    seen.push(state.eventId!);
  }
  assert.equal(new Set(seen.slice(0, pool)).size, pool);
  assert.ok(seen.slice(0, pool).includes(seen[pool]));
});

for (const count of [2, 3, 4]) {
  test(`${count} players finish exactly 12 months with deterministic, immutable, replayable state across 30 seeds`, () => {
    for (let seed = 0; seed < 30; seed++) {
      const names = Array.from({ length: count }, (_, i) => `Pemain ${i + 1}`);
      let state = createGame(names, seed);
      const session: Session = { version: 4, names, seed, actions: [] };
      const turns = Array(count).fill(0) as number[];
      let salaryCount = 0;
      for (let turn = 0; turn < 12 * count; turn++) {
        assert.equal(state.month, Math.floor(turn / count) + 1);
        assert.equal(state.currentPlayer, turn % count);
        assert.equal(state.phase, "ready");
        const frozenSnapshot = JSON.stringify(state);
        const before = state;
        const rollAction: Action = { type: "ROLL" };
        state = gameReducer(state, rollAction);
        session.actions.push(rollAction);
        assert.equal(
          JSON.stringify(before),
          frozenSnapshot,
          "reducer must not mutate input",
        );
        assert.deepEqual(gameReducer(before, rollAction), state);
        if (state.payday) {
          salaryCount++;
          assert.equal(state.phase, "payday");
          assert.deepEqual(replaySession(session)?.game, state, "refresh keeps the pending paycheck");
          const continueAction: Action = { type: "CONTINUE_PAYDAY" };
          state = gameReducer(state, continueAction);
          session.actions.push(continueAction);
        }
        assert.equal(state.phase, "event");
        const category =
          BOARD[state.players[state.currentPlayer].position].category;
        if (category !== "kejutan" && category !== "gajian")
          assert.equal(EVENT_BY_ID[state.eventId!].category, category);
        const event = EVENT_BY_ID[state.eventId!];
        const index = (seed + turn) % event.choices.length;
        const choiceAction: Action = { type: "CHOOSE", index };
        const expectedStats = applyEffects(
          state.players[state.currentPlayer].stats,
          state.choiceEffects[index],
        );
        state = gameReducer(state, choiceAction);
        session.actions.push(choiceAction);
        assert.equal(state.phase, "resolved");
        assert.deepEqual(
          state.players[state.currentPlayer].stats,
          expectedStats,
        );
        turns[state.currentPlayer]++;
        state = gameReducer(state, { type: "NEXT" });
        session.actions.push({ type: "NEXT" });
        for (const p of state.players) {
          assert.ok(p.position >= 0 && p.position < BOARD.length);
          for (const stat of ["kewarasan", "relasi", "hoki"] as const)
            assert.ok(p.stats[stat] >= 0 && p.stats[stat] <= 100);
        }
      }
      assert.equal(state.phase, "finished");
      assert.equal(state.month, 12);
      assert.ok(salaryCount > 0);
      assert.deepEqual(turns, Array(count).fill(12));
      const restored = replaySession(JSON.parse(JSON.stringify(session)));
      assert.deepEqual(restored?.game, state);
      for (const p of state.players) {
        assert.ok(Number.isFinite(score(p)));
        assert.ok(ending(p).title && ending(p).text);
      }
      for (const action of [
        { type: "ROLL" },
        { type: "CONTINUE_PAYDAY" },
        { type: "NEXT" },
        { type: "CHOOSE", index: 0 },
      ] as Action[])
        assert.equal(gameReducer(state, action), state);
    }
  });
}
