import { EVENTS } from "../../data/events";
import { DEFAULT_NAMES, PLAYER_COLORS } from "../../data/players";
import { MAX_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS } from "../../game/limits";
import type { SetupDraft } from "../../hooks/use-setup-draft";
import { Icon } from "../icon/icon";
import "./setup-form.css";

const PLAYER_COUNTS = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i);

export function SetupForm({ draft, onStart }: { draft: SetupDraft; onStart: () => void }) {
  return (
    <form
      className="setup-content"
      onSubmit={(e) => {
        e.preventDefault();
        onStart();
      }}
    >
      <div className="setup-heading">
        <h2>
          Bestie,{" "}
          <br />
          siap <em>adu nasib?</em>
        </h2>
        <p>
          2–4 orang. Nggak perlu login.{" "}
          <br />
          Cukup nama & mental seadanya.
        </p>
      </div>
      <fieldset className="player-count">
        <legend>JUMLAH MANUSIA</legend>
        <div>
          {PLAYER_COUNTS.map((n) => (
            <label key={n} className={n === draft.count ? "selected" : ""}>
              <input
                type="radio"
                name="player-count"
                aria-label={n + " pemain"}
                checked={n === draft.count}
                onChange={() => draft.setCount(n)}
              />
              <Icon name="users" size={16} />
              {n} orang
            </label>
          ))}
        </div>
      </fieldset>
      <div className="name-fields">
        {draft.names.map((name, i) => (
          <label className="name-input" key={i}>
            <span className="name-avatar" style={{ background: PLAYER_COLORS[i] }}>
              {i + 1}
            </span>
            <input
              aria-label={"Nama pemain " + (i + 1)}
              value={name}
              placeholder={DEFAULT_NAMES[i]}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => draft.rename(i, e.target.value)}
            />
            <span className="input-pencil" aria-hidden="true">
              <Icon name="pencil" size={15} />
            </span>
          </label>
        ))}
      </div>
      <button className="primary-button" type="submit">
        Gas, jalani hidup <Icon name="arrow" size={20} />
      </button>
      <span className="small-note setup-meta">
        12 bulan · ±15–25 menit · {EVENTS.length} plot twist
        original
      </span>
    </form>
  );
}
