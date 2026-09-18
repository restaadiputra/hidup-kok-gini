import type { CSSProperties, Ref } from "react";
import { PLAYER_COLORS } from "../../data/players";
import { shortMoney, STAT_ICONS, STAT_LABELS } from "../../game/format";
import { SHOWN_STATS } from "../../game/stats";
import type { Player } from "../../game/types";
import { Icon } from "../icon/icon";
import { Pawn } from "../pawn/pawn";
import "./active-player.css";

export function ActivePlayer({
  player,
  moving,
  headingRef,
  onOpenSquad,
}: {
  player: Player;
  moving: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onOpenSquad: () => void;
}) {
  return (
    <>
      <div className="active-player" style={{ "--player-color": PLAYER_COLORS[player.id] } as CSSProperties}>
        <Pawn player={player} />
        <div>
          <span>{moving ? "LAGI JALAN, BESTIE" : "GILIRAN KAMU"}</span>
          <h2 ref={headingRef} tabIndex={-1}>
            {player.name}
          </h2>
        </div>
        <button className="mini-link" onClick={onOpenSquad} aria-label="Lihat semua statistik">
          <Icon name="users" size={18} />
        </button>
      </div>
      <div className="active-stats" aria-label={"Statistik " + player.name}>
        {SHOWN_STATS.map((stat) => (
          <span className="stat" key={stat} title={STAT_LABELS[stat] + ": " + player.stats[stat]}>
            <Icon name={STAT_ICONS[stat]} size={14} />
            <span className="stat-name">{STAT_LABELS[stat]} </span>
            <b>{stat === "dompet" ? shortMoney(player.stats[stat]) : player.stats[stat]}</b>
          </span>
        ))}
        {player.stats.hutang > 0 ? (
          <span className="stat stat-debt" title={STAT_LABELS.hutang + ": " + shortMoney(player.stats.hutang)}>
            <Icon name={STAT_ICONS.hutang} size={14} />
            <span className="stat-name">{STAT_LABELS.hutang} </span>
            <b>{shortMoney(player.stats.hutang)}</b>
          </span>
        ) : null}
      </div>
    </>
  );
}
