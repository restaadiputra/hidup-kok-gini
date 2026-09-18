import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState, Player } from "../game/types";

export interface Handoff {
  turn: number;
  player: Player;
}

// Announces the moment a shared phone changes hands. It only fires when the turn
// counter moves forward while a game is being played, never on load or restart,
// and never for people who asked for reduced motion (the roll panel already
// names who is up).
export function useHandoff(game: GameState | null) {
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const lastTurn = useRef<number | null>(null);

  useEffect(() => {
    if (!game) {
      lastTurn.current = null;
      setHandoff(null);
      return;
    }
    const previous = lastTurn.current;
    lastTurn.current = game.turn;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (previous !== null && game.turn > previous && game.phase === "ready" && !reducedMotion) {
      setHandoff({ turn: game.turn, player: game.players[game.currentPlayer] });
    }
  }, [game?.turn, game?.phase]);

  const dismiss = useCallback(() => setHandoff(null), []);
  return { handoff, dismiss };
}
