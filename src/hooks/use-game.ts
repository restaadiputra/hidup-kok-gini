import { useEffect, useReducer, useRef, useState } from "react";
import { previewRoll } from "../game/reducer";
import { loadStore, persistSession, storeReducer } from "../game/session";
import { useTurnMotion } from "./use-turn-motion";

const newSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];

// Orchestrates one table session: the saved game, the turn animation, the
// mobile bottom sheet, and keyboard focus. Components receive what it returns.
export function useGame() {
  const [store, dispatch] = useReducer(storeReducer, undefined, loadStore);
  const [saveError, setSaveError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);
  const { motion, play, cancel, running } = useTurnMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const game = store.game;

  useEffect(() => {
    try {
      persistSession(store.session);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [store.session]);

  useEffect(() => {
    if (game && game.phase !== "payday" && !motion && sheetOpen)
      headingRef.current?.focus({ preventScroll: true });
  }, [game?.phase, game?.turn, motion, sheetOpen]);

  const player = game ? game.players[game.currentPlayer] : null;
  const finished = game?.phase === "finished";

  function start(names: string[]) {
    dispatch({ type: "START", names, seed: newSeed() });
    setSheetOpen(true);
  }

  function roll() {
    if (!game || !player || game.phase !== "ready" || running.current) return;
    const preview = previewRoll(game);
    setSheetOpen(false);
    dispatch({ type: "PLAY", action: { type: "ROLL" } });
    play(player.id, player.position, preview.dice, () => setSheetOpen(!preview.payday), {
      steps: preview.steps,
    });
  }

  function continuePayday() {
    if (!game || !player || game.phase !== "payday" || running.current) return;
    if (game.pendingPosition === null) {
      dispatch({ type: "PLAY", action: { type: "CONTINUE_PAYDAY" } });
      setSheetOpen(true);
      return;
    }
    const steps = game.pendingPosition!;
    const dice = game.dice!;
    dispatch({ type: "PLAY", action: { type: "CONTINUE_PAYDAY" } });
    setSheetOpen(false);
    play(player.id, 0, dice, () => setSheetOpen(true), {
      steps,
      skipRoll: true,
      stepOffset: dice - steps,
    });
  }

  function choose(index: number) {
    dispatch({ type: "PLAY", action: { type: "CHOOSE", index } });
  }

  function paydayChoose(index: number) {
    dispatch({ type: "PLAY", action: { type: "PAYDAY_CHOOSE", index } });
  }

  function next() {
    dispatch({ type: "PLAY", action: { type: "NEXT" } });
    setSheetOpen(true);
  }

  function quit() {
    cancel();
    dispatch({ type: "QUIT" });
    setSheetOpen(true);
  }

  return {
    game,
    player,
    finished,
    motion,
    // Panels expand into a bottom sheet whenever something other than a roll is waiting.
    expanded: !motion && (!game || game.phase !== "ready"),
    sheetOpen,
    openSheet: () => setSheetOpen(true),
    closeSheet: () => setSheetOpen(false),
    notice: store.notice,
    saveError,
    dismissNotice: () => dispatch({ type: "DISMISS_NOTICE" }),
    headingRef,
    start,
    roll,
    continuePayday,
    choose,
    paydayChoose,
    next,
    quit,
  };
}
