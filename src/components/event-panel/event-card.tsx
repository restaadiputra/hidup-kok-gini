import { useEffect, useRef, type CSSProperties } from "react";
import { DECK_META } from "../../data/special-decks";
import type { EventCard as EventData, Stats } from "../../game/types";
import { burst, centerOf, TILE_TOKEN } from "../../motion/fx";
import { usePick } from "../../motion/use-pick";
import { Effects } from "../effects/effects";
import { Icon } from "../icon/icon";
import "./event-card.css";

// The card lands face down and turns over; the confetti fires as the face shows.
const FLIP_REVEAL_MS = 330;

function targetCopy(choice: EventData["choices"][number]) {
  if (choice.target === "all") return choice.result;
  return "Yang lain ikut kena. Tidak ada yang bisa pura-pura AFK.";
}

export function EventCard({
  event,
  choiceEffects,
  onChoose,
}: {
  event: EventData;
  choiceEffects: Partial<Stats>[];
  onChoose: (index: number) => void;
}) {
  const category = DECK_META[event.category];
  const color = TILE_TOKEN[category.color] ?? "var(--tile-3)";
  const cardRef = useRef<HTMLDivElement>(null);
  const { picked, pick } = usePick(onChoose, [color, "var(--accent)", "var(--fixed)"]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { x, y } = centerOf(cardRef.current?.querySelector(".event-category") ?? null);
      burst(x, y, { colors: [color, color, "var(--fixed)", "var(--paper)"], count: 18, distance: 130, size: 10 });
    }, FLIP_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [event.id, color]);

  return (
    <div className="event-stack" key={event.id} style={{ "--category": color } as CSSProperties}>
      <span className="stack-card stack-card-a" aria-hidden="true" />
      <span className="stack-card stack-card-b" aria-hidden="true" />
      <div className="event-content" ref={cardRef}>
        <span className="card-back-face" aria-hidden="true" />
        <div className={`event-category tile-${category.color}`}>
          <Icon name={category.icon} size={17} />
          {category.label}
          <span>KARTU KEHIDUPAN</span>
        </div>
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <span className="field-label choice-label">KAMU MAU GIMANA?</span>
        <div className={`choices ${picked !== null ? "has-pick" : ""}`}>
          {event.choices.map((choice, index) => (
            <button
              className={`choice ${choice.target === "all" ? "choice-all" : ""} ${picked === index ? "is-picked" : ""}`}
              key={choice.label}
              style={{ "--i": index } as CSSProperties}
              disabled={picked !== null && picked !== index}
              aria-pressed={picked === index ? true : undefined}
              onClick={(clickEvent) => pick(index, clickEvent)}
            >
              <span className="choice-top">
                <strong>{choice.label}</strong>
                <Icon name="arrow" size={17} />
              </span>
              {choice.target !== "self" ? (
                <span className={`choice-target ${choice.target === "all" ? "choice-target-all" : ""}`}>
                  {choice.target === "all" ? <Icon name="users" size={13} /> : null}
                  {targetCopy(choice)}
                </span>
              ) : null}
              <Effects effects={choiceEffects[index]} />
              <span className="choice-stamp" aria-hidden="true">DIPILIH</span>
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
