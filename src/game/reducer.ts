import { TOTAL_MONTHS } from "../data/calendar";
import { BOARD } from "../data/categories";
import { EVENT_BY_ID } from "../data/events";
import { choiceAvailability } from "./availability";
import { applyWithDebt } from "./debt";
import { drawEvent } from "./deck";
import { addToLog, choiceMessage, rollMessage } from "./log-messages";
import { PAYDAY_OPTIONS, rollPaycheck, settlePayday } from "./payday";
import { random, rollDie } from "./random";
import { appliedChanges, applyPressure, randomizeEffects } from "./stats";
import { clearStatuses, expireStatuses, gainStatuses, statusChanges, syncAutomatic } from "./statuses";
import type { Action, GameState, Paycheck, Player, Stats } from "./types";

const currentPlayer = (state: GameState) => state.players[state.currentPlayer];

function updatePlayer(state: GameState, change: (player: Player) => Player): Player[] {
  return state.players.map((p) => (p.id === state.currentPlayer ? change(p) : p));
}

function applyChoiceToPlayer(player: Player, effects: Partial<import("./types").Stats>, state: GameState, choice: import("./types").Choice): Player {
  const stats = applyWithDebt(player.stats, effects);
  const isActive = player.id === state.currentPlayer;
  const statuses = isActive
    ? syncAutomatic(clearStatuses(gainStatuses(player.statuses, choice.gains, state.month), choice.clears), stats)
    : syncAutomatic(player.statuses, stats);
  return { ...player, stats, statuses };
}

function rollTurn(state: GameState): GameState {
  const player = currentPlayer(state);
  const dieRoll = random(state.rng);
  const dice = rollDie(dieRoll.value);
  const distance = player.position + dice;
  const position = distance % BOARD.length;
  // Salary is settled once per calendar month, not when a pawn happens to
  // cross a board lap. The gajian tile is now just another encounter tile.
  const payday = false;
  const tile = BOARD[position];
  // A game must contain at least one genuine table shock. If nobody reaches
  // Plot twist naturally by the second round, force the next encounter to use
  // that pool; the seed still determines which shock and which choice values.
  const forcedSudden = !state.suddenEventSeen && state.turn >= state.players.length * 2;
  const encounterTile = forcedSudden ? BOARD.find((candidate) => candidate.category === "kejutan")! : tile;

  let rng = dieRoll.rng;
  let mover = player;
  let paydayDetails: Paycheck | null = null;

  const draw = drawEvent(state.drawn, encounterTile, rng, mover, undefined, undefined, state.recentThemes ?? [], forcedSudden);
  rng = draw.rng;
  const choiceEffects = draw.event.choices.map((choice) => {
    const rolled = randomizeEffects(choice.effects, rng);
    rng = rolled.rng;
    return applyPressure(rolled.effects);
  });

  return {
    ...state,
    dice,
    rng,
    choiceEffects,
    paydayDetails,
    phase: "event",
    pendingPosition: null,
    eventId: draw.event.id,
    drawn: draw.drawn,
    recentThemes: draw.recentThemes,
    suddenEventSeen: state.suddenEventSeen || draw.event.id.startsWith("sudden-"),
    payday,
    resolution: "",
    lastEffects: {},
    players: updatePlayer(state, () => ({ ...mover, position })),
    log: addToLog(state.log, rollMessage(player.name, dice, encounterTile.label, paydayDetails)),
  };
}

function continuePayday(state: GameState, destination: number | null): GameState {
  if (destination === null) {
    if (state.month === TOTAL_MONTHS) return { ...state, phase: "finished", payday: false, paydayDetails: null };
    const month = state.month + 1;
    return {
      ...state,
      currentPlayer: 0,
      month,
      phase: "ready",
      payday: false,
      paydayDetails: null,
      monthPaychecks: [],
      eventId: null,
      choiceEffects: [],
      resolution: "",
      lastEffects: {},
      pendingPosition: null,
      players: state.players.map((p) => {
        const statuses = expireStatuses(p.statuses, month);
        return statuses === p.statuses ? p : { ...p, statuses };
      }),
      turn: state.turn + 1,
    };
  }
  return {
    ...state,
    phase: "event",
    pendingPosition: null,
    players: updatePlayer(state, (p) => ({ ...p, position: destination })),
  };
}

function paydayOptions(rng: number): { effects: Partial<Stats>[]; rng: number } {
  let next = rng;
  const effects = PAYDAY_OPTIONS.map((option) => {
    const rolled = randomizeEffects(option.effects, next);
    next = rolled.rng;
    return applyPressure(rolled.effects);
  });
  return { effects, rng: next };
}

function choosePayday(state: GameState, index: number): GameState {
  const paydayPlayer = state.paydayPlayer ?? 0;
  const option = PAYDAY_OPTIONS[index];
  const effects = state.paydayChoiceEffects?.[index];
  if (!option || !effects || !Number.isInteger(index)) return state;
  const player = state.players[paydayPlayer];
  if (!player) return state;
  const stats = applyWithDebt(player.stats, effects);
  const statuses = syncAutomatic(player.statuses, stats);
  const players = state.players.map((candidate, i) => i === paydayPlayer ? { ...candidate, stats, statuses } : candidate);
  const nextPlayer = paydayPlayer + 1;
  if (nextPlayer < state.players.length) {
    const nextOptions = paydayOptions(state.rng);
    return {
      ...state,
      players,
      currentPlayer: nextPlayer,
      paydayPlayer: nextPlayer,
      paydayChoiceEffects: nextOptions.effects,
      rng: nextOptions.rng,
      log: addToLog(state.log, `${player.name} memilih ${option.label} saat payday.`),
    };
  }
  const bonusTile = BOARD.find((candidate) => candidate.category === "gajian")!;
  const draw = drawEvent(state.drawn, bonusTile, state.rng, players[0], undefined, undefined, state.recentThemes ?? []);
  let rng = draw.rng;
  const choiceEffects = draw.event.choices.map((choice) => {
    const rolled = randomizeEffects(choice.effects, rng);
    rng = rolled.rng;
    return applyPressure(rolled.effects);
  });
  return {
    ...state,
    players,
    currentPlayer: 0,
    paydayPlayer: nextPlayer - 1,
    paydayChoiceEffects: [],
    paydayEventId: draw.event.id,
    phase: "payday-event",
    eventId: draw.event.id,
    choiceEffects,
    drawn: draw.drawn,
    recentThemes: draw.recentThemes,
    rng,
    resolution: "",
    log: addToLog(state.log, `${player.name} memilih ${option.label} saat payday. Event gajian bersama muncul.`),
  };
}

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
  const target = choice.target ?? "self";
  const players = state.players.map((p) => {
    const applies = target === "all" || (target === "others" ? p.id !== state.currentPlayer : p.id === state.currentPlayer);
    return applies ? applyChoiceToPlayer(p, effects, state, choice) : p;
  });
  return {
    ...state,
    phase: "resolved",
    resolution: choice.result,
    lastEffects: appliedChanges(player.stats, stats, effects),
    players,
    log: addToLog(
      state.log,
      choiceMessage(player.name, choice, borrowed, statusChanges(player.statuses, statuses)) +
        (target === "all" ? " Efeknya kena satu meja." : target === "others" ? " Yang lain ikut kena." : ""),
    ),
  };
}

const isEndOfRound = (state: GameState) => state.currentPlayer === state.players.length - 1;

function settleMonth(state: GameState): GameState {
  let rng = state.rng;
  let paydayDetails: Paycheck | null = null;
  const monthPaychecks: Array<{ playerId: number; paycheck: Paycheck }> = [];
  const players = state.players.map((player, index) => {
    const rolled = rollPaycheck(rng);
    rng = rolled.rng;
    const settled = settlePayday(player, rolled.paycheck);
    monthPaychecks.push({ playerId: player.id, paycheck: settled.paycheck });
    if (index === state.currentPlayer) paydayDetails = settled.paycheck;
    return settled.player;
  });
  const options = paydayOptions(rng);
  rng = options.rng;
  return {
    ...state,
    rng,
    players,
    currentPlayer: 0,
    phase: "payday",
    payday: true,
    paydayDetails,
    monthPaychecks,
    paydayPlayer: 0,
    paydayChoiceEffects: options.effects,
    paydayEventId: null,
    pendingPosition: null,
    log: addToLog(state.log, `Akhir bulan ${state.month}: semua pemain menerima gajian dan membayar biaya hidup.`),
  };
}

// The last player's December turn ends the game.
export const isFinalTurn = (state: GameState) => isEndOfRound(state) && state.month === TOTAL_MONTHS;

function nextTurn(state: GameState): GameState {
  if (state.payday && state.paydayEventId) {
    if (state.month === TOTAL_MONTHS) return { ...state, phase: "finished", payday: false, paydayDetails: null, monthPaychecks: [] };
    const month = state.month + 1;
    return {
      ...state,
      currentPlayer: 0,
      month,
      phase: "ready",
      payday: false,
      paydayDetails: null,
      monthPaychecks: [],
      paydayPlayer: 0,
      paydayChoiceEffects: [],
      paydayEventId: null,
      eventId: null,
      choiceEffects: [],
      resolution: "",
      lastEffects: {},
      pendingPosition: null,
      players: state.players.map((p) => {
        const statuses = expireStatuses(p.statuses, month);
        return statuses === p.statuses ? p : { ...p, statuses };
      }),
      turn: state.turn + 1,
    };
  }
  const endOfRound = isEndOfRound(state);
  if (endOfRound) return settleMonth(state);
  const month = state.month;
  return {
    ...state,
    currentPlayer: (state.currentPlayer + 1) % state.players.length,
    month,
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
    paydayChoiceEffects: [],
    paydayEventId: null,
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
    case "PAYDAY_CHOOSE":
      return state.phase === "payday" ? choosePayday(state, action.index) : state;
    case "CHOOSE":
      return (state.phase === "event" || state.phase === "payday-event") && state.eventId ? choose(state, state.eventId, action.index) : state;
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
