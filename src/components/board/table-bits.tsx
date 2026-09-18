import "./table-bits.css";
// Original board-game props drawn for this game: dice, card fans, meeples, coins.
// Decorative only — the scatter layer is hidden from assistive tech.

const PIPS: Record<number, [number, number][]> = {
  1: [[20, 20]],
  2: [[13, 13], [27, 27]],
  3: [[13, 13], [20, 20], [27, 27]],
  4: [[13, 13], [27, 13], [13, 27], [27, 27]],
  5: [[13, 13], [27, 13], [20, 20], [13, 27], [27, 27]],
  6: [[13, 12], [27, 12], [13, 20], [27, 20], [13, 28], [27, 28]],
};

function Die({ face = 4, fill = "#fffcf5" }: { face?: number; fill?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <rect
        x="2.5"
        y="2.5"
        width="35"
        height="35"
        rx="9"
        fill={fill}
        stroke="currentColor"
        strokeWidth="2.6"
      />
      {PIPS[face].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.1" fill="currentColor" />
      ))}
    </svg>
  );
}

function CardFan({ tones }: { tones: [string, string, string] }) {
  return (
    <svg viewBox="0 0 70 62" fill="none">
      <g stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round">
        <rect
          x="22"
          y="10"
          width="26"
          height="40"
          rx="4"
          fill={tones[0]}
          transform="rotate(-20 35 54)"
        />
        <rect
          x="22"
          y="10"
          width="26"
          height="40"
          rx="4"
          fill={tones[1]}
          transform="rotate(20 35 54)"
        />
        <rect x="22" y="6" width="26" height="40" rx="4" fill={tones[2]} />
        <path
          d="M35 18v14M28 25h14M31 21l8 8m0-8-8 8"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function Meeple({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2.2c-1.75 0-3.1 1.35-3.1 3 0 .9.35 1.7.95 2.3-1.5.8-2.9 2.1-3.85 3.6-.55.9-1.35.9-2.1.9H3.1c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1h1.2c1.3 0 2.45-.45 3.35-1.2L7.1 21.8h9.8l-.55-8.8c.9.75 2.05 1.2 3.35 1.2h1.2c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1h-.8c-.75 0-1.55 0-2.1-.9-.95-1.5-2.35-2.8-3.85-3.6.6-.6.95-1.4.95-2.3 0-1.65-1.35-3-3.1-3Z"
        fill={fill}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Coins({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
        <path d="M6 27c0-2.8 6.3-5 14-5s14 2.2 14 5v3c0 2.8-6.3 5-14 5S6 32.8 6 30Z" fill={fill} />
        <ellipse cx="20" cy="27" rx="14" ry="5" fill={fill} />
        <path d="M6 19c0-2.8 6.3-5 14-5s14 2.2 14 5v3" fill={fill} />
        <ellipse cx="20" cy="19" rx="14" ry="5" fill={fill} />
        <ellipse cx="20" cy="11" rx="14" ry="5" fill={fill} />
        <path d="M17 8.5h3.5a2 2 0 0 1 0 4H17v-4Zm0 4v2.5" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function TableBits() {
  return (
    <div className="table-bits" aria-hidden="true">
      <span className="bit bit-cards-left">
        <CardFan tones={["var(--tile-4)", "var(--tile-2)", "var(--tile-3)"]} />
      </span>
      <span className="bit bit-die-left">
        <Die face={5} />
      </span>
      <span className="bit bit-meeple-left">
        <Meeple fill="var(--tile-6)" />
      </span>
      <span className="bit bit-die-right">
        <Die face={2} fill="var(--tile-wild)" />
      </span>
      <span className="bit bit-coins-right">
        <Coins fill="var(--tile-3)" />
      </span>
      <span className="bit bit-meeple-right">
        <Meeple fill="var(--tile-1)" />
      </span>
      <span className="bit bit-die-corner">
        <Die face={3} />
      </span>
    </div>
  );
}

// The board centre carries its own bits, so the phone — where the board fills
// the panel and there are no side gutters — still gets loose pieces around it.
export function CenterBits() {
  return (
    <div className="center-bits" aria-hidden="true">
      <span className="bit bit-center-die">
        <Die face={6} />
      </span>
      <span className="bit bit-center-cards">
        <CardFan tones={["var(--tile-6)", "var(--tile-1)", "var(--tile-2)"]} />
      </span>
      <span className="bit bit-center-coins">
        <Coins fill="var(--tile-3)" />
      </span>
      <span className="bit bit-center-meeple">
        <Meeple fill="var(--tile-4)" />
      </span>
    </div>
  );
}
