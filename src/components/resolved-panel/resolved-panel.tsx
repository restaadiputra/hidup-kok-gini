import { useEffect, useState } from "react";
import type { Stats } from "../../game/types";
import { Effects } from "../effects/effects";
import { Icon } from "../icon/icon";
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
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), READ_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="resolved-content">
      <span className="resolved-check">
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
