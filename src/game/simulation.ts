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
const COMEBACK_MONTHS = [4, 5, 6, 7, 8, 9];
const NAMES = ["A", "B", "C", "D"];

export const BALANCE_TARGETS = {
  dangerByJune: [0.45, 0.6], borrowed: [0.25, 0.4], crisisRecovery: [0.6, 1], comeback: [0.3, 1],
} as const;

export interface PlayerTrace { policy: Policy; dangerByJune: boolean; borrowed: boolean; crises: number; recovered: number }
export interface GameTrace { final: GameState; actions: Action[]; players: PlayerTrace[]; comeback: boolean }
export interface BalanceMetrics { games: number; players: number; crises: number; dangerByJune: number; borrowed: number; crisisRecovery: number; comeback: number }

export function openChoices(state: GameState): number[] {
  const player = state.players[state.currentPlayer];
  return EVENT_BY_ID[state.eventId!].choices.flatMap((choice, i) =>
    choiceAvailability(player, choice, state.choiceEffects[i]).kind === "locked" ? [] : [i]);
}

const afterChoice = (state: GameState, index: number): Player => {
  const player = state.players[state.currentPlayer];
  return { ...player, stats: applyWithDebt(player.stats, state.choiceEffects[index]) };
};

function pick(policy: Policy, state: GameState, open: number[], rng: number) {
  if (policy === "random") {
    const draw = random(rng);
    return { index: open[pickIndex(draw.value, open.length)], rng: draw.rng };
  }
  const best = (options: number[]) => options.reduce((a, b) => score(afterChoice(state, b)) > score(afterChoice(state, a)) ? b : a);
  if (policy === "cautious") {
    const now = state.players[state.currentPlayer].stats;
    const safe = open.filter((i) => {
      const next = afterChoice(state, i).stats;
      return next.hutang <= now.hutang && BOUNDED_STATS.every((stat) => next[stat] > DANGER_LINE);
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

export function simulateGame(names: string[], seed: number, policies: Policy[], check?: (state: GameState) => void): GameTrace {
  let state = createGame(names, seed);
  let policyRng = (seed ^ 0x9e3779b9) >>> 0;
  const actions: Action[] = [];
  const traces: PlayerTrace[] = policies.map((policy) => ({ policy, dangerByJune: false, borrowed: false, crises: 0, recovered: 0 }));
  const openCrises = names.map(() => new Set<string>());
  const snapshots: number[][] = [];
  const act = (action: Action) => {
    const before = state;
    state = gameReducer(state, action);
    if (state === before) throw new Error(`simulation action ${action.type} was rejected`);
    actions.push(action);
    state.players.forEach((p, i) => {
      const trace = traces[i];
      if (before.month <= 6 && inDanger(p)) trace.dangerByJune = true;
      if (p.stats.hutang > 0) trace.borrowed = true;
      for (const id of CRISES) {
        const had = before.players[i].statuses.some((s) => s.id === id);
        const has = p.statuses.some((s) => s.id === id);
        if (!had && has && before.month < 12) { trace.crises++; openCrises[i].add(id); }
        if (had && !has && openCrises[i].delete(id) && before.month < 12) trace.recovered++;
      }
    });
    if (action.type === "NEXT" && state.month !== before.month && COMEBACK_MONTHS.includes(before.month)) snapshots.push(state.players.map(score));
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
  return { final: state, actions, players: traces, comeback: snapshots.some((scores) => scores[winner.id] < median(scores)) };
}

const share = <T>(items: T[], test: (item: T) => boolean) => items.filter(test).length / items.length;
export function measureBalance(gamesPerSize = 1000): BalanceMetrics {
  const games: GameTrace[] = [];
  for (const count of [2, 3, 4]) for (let g = 0; g < gamesPerSize; g++) {
    const policies = Array.from({ length: count }, (_, i) => POLICIES[(g + i) % POLICIES.length]);
    games.push(simulateGame(NAMES.slice(0, count), (g * 7919 + count * 104_729) >>> 0, policies));
  }
  const players = games.flatMap((game) => game.players);
  const crises = players.reduce((sum, p) => sum + p.crises, 0);
  const recovered = players.reduce((sum, p) => sum + p.recovered, 0);
  return { games: games.length, players: players.length, crises,
    dangerByJune: share(players, (p) => p.dangerByJune), borrowed: share(players, (p) => p.borrowed),
    crisisRecovery: crises ? recovered / crises : 1, comeback: share(games, (game) => game.comeback) };
}

export function targetDistance(metrics: BalanceMetrics): number {
  return (Object.keys(BALANCE_TARGETS) as (keyof typeof BALANCE_TARGETS)[]).reduce((sum, key) => {
    const [low, high] = BALANCE_TARGETS[key]; const value = metrics[key];
    return sum + (value < low ? low - value : value > high ? value - high : 0);
  }, 0);
}
export function missedTargets(metrics: BalanceMetrics): string[] {
  return (Object.keys(BALANCE_TARGETS) as (keyof typeof BALANCE_TARGETS)[]).flatMap((key) => {
    const [low, high] = BALANCE_TARGETS[key]; const value = metrics[key];
    return value < low || value > high ? [`${key} ${value.toFixed(3)} not in ${low}–${high}`] : [];
  });
}
