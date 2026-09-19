import { EVENT_BY_ID } from "../../data/events";
import type { GameState, Player } from "../../game/types";
import type { TurnMotion } from "../../hooks/use-turn-motion";

function phaseAnnouncement(game: GameState): string {
  if (game.phase === "payday") return `Rekap bulan ${game.month}. Semua pemain menerima gaji dan biaya hidup dipotong.`;
  if (game.phase === "payday-event") return "Event gajian bersama. Meja ikut menentukan nasibnya.";
  if (game.phase === "event") return EVENT_BY_ID[game.eventId!].title;
  if (game.phase === "resolved") return game.resolution;
  return "Siap lempar dadu.";
}

function announcement(game: GameState | null, player: Player | null, motion: TurnMotion | null): string {
  if (!game || !player) return "Atur 2 sampai 4 pemain untuk mulai.";
  if (motion) return player.name + " bergerak " + motion.dice + " langkah.";
  if (game.phase === "finished") return "Permainan selesai. Hasil akhir tersedia.";
  return "Bulan " + game.month + ", giliran " + player.name + ". " + phaseAnnouncement(game);
}

// Screen readers hear each turn change, since the board itself is visual.
export function LiveRegion({
  game,
  player,
  motion,
}: {
  game: GameState | null;
  player: Player | null;
  motion: TurnMotion | null;
}) {
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement(game, player, motion)}
    </div>
  );
}
