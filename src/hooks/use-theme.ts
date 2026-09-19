import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { reducedMotion } from "../motion/fx";
import { THEME_KEY } from "../storage-keys";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const followsSystem = useRef(
    document.documentElement.dataset.themePreference === "system",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#1a1030" : "#ffeccf");
  }, [theme]);

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (followsSystem.current) setTheme(system.matches ? "dark" : "light");
    };
    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== THEME_KEY && event.key !== null) return;
      const preference =
        event.newValue === "light" || event.newValue === "dark"
          ? event.newValue
          : null;
      followsSystem.current = preference === null;
      document.documentElement.dataset.themePreference = preference ?? "system";
      setTheme(preference ?? (system.matches ? "dark" : "light"));
    };
    system.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorageChange);
    return () => {
      system.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  // A sweep can still be waiting to paint when the toggle is tapped again, so
  // count from the theme that is on its way, not the one on screen.
  const pending = useRef<Theme | null>(null);

  // The new lighting sweeps out from the toggle when the browser can draw it.
  function toggleTheme(origin?: { x: number; y: number }) {
    const current = pending.current ?? theme;
    const next = current === "light" ? "dark" : "light";
    followsSystem.current = false;
    const root = document.documentElement;
    root.dataset.themePreference = next;
    const apply = () => {
      root.dataset.theme = next;
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    };
    if (origin && "startViewTransition" in document && !reducedMotion()) {
      root.style.setProperty("--sweep-x", origin.x + "px");
      root.style.setProperty("--sweep-y", origin.y + "px");
      pending.current = next;
      document.startViewTransition(apply).finished.finally(() => {
        if (pending.current === next) pending.current = null;
      });
    } else {
      setTheme(next);
    }
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Keep the toggle usable for this session even if storage is blocked.
    }
  }

  return { theme, toggleTheme };
}
