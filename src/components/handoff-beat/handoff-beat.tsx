import { useEffect, useState, type CSSProperties } from "react";
import { PLAYER_COLORS } from "../../data/players";
import type { Player } from "../../game/types";
import "./handoff-beat.css";

const ARM_MS = 450;
const HOLD_MS = 1800;

// A full-screen flood in the next player's seat colour, so passing the phone is
// a moment the whole table sees. Taps are ignored at first: the same finger that
// pressed "Lanjut giliran" may land twice.
export function HandoffBeat({ player, onDone }: { player: Player; onDone: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const arm = setTimeout(() => setArmed(true), ARM_MS);
    const done = setTimeout(onDone, HOLD_MS);
    return () => {
      clearTimeout(arm);
      clearTimeout(done);
    };
  }, [onDone]);
  return (
    <button
      className="handoff-beat"
      style={{ "--player-color": PLAYER_COLORS[player.id] } as CSSProperties}
      aria-label={`Hape pindah ke ${player.name}. Ketuk untuk mulai.`}
      onClick={() => armed && onDone()}
    >
      <span className="handoff-token" aria-hidden="true">
        {player.id + 1}
      </span>
      <span className="handoff-line" aria-hidden="true">
        Hape pindah ke
        <strong>{player.name}</strong>
      </span>
      <span className="handoff-hint" aria-hidden="true">
        Ketuk buat mulai. Yang lain, tahan komentar dulu.
      </span>
    </button>
  );
}
