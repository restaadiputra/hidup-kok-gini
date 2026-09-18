import { Icon } from "../icon/icon";
import "./side-sticker.css";

export function SideSticker() {
  return (
    <div className="side-sticker">
      <Icon name="sparkles" size={21} />
      <span>
        Nonchalant di luar.
        <br />
        <b>Kalkulator di dalam.</b>
      </span>
      <span className="sticker-star" aria-hidden="true">
        <Icon name="dice" size={26} />
      </span>
    </div>
  );
}
