import { useEffect, useState, type Ref } from "react";
import { shortMoney, STAT_ICONS, STAT_LABELS } from "../../game/format";
import { ending, endingRuleFor, isSharedRank, rankOf, score, scoreBreakdown } from "../../game/scoring";
import { isMoney } from "../../game/stats";
import type { EndingRule, Player } from "../../game/types";
import { Icon } from "../icon/icon";
import { rain } from "../../motion/fx";
import "./results-panel.css";

function badgeFor(rankings: Player[], player: Player): string {
  if (rankOf(rankings, player) !== 1) return "CERITAMU TAHUN INI";
  return isSharedRank(rankings, player) ? "JUARA BERSAMA!" : "TOKOH UTAMA TAHUN INI";
}

// Where this player finished, in words: the winner's lead or the gap to the top.
function standing(rankings: Player[], player: Player): string {
  const points = score(player);
  const leader = rankings[0];
  const tied = rankings.filter((other) => other.id !== player.id && score(other) === points);
  if (rankOf(rankings, player) === 1) {
    if (tied.length) return `Skor tertinggi, sama dengan ${tied.map((other) => other.name).join(" dan ")}.`;
    const runnerUp = rankings.find((other) => score(other) < points);
    return runnerUp
      ? `Skor tertinggi, ${points - score(runnerUp)} poin di atas ${runnerUp.name}.`
      : "Skor tertinggi di meja ini.";
  }
  return `Selisih ${score(leader) - points} poin dari juara, ${leader.name}.`;
}

// Why this ending: the stat that crossed its line, or none for the fallback.
function reason(player: Player, rule: EndingRule | null): string {
  if (!rule) return `Nggak ada stat ${player.name} yang cukup ekstrem buat gelar khusus, jadi ini gelar buat yang seimbang.`;
  const value = player.stats[rule.stat];
  const show = (amount: number) => (isMoney(rule.stat) ? shortMoney(amount) : String(amount));
  const label = STAT_LABELS[rule.stat];
  if (rule.stat === "hutang") return `${player.name} masih punya Hutang ${show(value)} di akhir tahun. Hutang berapa pun langsung dapat gelar ini.`;
  if (rule.test === "atLeast") return `${label} akhir ${player.name} ${show(value)}, tembus batas ${show(rule.threshold)}.`;
  const line = rule.test === "atMost" ? `${show(rule.threshold)} ke bawah` : `di bawah ${show(rule.threshold)}`;
  return `${label} akhir ${player.name} tinggal ${show(value)}, masuk batas ${line}.`;
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
  const rule = endingRuleFor(shown);
  const parts = scoreBreakdown(shown);
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
      <article className="ending-card" key={shown.id} aria-label={`Rapor ${shown.name}`}>
        <span className="ending-badge">{badgeFor(rankings, shown)}</span>
        <div className="ending-who">
          <span className="ending-rank">#{rankOf(rankings, shown)}</span>
          <strong>{shown.name}</strong>
          <span className="ending-points">{parts.total} poin</span>
        </div>
        <p className="ending-standing">{standing(rankings, shown)}</p>
        <span className="field-label ending-label">GELAR AKHIR TAHUN</span>
        <h3>{story.title}</h3>
        <p className="ending-text">{story.text}</p>
        <p className="ending-why">
          <Icon name={rule ? STAT_ICONS[rule.stat] : "sparkles"} size={15} />
          <span>
            <b>Kenapa gelar ini? </b>
            {reason(shown, rule)}
          </span>
        </p>
      </article>
      <dl className="score-breakdown" aria-label={`Rincian skor ${shown.name}`}>
        <div>
          <dt><Icon name={STAT_ICONS.dompet} size={14} />Dompet bersih</dt>
          <dd>
            <small>{shortMoney(parts.netWallet)}</small>
            {parts.wallet}
          </dd>
        </div>
        {(["kewarasan", "relasi", "hoki"] as const).map((stat) => (
          <div key={stat}>
            <dt><Icon name={STAT_ICONS[stat]} size={14} />{STAT_LABELS[stat]}</dt>
            <dd>{parts[stat]}</dd>
          </div>
        ))}
        <div className="score-total">
          <dt>Total skor</dt>
          <dd>{parts.total}</dd>
        </div>
      </dl>
      <p className="score-formula">
        Peringkat murni dari skor: tiap Rp100 rb Dompet bersih (setelah Hutang) jadi 1 poin, ditambah Kewarasan, Relasi, dan Hoki.
        Gelar dipilih dari stat yang paling menonjol, bukan dari peringkat.
      </p>
      <button className="primary-button" onClick={onPlayAgain}>
        Main lagi dari Januari <Icon name="reset" size={19} />
      </button>
    </div>
  );
}
