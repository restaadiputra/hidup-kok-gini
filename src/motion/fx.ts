// Presentation-only effects: flat cardboard bits, coins and impact rings that
// fly over the table. Nothing here touches game state, and every effect is a
// no-op under prefers-reduced-motion. Pieces are removed when they finish.

export const PIECE_COLORS = [
  "var(--tile-1)",
  "var(--tile-2)",
  "var(--tile-3)",
  "var(--tile-4)",
  "var(--tile-5)",
  "var(--tile-6)",
  "var(--tile-7)",
];
const REWARD_COLORS = ["var(--fixed)", "var(--tile-3)", "var(--tile-wild)"];
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const random = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

// An open modal dialog lives in the top layer, above anything in <body>, so
// effects have to be drawn inside it to be seen.
function layer(): HTMLElement {
  const host = document.querySelector<HTMLDialogElement>("dialog[open]") ?? document.body;
  let node = host.querySelector<HTMLElement>(":scope > .fx-layer");
  if (!node) {
    node = document.createElement("div");
    node.className = "fx-layer";
    node.setAttribute("aria-hidden", "true");
    host.append(node);
  }
  return node;
}

function piece(className: string, color: string, size: number): HTMLElement {
  const el = document.createElement("i");
  el.className = className;
  el.style.background = color;
  el.style.width = `${size}px`;
  el.style.height = `${className.includes("fx-coin") ? size : size * pick([1, 1, 0.55, 1.6])}px`;
  if (!className.includes("fx-coin")) el.style.borderRadius = pick(["2px", "50%", "2px 8px"]);
  return el;
}

export function centerOf(el: Element | null): { x: number; y: number } {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Cardboard confetti thrown out from a point, then falling onto the table. */
export function burst(
  x: number,
  y: number,
  { colors = PIECE_COLORS, count = 12, distance = 80, size = 9 }: {
    colors?: readonly string[];
    count?: number;
    distance?: number;
    size?: number;
  } = {},
) {
  if (reducedMotion()) return;
  const host = layer();
  for (let i = 0; i < count; i++) {
    const el = piece("fx-bit", pick(colors), random(size * 0.7, size * 1.25));
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    host.append(el);
    const angle = (Math.PI * 2 * i) / count + random(-0.4, 0.4);
    const reach = random(distance * 0.5, distance);
    const dx = Math.cos(angle) * reach;
    const dy = Math.sin(angle) * reach - distance * 0.35;
    const spin = random(-540, 540);
    el.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.4) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${spin * 0.6}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + distance * 0.7}px)) scale(0.8) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: random(650, 950), easing: EASE_OUT },
    ).onfinish = () => el.remove();
  }
}

/** A rain of confetti or coins over the whole screen (or the open dialog). */
export function rain({ kind = "confetti", count = 42, colors }: {
  kind?: "confetti" | "coin";
  count?: number;
  colors?: readonly string[];
} = {}) {
  if (reducedMotion()) return;
  const host = layer();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const palette = colors ?? (kind === "coin" ? REWARD_COLORS : PIECE_COLORS);
  for (let i = 0; i < count; i++) {
    const coin = kind === "coin";
    const el = piece(coin ? "fx-bit fx-coin" : "fx-bit", pick(palette), coin ? random(14, 22) : random(7, 13));
    el.style.left = `${random(0, width)}px`;
    el.style.top = "-30px";
    host.append(el);
    const sway = random(-90, 90);
    const spin = random(-720, 720);
    el.animate(
      [
        { transform: "translateY(0) rotate(0deg) rotateY(0deg)", opacity: 1 },
        { transform: `translate(${sway}px, ${height * 0.55}px) rotate(${spin * 0.5}deg) rotateY(360deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${sway * 0.4}px, ${height + 60}px) rotate(${spin}deg) rotateY(720deg)`, opacity: 0.9 },
      ],
      { duration: random(1400, 2400), delay: random(0, 650), easing: "cubic-bezier(0.3, 0.2, 0.6, 1)", fill: "backwards" },
    ).onfinish = () => el.remove();
  }
}

/** An outlined shockwave ring, like a die slapped onto the table. */
export function ring(x: number, y: number, color = "var(--accent)", size = 80) {
  if (reducedMotion()) return;
  const el = document.createElement("i");
  el.className = "fx-ring";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = el.style.height = `${size}px`;
  el.style.borderColor = color;
  layer().append(el);
  el.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.2)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.6)", opacity: 0 },
    ],
    { duration: 520, easing: EASE_OUT },
  ).onfinish = () => el.remove();
}

/** A short, decaying jolt, as if someone bumped the table. */
export function shake(el: Element | null, strength = 5) {
  if (!el || reducedMotion()) return;
  const s = strength;
  el.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${-s}px, ${s * 0.4}px) rotate(-0.4deg)` },
      { transform: `translate(${s * 0.8}px, ${-s * 0.3}px) rotate(0.3deg)` },
      { transform: `translate(${-s * 0.5}px, ${s * 0.2}px)` },
      { transform: `translate(${s * 0.25}px, 0)` },
      { transform: "translate(0, 0)" },
    ],
    { duration: 380, easing: "ease-out" },
  );
}

/** The CSS token behind each category colour name used in tile-* classes. */
export const TILE_TOKEN: Record<string, string> = {
  lavender: "var(--tile-1)",
  pink: "var(--tile-2)",
  yellow: "var(--tile-3)",
  blue: "var(--tile-4)",
  peach: "var(--tile-5)",
  green: "var(--tile-6)",
  lime: "var(--tile-wild)",
};
