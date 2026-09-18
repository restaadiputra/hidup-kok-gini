import type { CSSProperties } from "react";
import { MONTHLY_NOTES } from "../../data/calendar";
import { BOARD } from "../../data/categories";
import { PLAYER_COLORS } from "../../data/players";
import type { GameState, Player } from "../../game/types";
import type { TurnMotion } from "../../hooks/use-turn-motion";
import { Icon } from "../icon/icon";
import { BoardCenter } from "./board-center";
import { BoardTile } from "./board-tile";
import { boardMotionStyle } from "./ring-layout";
import { TableBits } from "./table-bits";
import "./board.css";

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
      <div className="board-caption">
        <Icon name="sparkles" size={15} />
        <p>{MONTHLY_NOTES[(game?.month ?? 1) - 1]}</p>
        <span>kata semesta™</span>
      </div>
    </section>
  );
}
