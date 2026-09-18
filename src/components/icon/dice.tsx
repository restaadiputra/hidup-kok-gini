import "./dice.css";
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Dice({
  value = 5,
  rolling = false,
  small = false,
}: {
  value?: number;
  rolling?: boolean;
  small?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={rolling ? "Dadu sedang dilempar" : `Dadu ${value}`}
      className={`dice ${rolling ? "rolling" : ""} ${small ? "dice-small" : ""}`}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} className={PIPS[value].includes(i) ? "dot visible" : "dot"} />
      ))}
    </span>
  );
}
