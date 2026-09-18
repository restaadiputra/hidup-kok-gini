import { Neighborhood } from "./neighborhood";
import { CenterBits } from "./table-bits";
import "./board-center.css";

export function BoardCenter() {
  return (
    <div className="board-center">
      <CenterBits />
      <span className="center-sticker">JADI DEWASA. MODAL NEKAT.</span>
      <h1>
        HIDUP
        <br />
        KOK GINI<span>?</span>
      </h1>
      <span className="center-subtitle">DOMPET TIPIS. CERITA TEBAL.</span>
      <div className="print-frame">
        <Neighborhood />
      </div>
      <span className="center-sticker sticker-pink">
        100% lokal. 0% stabil.
      </span>
    </div>
  );
}
