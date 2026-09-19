import { useEffect, useState, type Ref } from "react";
import { ending, isSharedRank, rankOf, score } from "../../game/scoring";
import type { Player } from "../../game/types";
import { Icon } from "../icon/icon";
import { rain } from "../../motion/fx";
import "./results-panel.css";

function badgeFor(rankings: Player[], player: Player): string {
  if (rankOf(rankings, player) !== 1) return "CERITAMU TAHUN INI";
  return isSharedRank(rankings, player) ? "JUARA BERSAMA!" : "TOKOH UTAMA TAHUN INI";
}

export function ResultsPanel({
  rankings,
  headingRef,
  onPlayAgain,
}: {
  rankings: Player[];
  headingRef: Ref<HTMLHeadingElement>;
  onPlayAgain: () => void;
}) {
  const [page, setPage] = useState(0);
  // A year survived deserves a proper confetti shower, twice.
  useEffect(() => {
    rain({ count: 70 });
    const encore = setTimeout(() => rain({ count: 40 }), 1400);
    return () => clearTimeout(encore);
  }, []);
  const shown = rankings[page] ?? rankings[0];
  const story = ending(shown);
  return (
    <div className="results-content">
      <span className="result-sun">
        <Icon name="flag" size={28} />
      </span>
      <h2 ref={headingRef} tabIndex={-1}>
        Setahun kelar.
        <br />
        <em>Kamu masih di sini.</em>
      </h2>
      <p className="small-note">
        Prestasi tahun ini: berhasil sampai Desember.
      </p>
      <div className="result-tabs" aria-label="Peringkat pemain">
        {rankings.map((p, i) => (
          <button key={p.id} onClick={() => setPage(i)} aria-pressed={page === i}>
            <span>
              #
              {rankOf(rankings, p)}
            </span>
            <span>{p.name}</span>
            <b>{score(p)}</b>
          </button>
        ))}
      </div>
      <article className="ending-card" key={shown.id}>
        <span className="ending-badge">{badgeFor(rankings, shown)}</span>
        <h3>{story.title}</h3>
        <p>{story.text}</p>
      </article>
      <p className="score-formula">
        Skor: ⌊Dompet ÷ Rp100 rb⌋ + Kewarasan + Relasi + Hoki.
      </p>
      <button className="primary-button" onClick={onPlayAgain}>
        Main lagi dari Januari <Icon name="reset" size={19} />
      </button>
    </div>
  );
}
