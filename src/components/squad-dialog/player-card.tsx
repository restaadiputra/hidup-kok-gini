import type { CSSProperties } from "react";
import { PLAYER_COLORS } from "../../data/players";
import { rupiah, shortMoney, STAT_ICONS, STAT_LABELS } from "../../game/format";
import { SHOWN_STATS } from "../../game/stats";
import type { Player } from "../../game/types";
import { Icon } from "../icon/icon";
import { Pawn } from "../pawn/pawn";
import "./player-card.css";

export function PlayerCard({
  player,
  active,
}: {
  player: Player;
  active: boolean;
}) {
  return (
    <article
      className={`player-card ${active ? "player-active" : ""}`}
      style={
        { "--player-color": PLAYER_COLORS[player.id] } as CSSProperties
      }
    >
      <div className="player-heading">
        <Pawn player={player} />
        <div>
          <small>PEMAIN {player.id + 1}</small>
          <h3>{player.name}</h3>
        </div>
        {active && <span className="turn-label">Giliranmu</span>}
      </div>
      <dl className="player-stats">
        {SHOWN_STATS.map((stat) => (
          <div key={stat} className={`stat stat-${stat}`}>
            <dt>
              <Icon name={STAT_ICONS[stat]} size={16} />
              {STAT_LABELS[stat]}
            </dt>
            <dd
              title={
                stat === "dompet"
                  ? rupiah(player.stats[stat])
                  : `${player.stats[stat]} dari 100`
              }
              className={player.stats[stat] < 0 ? "in-debt" : ""}
            >
              {stat === "dompet" ? (
                shortMoney(player.stats[stat])
              ) : (
                <>
                  {player.stats[stat]}
                  <small>/100</small>
                </>
              )}
            </dd>
            {stat !== "dompet" && (
              <div
                className="stat-meter"
                role="meter"
                aria-label={`${player.name}: ${STAT_LABELS[stat]}`}
                aria-valuenow={player.stats[stat]}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <i style={{ transform: `scaleX(${player.stats[stat] / 100})` }} />
              </div>
            )}
          </div>
        ))}
      </dl>
    </article>
  );
}
