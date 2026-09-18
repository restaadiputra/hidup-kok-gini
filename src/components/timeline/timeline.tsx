import { MONTHS, TOTAL_MONTHS } from "../../data/calendar";
import { Icon } from "../icon/icon";
import "./timeline.css";

function monthState(index: number, month: number, finished: boolean) {
  if (index + 1 < month || finished) return "month-done";
  return index + 1 === month ? "month-current" : "";
}

export function Timeline({ month, finished }: { month: number; finished: boolean }) {
  return (
    <section className="timeline" aria-label={`Bulan ${month} dari ${TOTAL_MONTHS}`}>
      <div className="timeline-label">
        <span>BULAN INI</span>
        <strong>
          {MONTHS[month - 1]} <small>{String(month).padStart(2, "0")}{`/${TOTAL_MONTHS}`}</small>
        </strong>
      </div>
      <ol className="month-list">
        {MONTHS.map((name, i) => {
          const state = monthState(i, month, finished);
          return (
            <li
              key={name}
              className={state}
              aria-current={!finished && i + 1 === month ? "step" : undefined}
              aria-label={name}
            >
              <span>
                {state === "month-done" ? <Icon name="check" size={10} /> : String(i + 1).padStart(2, "0")}
              </span>
              <small>{name.slice(0, 3)}</small>
            </li>
          );
        })}
      </ol>
      <Icon name="flag" size={17} />
    </section>
  );
}
