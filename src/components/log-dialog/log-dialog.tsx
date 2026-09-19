import { Dialog } from "../dialog/dialog";
import { Icon } from "../icon/icon";
import "./log-dialog.css";

const EMPTY_LOG = ["Tahun baru, harapan baru. Saldo awal Rp2.500.000 per pemain."];

type HistoryKind = "start" | "move" | "choice" | "payday" | "shared" | "other";

interface HistoryItem {
  kind: HistoryKind;
  label: string;
  title: string;
  detail: string;
  effects: string[];
}

const KIND_COPY: Record<HistoryKind, { label: string; icon: string }> = {
  start: { label: "Mulai", icon: "sparkles" },
  move: { label: "Jalan", icon: "dice" },
  choice: { label: "Pilihan", icon: "check" },
  payday: { label: "Gajian", icon: "wallet" },
  shared: { label: "Satu meja", icon: "users" },
  other: { label: "Catatan", icon: "receipt" },
};

function splitEffects(text: string): { detail: string; effects: string[] } {
  const match = text.match(/ Dampak: (.+?)\.(?= (?:Ngutang|Status baru|Lepas dari|Efeknya|Yang lain)|$)/);
  if (!match) return { detail: text, effects: [] };
  return {
    detail: text.replace(match[0], "").trim(),
    effects: match[1].split(" · ").map((effect) => effect.trim()).filter(Boolean),
  };
}

function parseEntry(entry: string): HistoryItem {
  if (entry.startsWith("Tahun baru")) {
    return { kind: "start", label: KIND_COPY.start.label, title: "Permainan dimulai", detail: entry, effects: [] };
  }

  const month = entry.match(/^Akhir bulan (\d+): (.+)$/);
  if (month) {
    const summary = month[2].replace(/^semua pemain menerima gajian dan membayar biaya hidup\.\s*/, "");
    return {
      kind: "payday",
      label: KIND_COPY.payday.label,
      title: `Bulan ${month[1]} selesai`,
      detail: summary ? `Gajian dan biaya hidup beres. ${summary}` : "Gajian dan biaya hidup semua pemain sudah diproses.",
      effects: [],
    };
  }

  const payday = entry.match(/^(.+?) memilih (.+?) saat payday\.(.*)$/);
  if (payday) {
    const choice = splitEffects(payday[3].trim());
    return {
      kind: "payday",
      label: KIND_COPY.payday.label,
      title: `${payday[1]} memilih ${payday[2]}`,
      detail: "Pilihan payday diterapkan ke dompet dan status pemain.",
      effects: choice.effects,
    };
  }

  const move = entry.match(/^(.+?) melempar (\d+) → (.+?)(?:\.)?$/);
  if (move) {
    return {
      kind: "move",
      label: KIND_COPY.move.label,
      title: `${move[1]} menuju ${move[3]}`,
      detail: `Dadu menunjukkan ${move[2]}.`,
      effects: [],
    };
  }

  const choice = entry.match(/^(.+?): (.+?)\. (.+)$/);
  if (choice) {
    const parsed = splitEffects(choice[3]);
    const shared = parsed.detail.includes("Efeknya kena satu meja") || parsed.detail.includes("Yang lain ikut kena");
    return {
      kind: shared ? "shared" : "choice",
      label: shared ? KIND_COPY.shared.label : KIND_COPY.choice.label,
      title: `${choice[1]} memilih ${choice[2]}`,
      detail: parsed.detail,
      effects: parsed.effects,
    };
  }

  return { kind: "other", label: KIND_COPY.other.label, title: "Catatan permainan", detail: entry, effects: [] };
}

function effectClass(effect: string): string {
  return /\+/.test(effect) ? "is-positive" : /−|-/.test(effect) ? "is-negative" : "";
}

export function LogDialog({ log, onClose }: { log: string[] | null; onClose: () => void }) {
  const entries = (log ?? EMPTY_LOG).map(parseEntry);
  return (
    <Dialog title="Riwayat permainan" onClose={onClose}>
      <div className="history-overview" aria-label="Ringkasan riwayat">
        <div>
          <span>Catatan</span>
          <strong>{entries.length}</strong>
        </div>
        <p>Yang terbaru ada di atas</p>
      </div>
      <p className="dialog-lead">Lihat siapa melakukan apa, pilihan yang diambil, dan dampaknya ke permainan.</p>
      <ol className="game-log">
        {entries.map((entry, i) => {
          const copy = KIND_COPY[entry.kind];
          return (
            <li className={`game-log-item kind-${entry.kind}`} key={`${entry.title}-${i}`}>
              <div className="game-log-marker" aria-hidden="true">
                <Icon name={copy.icon} size={16} />
              </div>
              <div className="game-log-content">
                <div className="game-log-meta">
                  <span className="game-log-label">{entry.label}</span>
                  <span className="game-log-index">#{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3>{entry.title}</h3>
                <p>{entry.detail}</p>
                {entry.effects.length ? (
                  <div className="game-log-effects" aria-label="Dampak pilihan">
                    {entry.effects.map((effect) => <span className={effectClass(effect)} key={effect}>{effect}</span>)}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Dialog>
  );
}
