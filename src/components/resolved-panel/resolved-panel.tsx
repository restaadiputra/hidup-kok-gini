import { useEffect, useRef, useState } from "react";
import type { Stats } from "../../game/types";
import { Effects } from "../effects/effects";
import { Icon } from "../icon/icon";
import { burst, centerOf } from "../../motion/fx";
import "./resolved-panel.css";

// The button lands where the tapped choice was, so a double-tap would skip the
// verdict. Ignore taps until the result has had a moment on screen.
const READ_DELAY_MS = 500;

export function ResolvedPanel({
  resolution,
  effects,
  finalTurn,
  nextPlayerName,
  onNext,
}: {
  resolution: string;
  effects: Partial<Stats>;
  finalTurn: boolean;
  nextPlayerName: string;
  onNext: () => void;
}) {
  const [ready, setReady] = useState(false);
  const checkRef = useRef<HTMLSpanElement>(null);
  // Confetti leans green when the choice paid off overall, pink when it hurt.
  const net = Object.entries(effects).reduce(
    (sum, [stat, value]) => sum + Math.sign(stat === "hutang" ? -(value ?? 0) : (value ?? 0)),
    0,
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      const { x, y } = centerOf(checkRef.current);
      const colors = net >= 0
        ? ["var(--tile-6)", "var(--tile-7)", "var(--fixed)"]
        : ["var(--tile-2)", "var(--tile-5)", "var(--tile-1)"];
      burst(x, y, { colors, count: 20, distance: 120 });
    }, 380);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), READ_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="resolved-content">
      <span className="resolved-check" ref={checkRef}>
        <Icon name="check" size={30} />
      </span>
      <h3>
        Ya udah. <em>Jadi pengalaman.</em>
      </h3>
      <p>{resolution}</p>
      <Effects effects={effects} />
      <button className="primary-button" onClick={() => ready && onNext()}>
        {finalTurn ? "Lihat hasil akhir" : "Lanjut giliran"}
        <Icon name="arrow" size={19} />
      </button>
      <span className="next-player">
        {finalTurn ? "Saatnya buka rapor kehidupan." : "Giliran berikutnya: " + nextPlayerName}
      </span>
    </div>
  );
}
