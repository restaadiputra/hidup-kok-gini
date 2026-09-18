import { useEffect, useRef, useState } from "react";
import { BOARD } from "../data/categories";

export interface TurnMotion {
  stage: "rolling" | "moving";
  playerId: number;
  position: number;
  dice: number;
  step: number;
}

// Presentation only. The engine commits the roll before this sequence starts.
export function useTurnMotion() {
  const [motion, setMotion] = useState<TurnMotion | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    running.current = false;
    setMotion(null);
  }
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function play(
    playerId: number,
    start: number,
    dice: number,
    onComplete: () => void,
    options: { steps?: number; skipRoll?: boolean; stepOffset?: number } = {},
  ) {
    if (running.current) return;
    const steps = options.steps ?? dice;
    if (steps === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }
    running.current = true;
    setMotion({ stage: "rolling", playerId, position: start, dice, step: 0 });
    let step = 0;
    function hop() {
      step++;
      setMotion({
        stage: "moving",
        playerId,
        position: (start + step) % BOARD.length,
        dice,
        step: step + (options.stepOffset ?? 0),
      });
      timer.current = setTimeout(() => {
        if (step < steps) hop();
        else {
          running.current = false;
          timer.current = null;
          setMotion(null);
          onComplete();
        }
      }, 300);
    }
    if (options.skipRoll) hop();
    else timer.current = setTimeout(hop, 480);
  }
  return { motion, play, cancel, running };
}
