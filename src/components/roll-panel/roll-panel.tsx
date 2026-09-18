import type { TurnMotion } from "../../hooks/use-turn-motion";
import { Dice } from "../icon/dice";
import { Icon } from "../icon/icon";
import "./roll-panel.css";

const RESTING_FACE = 5;

function headline(motion: TurnMotion | null): string {
  if (!motion) return "Dadu dulu. Overthinking nanti.";
  return motion.stage === "rolling" ? "Nasib lagi dikocok…" : "Pionnya jalan. Kamu sabar.";
}

export function RollPanel({
  playerName,
  tileLabel,
  lastDice,
  motion,
  onRoll,
}: {
  playerName: string;
  tileLabel: string;
  lastDice: number | null;
  motion: TurnMotion | null;
  onRoll: () => void;
}) {
  return (
    <div className="roll-content">
      <div className="dice-stage">
        <span className="dice-orbit" aria-hidden="true">
          <Icon name="dice" size={26} />
        </span>
        <Dice value={motion?.dice ?? lastDice ?? RESTING_FACE} rolling={motion?.stage === "rolling"} />
        <span className="dice-shadow" />
      </div>
      <div className="roll-copy">
        <h3>{headline(motion)}</h3>
        <p>
          {motion
            ? "Sebentar. Semesta lagi hitung langkah."
            : "Kasih perangkat ke " + playerName + ". Semesta udah nunggu."}
        </p>
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
