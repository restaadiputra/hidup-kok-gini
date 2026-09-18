import type { EventCard as EventData, Stats } from "../../game/types";
import { Dice } from "../icon/dice";
import { EventCard } from "./event-card";
import "./event-panel.css";

export function EventPanel({
  dice,
  tileLabel,
  event,
  choiceEffects,
  onChoose,
}: {
  dice: number;
  tileLabel: string;
  event: EventData;
  choiceEffects: Partial<Stats>[];
  onChoose: (index: number) => void;
}) {
  return (
    <div className="card-drop">
      <div className="landing-note">
        <Dice value={dice} small />
        <span>
          {dice} langkah.{" "}
          Mendarat di <strong>{tileLabel}</strong>.
        </span>
      </div>
      <EventCard event={event} choiceEffects={choiceEffects} onChoose={onChoose} />
    </div>
  );
}
