import { useEffect, useRef, useState } from "react";
import { BOARD } from "../data/categories";

/**
 * rolling  – the die is in the air.
 * focus    – the camera zooms onto the pawn before it sets off.
 * moving   – one hop per tile; the camera follows the pawn.
 * landing  – the last hop: slower, heavier, ends in a thud.
 * settling – the camera pulls back to the whole board before the card appears.
 */
export type MotionStage = "rolling" | "focus" | "moving" | "landing" | "settling";

export interface TurnMotion {
  stage: MotionStage;
  playerId: number;
  position: number;
  dice: number;
  step: number;
}

export const ROLL_MS = 480;
export const FOCUS_MS = 450;
export const HOP_MS = 450;
export const LANDING_MS = 850;
export const SETTLE_MS = 550;

/** Stages where the pawn is hopping from tile to tile. */
export const isTravelling = (motion: TurnMotion | null) =>
  motion?.stage === "moving" || motion?.stage === "landing";

/** Stages where the camera is zoomed in on the pawn. */
export const isCameraOn = (motion: TurnMotion | null) =>
  motion?.stage === "focus" || isTravelling(motion);

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
    const at = (stage: MotionStage): TurnMotion => ({
      stage,
      playerId,
      position: (start + step) % BOARD.length,
      dice,
      step: step + (options.stepOffset ?? 0),
    });
    function finish() {
      running.current = false;
      timer.current = null;
      setMotion(null);
      onComplete();
    }
    function hop() {
      step++;
      const last = step === steps;
      setMotion(at(last ? "landing" : "moving"));
      timer.current = setTimeout(() => {
        if (!last) hop();
        else {
          setMotion(at("settling"));
          timer.current = setTimeout(finish, SETTLE_MS);
        }
      }, last ? LANDING_MS : HOP_MS);
    }
    // Zoom onto the pawn first; it only sets off once the camera is there.
    function focus() {
      setMotion(at("focus"));
      timer.current = setTimeout(hop, FOCUS_MS);
    }
    if (options.skipRoll) focus();
    else timer.current = setTimeout(focus, ROLL_MS);
  }
  return { motion, play, cancel, running };
}
