import { useEffect, useRef } from "react";
import type { TurnMotion } from "../../hooks/use-turn-motion";
import { Dice } from "../icon/dice";
import { Icon } from "../icon/icon";
import { burst, centerOf, ring, shake } from "../../motion/fx";
import "./roll-panel.css";

const RESTING_FACE = 5;

function headline(motion: TurnMotion | null): string {
  if (!motion) return "Dadu dulu. Overthinking nanti.";
  return motion.stage === "rolling" ? "Nasib lagi dikocok…" : "Pionnya jalan. Kamu sabar.";
}

export function RollPanel({
  tileLabel,
  lastDice,
  motion,
  onRoll,
}: {
  tileLabel: string;
  lastDice: number | null;
  motion: TurnMotion | null;
  onRoll: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stage = motion?.stage;
  const previous = useRef(stage);
  // The moment the die lands: shockwave, a jolt to the board, a pinch of confetti.
  useEffect(() => {
    if (previous.current === "rolling" && stage === "moving") {
      const { x, y } = centerOf(stageRef.current?.querySelector(".dice") ?? null);
      ring(x, y, "var(--accent)", 90);
      ring(x, y, "var(--fixed)", 60);
      burst(x, y, { count: 10, distance: 70 });
      shake(document.querySelector(".board-panel"), 4);
    }
    previous.current = stage;
  }, [stage]);
  return (
    <div className="roll-content">
      <div className={`dice-stage ${stage === "rolling" ? "is-rolling" : ""}`} ref={stageRef}>
        <span className="dice-orbit" aria-hidden="true">
          <Icon name="dice" size={26} />
        </span>
        <Dice value={motion?.dice ?? lastDice ?? RESTING_FACE} rolling={motion?.stage === "rolling"} />
        <span className="dice-shadow" />
      </div>
      <div className="roll-copy">
        <h3>{headline(motion)}</h3>
        {motion ? <p>Sebentar. Semesta lagi hitung langkah.</p> : null}
      </div>
      <button
        className="primary-button roll-button"
        aria-label={motion ? "Mengundi nasib" : "Lempar dadu"}
        disabled={!!motion}
        onClick={onRoll}
      >
        <Dice value={3} small />
        {motion ? "Bentar, bestie…" : "Lempar dadu"}
        <Icon name="arrow" size={21} />
      </button>
      <span className="small-note position-note">
        📍 {tileLabel} · jangan nyalahin
        dadunya.
      </span>
    </div>
  );
}
