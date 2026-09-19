import type { Theme } from "../../hooks/use-theme";
import { Icon } from "../icon/icon";
import "./site-header.css";

export function SiteHeader({
  theme,
  onToggleTheme,
  onOpenRules,
  onOpenRestart,
  canRestart,
}: {
  theme: Theme;
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  onOpenRules: () => void;
  onOpenRestart: () => void;
  canRestart: boolean;
}) {
  const dark = theme === "dark";
  return (
    <header className="site-header">
      <a href="./" className="brand" aria-label="Hidup Kok Gini? Beranda">
        <img className="brand-mark" src={dark ? "/logo-dark.svg" : "/logo.svg"} alt="" width="36" height="36" />
        <span className="brand-copy">
          idup kok gini<span className="brand-question">?</span>
        </span>
        <span className="brand-subtitle">
          Ekspektasi tinggi<span className="brand-subtitle-tail"> · saldo nanti dulu</span>
        </span>
      </a>
      <nav aria-label="Navigasi permainan">
        <button
          className="icon-button theme-toggle"
          aria-label="Mode gelap"
          aria-pressed={dark}
          title={dark ? "Mode terang" : "Mode gelap"}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            onToggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
          }}
        >
          <Icon key={dark ? "moon" : "sun"} name={dark ? "moon" : "sun"} size={19} />
        </button>
        <button className="icon-button" aria-label="Cara main" title="Cara main" onClick={onOpenRules}>
          <Icon name="help" size={19} />
        </button>
        {canRestart ? (
          <button className="icon-button" aria-label="Mulai ulang" title="Mulai ulang" onClick={onOpenRestart}>
            <Icon name="reset" size={18} />
          </button>
        ) : null}
      </nav>
    </header>
  );
}
