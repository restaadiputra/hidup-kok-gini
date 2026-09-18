import type { Stats } from "../../game/types";
import { Effects } from "../effects/effects";
import { Icon } from "../icon/icon";
import "./resolved-panel.css";

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
  return (
    <div className="resolved-content">
      <span className="resolved-check">
        <Icon name="check" size={30} />
      </span>
      <h3>
        Ya udah.
        <br />
        <em>Jadi pengalaman.</em>
      </h3>
      <p>{resolution}</p>
      <Effects effects={effects} />
      <span className="small-note">
        Ini perubahan yang masuk. Kewarasan, Relasi, dan Hoki dibatasi 0–100.
      </span>
      <button className="primary-button" onClick={onNext}>
        {finalTurn ? "Lihat hasil akhir" : "Lanjut giliran"}
        <Icon name="arrow" size={19} />
      </button>
      <span className="next-player">
        {finalTurn ? "Saatnya buka rapor kehidupan." : "Giliran berikutnya: " + nextPlayerName}
      </span>
    </div>
  );
}
