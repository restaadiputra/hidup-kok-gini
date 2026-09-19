import { useEffect, useState, type CSSProperties } from "react";
import { MONTHLY_NOTES } from "../../data/calendar";
import { BOARD } from "../../data/categories";
import { PLAYER_COLORS } from "../../data/players";
import type { GameState, Player } from "../../game/types";
import type { TurnMotion } from "../../hooks/use-turn-motion";
import { Icon } from "../icon/icon";
import { BoardCenter } from "./board-center";
import { BoardTile } from "./board-tile";
import { advanceCaption, type CaptionFrame } from "./caption-transition";
import { boardMotionStyle } from "./ring-layout";
import { TableBits } from "./table-bits";
import "./board.css";

function BoardCaption() {
  const [frame, setFrame] = useState<CaptionFrame>({
    index: 0,
    visible: Array.from(MONTHLY_NOTES[0]).length,
    phase: "hold",
  });
  const [visible, setVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncVisibility = () => setVisible(!document.hidden);
    const syncMotion = () => setReducedMotion(motionPreference.matches);
    document.addEventListener("visibilitychange", syncVisibility);
    motionPreference.addEventListener("change", syncMotion);
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      motionPreference.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const delay = reducedMotion && frame.phase !== "hold"
      ? 0
      : frame.phase === "hold" ? 60_000 : frame.phase === "erase" ? 28 : 45;
    const timer = window.setTimeout(() => {
      setFrame((previous) => advanceCaption(previous, MONTHLY_NOTES, reducedMotion));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [frame, visible, reducedMotion]);

  const note = MONTHLY_NOTES[frame.index];
  const shown = Array.from(note).slice(0, frame.visible).join("");

  return (
    <div className="board-caption">
      <Icon name="sparkles" size={15} />
      <p>
        <span className="sr-only">{note}</span>
        <span className={`board-caption-text ${frame.phase === "hold" ? "" : "is-changing"}`} aria-hidden="true">{shown}</span>
      </p>
    </div>
  );
}

export function Board({
  game,
  players,
  motion,
}: {
  game: GameState | null;
  players: Player[];
  motion: TurnMotion | null;
}) {
  const visiblePlayers = players.map((p) =>
    motion?.playerId === p.id ? { ...p, position: motion.position } : p,
  );
  const activePosition =
    game && game.phase !== "finished" ? visiblePlayers[game.currentPlayer].position : null;
  const moving = motion?.stage === "moving";
  const current = game && game.phase !== "finished" ? visiblePlayers[game.currentPlayer] : null;
  return (
    <section className="board-panel" aria-label="Papan permainan">
      <div className="board-toolbar">
        <span>
          <i className="status-dot" /> PAPAN NASIB <b>+62</b>
        </span>
        {current && !motion ? (
          <span className="board-where" style={{ "--player-color": PLAYER_COLORS[current.id] } as CSSProperties}>
            <i aria-hidden="true" />
            {current.name} di {BOARD[current.position].label}
          </span>
        ) : null}
        <span className="board-direction">
          {motion ? `Jalan dulu, bestie. ${motion.step}/${motion.dice}` : "SEARAH JARUM JAM"}
          <Icon name="reset" size={13} />
        </span>
      </div>
      <div className={`board-arena ${moving ? "board-in-motion" : ""}`}>
        <TableBits />
        <div className="board-grid" style={boardMotionStyle(motion)}>
          {BOARD.map((tile, index) => (
            <BoardTile
              key={tile.category}
              tile={tile}
              index={index}
              occupants={visiblePlayers.filter((p) => p.position === index)}
              active={activePosition === index}
              motion={motion}
            />
          ))}
          <BoardCenter />
        </div>
      </div>
      <BoardCaption />
    </section>
  );
}
