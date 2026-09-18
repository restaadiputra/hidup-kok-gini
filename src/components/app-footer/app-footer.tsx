import { Icon } from "../icon/icon";
import "./app-footer.css";

function saveStatus(hasGame: boolean, saveError: boolean): string {
  if (!hasGame) return "OFFLINE VIBES. ONLINE NASIB.";
  return saveError ? "Sesi ini aja" : "Auto-save nyala";
}

export function AppFooter({
  hasGame,
  saveError,
  playerCount,
  onOpenSquad,
  onOpenLog,
}: {
  hasGame: boolean;
  saveError: boolean;
  playerCount: number;
  onOpenSquad: () => void;
  onOpenLog: () => void;
}) {
  return (
    <footer className="app-footer">
      <span>
        <i className="status-dot" />
        {saveStatus(hasGame, saveError)}
      </span>
      <span className="footer-edition">
        BOARD GAME KEHIDUPAN <b>VOL. 01</b>
      </span>
      <nav aria-label="Menu permainan">
        <button onClick={onOpenSquad}>
          <Icon name="users" size={16} />
          Skuad <b>{playerCount}</b>
        </button>
        <button onClick={onOpenLog}>
          <Icon name="receipt" size={16} />
          Riwayat
        </button>
      </nav>
    </footer>
  );
}
