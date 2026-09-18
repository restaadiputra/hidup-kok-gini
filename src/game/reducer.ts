import { TOTAL_MONTHS } from "../data/calendar";
import { BOARD } from "../data/categories";
import { EVENT_BY_ID } from "../data/events";
import { drawEvent } from "./deck";
import { addToLog, choiceMessage, rollMessage } from "./log-messages";
import { rollPaycheck } from "./payday";
import { random, rollDie } from "./random";
import { applyEffects, appliedChanges, randomizeEffects } from "./stats";
import type { Action, GameState, Paycheck, Player } from "./types";

const currentPlayer = (state: GameState) => state.players[state.currentPlayer];

function updatePlayer(state: GameState, change: (player: Player) => Player): Player[] {
  return state.players.map((p) => (p.id === state.currentPlayer ? change(p) : p));
}

function rollTurn(state: GameState): GameState {
  const player = currentPlayer(state);
  const dieRoll = random(state.rng);
  const dice = rollDie(dieRoll.value);
  const distance = player.position + dice;
  const position = distance % BOARD.length;
  const payday = distance >= BOARD.length;
  const tile = BOARD[position];

  const { event, drawn, rng: afterDraw } = drawEvent(state.drawn, tile, dieRoll.rng, player);
  let rng = afterDraw;
  const choiceEffects = event.choices.map((choice) => {
    const rolled = randomizeEffects(choice.effects, rng);
    rng = rolled.rng;
    return rolled.effects;
  });

  let paydayDetails: Paycheck | null = null;
  if (payday) {
    const rolled = rollPaycheck(rng);
    paydayDetails = rolled.paycheck;
    rng = rolled.rng;
  }

  return {
    ...state,
    dice,
    rng,
    choiceEffects,
    paydayDetails,
    // Passing GAJIAN parks the pawn there until the paycheck is acknowledged.
    phase: payday ? "payday" : "event",
    pendingPosition: payday ? position : null,
    eventId: event.id,
    drawn,
    payday,
    resolution: "",
    lastEffects: {},
    players: updatePlayer(state, (p) => ({
      ...p,
      position: payday ? 0 : position,
      stats: paydayDetails ? applyEffects(p.stats, { dompet: paydayDetails.net }) : p.stats,
    })),
    log: addToLog(state.log, rollMessage(player.name, dice, tile.label, paydayDetails)),
  };
}

function continuePayday(state: GameState, destination: number): GameState {
  return {
    ...state,
    phase: "event",
    pendingPosition: null,
    players: updatePlayer(state, (p) => ({ ...p, position: destination })),
  };
}

function choose(state: GameState, eventId: string, index: number): GameState {
  const choice = EVENT_BY_ID[eventId]?.choices[index];
  const effects = state.choiceEffects[index];
  if (!choice || !effects || !Number.isInteger(index)) return state;
  const player = currentPlayer(state);
  const stats = applyEffects(player.stats, effects);
  return {
    ...state,
    phase: "resolved",
    resolution: choice.result,
    lastEffects: appliedChanges(player.stats, stats, effects),
    players: updatePlayer(state, (p) => ({ ...p, stats })),
    log: addToLog(state.log, choiceMessage(player.name, choice)),
  };
}

const isEndOfRound = (state: GameState) => state.currentPlayer === state.players.length - 1;

// The last player's December turn ends the game.
export const isFinalTurn = (state: GameState) => isEndOfRound(state) && state.month === TOTAL_MONTHS;

function nextTurn(state: GameState): GameState {
  if (isFinalTurn(state)) return { ...state, phase: "finished" };
  const endOfRound = isEndOfRound(state);
  return {
    ...state,
    currentPlayer: (state.currentPlayer + 1) % state.players.length,
    month: state.month + (endOfRound ? 1 : 0),
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

// Actions that don't fit the current phase return the same state object;
// replay relies on that identity to reject impossible journals.
export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "ROLL":
      return state.phase === "ready" ? rollTurn(state) : state;
    case "CONTINUE_PAYDAY":
      return state.phase === "payday" && state.pendingPosition !== null
        ? continuePayday(state, state.pendingPosition)
        : state;
    case "CHOOSE":
      return state.phase === "event" && state.eventId ? choose(state, state.eventId, action.index) : state;
    case "NEXT":
      return state.phase === "resolved" ? nextTurn(state) : state;
  }
}

export interface RollPreview {
  dice: number;
  payday: boolean;
  steps: number;
}

// What the next roll will do, so the UI can animate it before committing.
export function previewRoll(state: GameState): RollPreview {
  const outcome = rollTurn(state);
  const dice = outcome.dice!;
  const start = currentPlayer(state).position;
  return {
    dice,
    payday: outcome.payday,
    steps: outcome.payday ? BOARD.length - start : dice,
  };
}
