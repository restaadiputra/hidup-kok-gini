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
  onToggleTheme: () => void;
  onOpenRules: () => void;
  onOpenRestart: () => void;
  canRestart: boolean;
}) {
  const dark = theme === "dark";
  return (
    <header className="site-header">
      <a href="./" className="brand" aria-label="Hidup Kok Gini? Beranda">
        <span className="brand-mark">
          <Icon name="sun" size={23} />
        </span>
        <span>
          hidup kok gini<span>?</span>
        </span>
      </a>
      <span className="edition-tag">
        BOARD GAME KEHIDUPAN <b>VOL. 01</b>
      </span>
      <nav aria-label="Navigasi permainan">
        <button
          className="icon-button theme-toggle"
          aria-label="Mode gelap"
          aria-pressed={dark}
          title={dark ? "Mode terang" : "Mode gelap"}
          onClick={onToggleTheme}
        >
          <Icon name={dark ? "moon" : "sun"} size={19} />
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
