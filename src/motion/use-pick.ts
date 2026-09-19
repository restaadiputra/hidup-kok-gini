import { useEffect, useRef, useState, type MouseEvent } from "react";
import { burst, reducedMotion } from "./fx";

// How long the "DIPILIH" stamp stays on the card before the verdict replaces it.
const STAMP_MS = 460;

/**
 * Stamps the tapped choice and throws confetti before committing it. The
 * choice itself is only sent to the game once, after the stamp; a second tap
 * during the stamp is ignored. Reduced motion commits immediately.
 */
export function usePick(onChoose: (index: number) => void, burstColors?: readonly string[]) {
  const [picked, setPicked] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function pick(index: number, event: MouseEvent<HTMLElement>) {
    if (picked !== null) return;
    if (reducedMotion()) {
      onChoose(index);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    burst(x, y, { colors: burstColors, count: 16, distance: 110 });
    setPicked(index);
    timer.current = setTimeout(() => onChoose(index), STAMP_MS);
  }

  // A dialog that stays open for the next player needs a clean slate.
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPicked(null);
  }

  return { picked, pick, reset };
}
