import type { CSSProperties } from "react";
import { effectLabel, STAT_ICONS, STAT_LABELS } from "../../game/format";
import type { Stat, Stats } from "../../game/types";
import { Icon } from "../icon/icon";
import "./effects.css";

export function Effects({ effects }: { effects: Partial<Stats> }) {
  return (
    <span className="effects">
      {(Object.entries(effects) as [Stat, number][]).map(([stat, value], index) => {
        const good = stat === "hutang" ? value <= 0 : value >= 0;
        return <span
          key={stat}
          className={`effect ${good ? "effect-positive" : "effect-negative"}`}
          style={{ "--j": index } as CSSProperties}
          title={`${STAT_LABELS[stat]} ${effectLabel(stat, value)}`}
        >
          <Icon name={STAT_ICONS[stat]} size={13} />
          <span className="sr-only">{STAT_LABELS[stat]} </span>
          {effectLabel(stat, value)}
        </span>;
      })}
    </span>
  );
}
