import { useEffect } from "react";
import { burst, PIECE_COLORS } from "./fx";

const ACTION = ".primary-button, .icon-button, .mini-link, .result-tabs button, .app-footer nav button, .player-count label";

/** Every action button on the table throws a pinch of confetti when pressed. */
export function useClickBurst() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest<HTMLElement>(ACTION);
      if (!target || target.matches(":disabled") || (event.target as Element).matches("input")) return;
      const rect = target.getBoundingClientRect();
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;
      const primary = target.classList.contains("primary-button");
      burst(x, y, {
        colors: primary ? ["var(--accent)", "var(--fixed)", ...PIECE_COLORS.slice(0, 2)] : PIECE_COLORS,
        count: primary ? 14 : 7,
        distance: primary ? 90 : 46,
        size: primary ? 9 : 7,
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
