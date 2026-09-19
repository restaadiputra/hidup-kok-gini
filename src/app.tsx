import { useState } from "react";
import { ActivePlayer } from "./components/active-player/active-player";
import { AppFooter } from "./components/app-footer/app-footer";
import { Board } from "./components/board/board";
import { ControlPanel } from "./components/control-panel/control-panel";
import { ControlSheet } from "./components/control-sheet/control-sheet";
import { EventPanel } from "./components/event-panel/event-panel";
import { HandoffBeat } from "./components/handoff-beat/handoff-beat";
import { LiveRegion } from "./components/live-region/live-region";
import { LogDialog } from "./components/log-dialog/log-dialog";
import { NoticeBanner } from "./components/notice-banner/notice-banner";
import { PaydayDialog } from "./components/payday-dialog/payday-dialog";
import { PaydayReceipt } from "./components/payday-receipt/payday-receipt";
import { PlayerDock } from "./components/player-dock/player-dock";
import { ResolvedPanel } from "./components/resolved-panel/resolved-panel";
import { RestartDialog } from "./components/restart-dialog/restart-dialog";
import { ResultsPanel } from "./components/results-panel/results-panel";
import { RollPanel } from "./components/roll-panel/roll-panel";
import { RulesDialog } from "./components/rules-dialog/rules-dialog";
import { SetupForm } from "./components/setup-form/setup-form";
import { SiteHeader } from "./components/site-header/site-header";
import { SquadDialog } from "./components/squad-dialog/squad-dialog";
import { Timeline } from "./components/timeline/timeline";
import { BOARD } from "./data/categories";
import { EVENT_BY_ID } from "./data/events";
import { isFinalTurn } from "./game/reducer";
import { rankPlayers } from "./game/scoring";
import { useGame } from "./hooks/use-game";
import { useHandoff } from "./hooks/use-handoff";
import { useSetupDraft } from "./hooks/use-setup-draft";
import { useTheme } from "./hooks/use-theme";
import "./app.css";

type Modal = "rules" | "restart" | "squad" | "log" | null;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const draft = useSetupDraft();
  const session = useGame();
  const { handoff, dismiss: dismissHandoff } = useHandoff(session.game);
  const [modal, setModal] = useState<Modal>(null);

  const { game, player, finished, motion } = session;
  const players = game?.players ?? draft.previews;
  const activeId = game && !finished ? game.currentPlayer : null;
  // The paycheck popover owns the screen until it is acknowledged.
  const dialogsAllowed = game?.phase !== "payday" && game?.phase !== "payday-event";
  const closeModal = () => setModal(null);

  function startOver() {
    session.quit();
    closeModal();
  }

  function turnContent() {
    if (!game || !player) return null;
    const tileLabel = BOARD[player.position].label;
    const nextPlayer = players[(game.currentPlayer + 1) % players.length];
    return (
      <>
        <ActivePlayer
          player={player}
          moving={!!motion}
          headingRef={session.headingRef}
          onOpenSquad={() => setModal("squad")}
        />
        {game.phase === "ready" || motion ? (
          <RollPanel
            tileLabel={tileLabel}
            lastDice={game.dice}
            motion={motion}
            onRoll={session.roll}
          />
        ) : null}
        {!motion && game.phase !== "payday" && game.paydayDetails ? (
          <PaydayReceipt paycheck={game.paydayDetails} />
        ) : null}
        {!motion && game.phase === "event" ? (
          <EventPanel
            key={game.turn + "-" + game.eventId}
            dice={game.dice!}
            tileLabel={tileLabel}
            event={EVENT_BY_ID[game.eventId!]}
            choiceEffects={game.choiceEffects}
            onChoose={session.choose}
          />
        ) : null}
        {!motion && game.phase === "payday-event" ? (
          <EventPanel
            key={game.turn + "-payday-" + game.eventId}
            dice={1}
            tileLabel="Event gajian bersama"
            event={EVENT_BY_ID[game.eventId!]}
            choiceEffects={game.choiceEffects}
            onChoose={session.choose}
          />
        ) : null}
        {!motion && game.phase === "resolved" ? (
          <ResolvedPanel
            key={game.turn}
            resolution={game.resolution}
            effects={game.lastEffects}
            finalTurn={isFinalTurn(game) || (game.paydayEventId !== null && game.month === 12)}
            nextPlayerName={nextPlayer.name}
            onNext={session.next}
          />
        ) : null}
      </>
    );
  }

  function panelContent() {
    if (!game) return <SetupForm draft={draft} onStart={() => session.start(draft.previews.map((p) => p.name))} />;
    if (finished)
      return <ResultsPanel rankings={rankPlayers(players)} headingRef={session.headingRef} onPlayAgain={startOver} />;
    return turnContent();
  }

  return (
    <div className="game-app">
      <SiteHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenRules={() => setModal("rules")}
        onOpenRestart={() => setModal("restart")}
        canRestart={!!game}
      />
      <main className="game-main">
        <NoticeBanner notice={session.notice} saveError={session.saveError} onDismiss={session.dismissNotice} />
        <Timeline month={game?.month ?? 1} finished={finished} />
        <div className="play-layout">
          <div className="board-column">
            <Board game={game} players={players} motion={motion} />
            <PlayerDock players={players} activeId={activeId} onOpenSquad={() => setModal("squad")} />
          </div>
          <ControlSheet
            game={game}
            finished={finished}
            expanded={session.expanded}
            open={session.sheetOpen}
            onOpen={session.openSheet}
            onClose={session.closeSheet}
          >
            <ControlPanel
              game={game}
              finished={finished}
              moving={!!motion}
              playerCount={players.length}
              onClose={session.closeSheet}
            >
              {panelContent()}
            </ControlPanel>
          </ControlSheet>
        </div>
      </main>
      <AppFooter
        hasGame={!!game}
        saveError={session.saveError}
        playerCount={players.length}
        onOpenSquad={() => setModal("squad")}
        onOpenLog={() => setModal("log")}
      />
      <LiveRegion game={game} player={player} motion={motion} />
      {!motion && game?.phase === "payday" && game.paydayDetails && game.paydayPlayer !== undefined ? (
        <PaydayDialog
          month={game.month}
          playerName={game.players[game.paydayPlayer]?.name ?? "Pemain"}
          playerNumber={game.paydayPlayer + 1}
          playerCount={game.players.length}
          paycheck={game.monthPaychecks?.find(({ playerId }) => playerId === game.paydayPlayer)?.paycheck ?? game.paydayDetails}
          choiceEffects={game.paydayChoiceEffects ?? []}
          onChoose={session.paydayChoose}
        />
      ) : null}
      {handoff ? <HandoffBeat key={handoff.turn} player={handoff.player} onDone={dismissHandoff} /> : null}
      {dialogsAllowed && modal === "rules" ? <RulesDialog onClose={closeModal} /> : null}
      {modal === "restart" ? <RestartDialog onCancel={closeModal} onConfirm={startOver} /> : null}
      {dialogsAllowed && modal === "squad" ? (
        <SquadDialog players={players} activeId={activeId} onClose={closeModal} />
      ) : null}
      {dialogsAllowed && modal === "log" ? <LogDialog log={game?.log ?? null} onClose={closeModal} /> : null}
    </div>
  );
}
