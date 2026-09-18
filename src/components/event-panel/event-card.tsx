import { CATEGORIES } from "../../data/categories";
import type { EventCard as EventData, Stats } from "../../game/types";
import { Effects } from "../effects/effects";
import { Icon } from "../icon/icon";
import "./event-card.css";

export function EventCard({
  event,
  choiceEffects,
  onChoose,
}: {
  event: EventData;
  choiceEffects: Partial<Stats>[];
  onChoose: (index: number) => void;
}) {
  const category = CATEGORIES[event.category];
  return (
    <div className="event-stack" key={event.id}>
      <span className="stack-card stack-card-a" aria-hidden="true" />
      <span className="stack-card stack-card-b" aria-hidden="true" />
      <div className="event-content">
        <div className={`event-category tile-${category.color}`}>
          <Icon name={category.icon} size={17} />
          {category.label}
          <span>KARTU KEHIDUPAN</span>
        </div>
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <span className="field-label choice-label">KAMU MAU GIMANA?</span>
        <div className="choices">
          {event.choices.map((choice, index) => (
            <button
              className="choice"
              key={choice.label}
              onClick={() => onChoose(index)}
            >
              <span className="choice-top">
                <strong>{choice.label}</strong>
                <Icon name="arrow" size={17} />
              </span>
              <Effects effects={choiceEffects[index]} />
            </button>
          ))}
        </div>
        <p className="small-note">
          Angka diacak saat kartu muncul. Pilih yang paling sanggup kamu tanggung.
        </p>
      </div>
    </div>
  );
}
