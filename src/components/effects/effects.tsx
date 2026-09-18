import { effectLabel, STAT_ICONS, STAT_LABELS } from "../../game/format";
import type { Stat, Stats } from "../../game/types";
import { Icon } from "../icon/icon";
import "./effects.css";

export function Effects({ effects }: { effects: Partial<Stats> }) {
  return (
    <span className="effects">
      {(Object.entries(effects) as [Stat, number][]).map(([stat, value]) => (
        <span
          key={stat}
          className={`effect ${value >= 0 ? "effect-positive" : "effect-negative"}`}
          title={`${STAT_LABELS[stat]} ${effectLabel(stat, value)}`}
        >
          <Icon name={STAT_ICONS[stat]} size={13} />
          <span className="sr-only">{STAT_LABELS[stat]} </span>
          {effectLabel(stat, value)}
        </span>
      ))}
    </span>
  );
}
