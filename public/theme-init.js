// Run before the app loads to avoid flashing the wrong theme on refresh.
// Plain script outside the bundle, so it repeats THEME_KEY from src/storage-keys.ts.
(() => {
  let preference = null;
  try {
    const saved = localStorage.getItem("hidup-kok-gini:theme");
    if (saved === "light" || saved === "dark") preference = saved;
  } catch {
    // System preference still works when browser storage is unavailable.
  }
  const theme =
    preference ??
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference ?? "system";
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]').content =
    theme === "dark" ? "#1a1030" : "#ffeccf";
})();
