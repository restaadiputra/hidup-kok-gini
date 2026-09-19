import { useEffect, useRef, useState } from "react";
import { effectLabel, shortMoney } from "../../game/format";
import type { Stat } from "../../game/types";
import { reducedMotion } from "../../motion/fx";

const COUNT_MS = 650;

interface Change {
  id: number;
  delta: number;
}

/**
 * A stat number that rolls to its new value like a scoreboard, flashes the
 * verdict colour, and floats a +/− sticker off the top. A different player's
 * stats (a turn change) swap in silently.
 */
export function StatValue({ stat, value, owner }: { stat: Stat; value: number; owner: number }) {
  const [shown, setShown] = useState(value);
  const [change, setChange] = useState<Change | null>(null);
  const last = useRef({ value, owner });
  const frame = useRef(0);

  useEffect(() => {
    const from = last.current;
    last.current = { value, owner };
    cancelAnimationFrame(frame.current);
    if (from.owner !== owner || from.value === value) {
      setShown(value);
      return;
    }
    setChange({ id: Date.now(), delta: value - from.value });
    if (reducedMotion()) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from.value + (value - from.value) * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    // rAF pauses in background tabs; the true value must never wait on it.
    const settle = setTimeout(() => {
      cancelAnimationFrame(frame.current);
      setShown(value);
    }, COUNT_MS + 50);
    return () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(settle);
    };
  }, [value, owner]);

  useEffect(() => {
    if (!change) return;
    const timer = setTimeout(() => setChange(null), 1300);
    return () => clearTimeout(timer);
  }, [change]);

  const good = change ? (stat === "hutang" ? change.delta < 0 : change.delta > 0) : false;
  const text = stat === "dompet" || stat === "hutang" ? shortMoney(shown) : shown;
  return (
    <>
      <b key={`value-${change?.id ?? "rest"}`} className={change ? (good ? "stat-up" : "stat-down") : undefined}>
        {text}
      </b>
      {change ? (
        <span key={`float-${change.id}`} className={`stat-float ${good ? "stat-float-up" : "stat-float-down"}`} aria-hidden="true">
          {effectLabel(stat, change.delta)}
        </span>
      ) : null}
    </>
  );
}
