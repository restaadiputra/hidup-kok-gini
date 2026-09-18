import { useEffect, useRef, useState } from "react";
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

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    followsSystem.current = false;
    document.documentElement.dataset.themePreference = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Keep the toggle usable for this session even if storage is blocked.
    }
  }

  return { theme, toggleTheme };
}
