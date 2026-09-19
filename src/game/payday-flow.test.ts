import assert from "node:assert/strict";
import { test } from "vitest";
import { TOTAL_MONTHS } from "../data/calendar";
import { EVENT_BY_ID } from "../data/events";
import { choiceAvailability } from "./availability";
import { createGame } from "./create-game";
import { gameReducer } from "./reducer";
import type { Action, GameState } from "./types";

// Regression: after the monthly payday the first player used to be handed a
// "shared" payday card as if it were their turn, then handed the dice again
// for the new month, so they resolved two cards every month and everyone
// else one. Payday must lead straight into the next month's first roll.

function firstOpenChoice(state: GameState): number {
  const event = EVENT_BY_ID[state.eventId!];
  const mover = state.players[state.currentPlayer];
  return [...event.choices.keys()].find(
    (i) => choiceAvailability(mover, event.choices[i], state.choiceEffects[i]).kind !== "locked",
  )!;
}

function playWholeGame(count: number, seed: number) {
  const names = Array.from({ length: count }, (_, i) => `Pemain ${i + 1}`);
  let state = createGame(names, seed);
  const cardsDrawn = Array(count).fill(0) as number[];
  const rollers: number[] = [];
  const afterPayday: GameState[] = [];
  for (let guard = 0; state.phase !== "finished"; guard++) {
    assert.ok(guard < 2000, "game did not finish");
    let action: Action;
    switch (state.phase) {
      case "ready":
        rollers.push(state.currentPlayer);
        action = { type: "ROLL" };
        break;
      case "payday":
        action = state.pendingPosition !== null ? { type: "CONTINUE_PAYDAY" } : { type: "PAYDAY_CHOOSE", index: 0 };
        break;
      case "resolved":
        action = { type: "NEXT" };
        break;
      default:
        cardsDrawn[state.currentPlayer]++;
        action = { type: "CHOOSE", index: firstOpenChoice(state) };
    }
    const before = state;
    state = gameReducer(state, action);
    assert.notEqual(state, before, `${action.type} was ignored in phase ${before.phase}`);
    if (before.phase === "payday" && state.phase !== "payday") afterPayday.push(state);
  }
  return { state, cardsDrawn, rollers, afterPayday };
}

for (const count of [2, 3, 4]) {
  test(`${count} players: payday hands the dice to player 1 and nobody draws an extra card`, () => {
    for (let seed = 0; seed < 20; seed++) {
      const { state, cardsDrawn, rollers, afterPayday } = playWholeGame(count, seed * 7919);

      assert.deepEqual(cardsDrawn, Array(count).fill(TOTAL_MONTHS), "every player resolves exactly one card per month");
      assert.deepEqual(
        rollers,
        Array.from({ length: count * TOTAL_MONTHS }, (_, turn) => turn % count),
        "players roll strictly in seat order, one turn each per month",
      );

      assert.equal(afterPayday.length, TOTAL_MONTHS);
      afterPayday.slice(0, -1).forEach((next, i) => {
        assert.equal(next.phase, "ready", `after payday ${i + 1} the table waits for a roll`);
        assert.equal(next.currentPlayer, 0, "player 1 opens the new month");
        assert.equal(next.month, i + 2);
        assert.equal(next.turn, (i + 1) * count + 1, "the turn counter moves on to the new month");
      });
      assert.equal(afterPayday.at(-1)!.phase, "finished", "December's payday ends the game");
      assert.equal(state.month, TOTAL_MONTHS);
    }
  });
}
