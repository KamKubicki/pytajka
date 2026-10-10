import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { GameProvider, GameContext } from './contexts/GameContext.jsx';
import useSocket from './hooks/useSocket';
import useSound from './hooks/useSound';
import Lobby from './components/Lobby';
import Question from './components/Question';
import Results from './components/Results';
import FinalResults from './components/FinalResults';
import RoundSummary from './components/RoundSummary';
import CategoryVote from './components/CategoryVote';
import Host from './components/Host';
import useHostSettings from './hooks/useHostSettings';
import SabotageBanner from './components/SabotageBanner';
import { sabotageByTarget } from './sabotage';

function MuteButton({ sound }) {
  const canToggle = typeof sound?.toggleMute === 'function';
  const canSet = typeof sound?.setMuted === 'function';
  if (!canToggle && !canSet) return null;
  const muted = !!sound.muted;
  const onClick = () => {
    if (canToggle) sound.toggleMute();
    else sound.setMuted(!muted);
  };
  return (
    <button
      type="button"
      className="mute-button"
      onClick={onClick}
      aria-label={muted ? 'Włącz dźwięk' : 'Wycisz'}
      title={muted ? 'Włącz dźwięk' : 'Wycisz'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

function HostToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      className={`host-toggle ${enabled ? '' : 'is-off'}`}
      onClick={onToggle}
      aria-label={enabled ? 'Ukryj prowadzącego' : 'Pokaż prowadzącego'}
      title={enabled ? 'Ukryj prowadzącego' : 'Pokaż prowadzącego'}
    >
      🎙️
    </button>
  );
}

function AppContent() {
  const ctx = useContext(GameContext);
  const {
    gameState,
    sessionId,
    qrCode,
    joinUrl,
    players,
    gameSettings,
    totalQuestionCount,
    currentQuestion,
    questionMeta,
    timer,
    answeredIds,
    answerCount,
    showCorrectAnswer,
    resultsData,
    voteData,
    voteTimer,
    socket,
    roundSummaryData,
    activeSabotage
  } = ctx;
  const sabotageMap = useMemo(() => sabotageByTarget(activeSabotage), [activeSabotage]);

  // Single sound instance shared by socket handlers and the mute button
  const sound = useSound();
  useSocket(sound);
  const [hostSettings, updateHostSettings] = useHostSettings();
  const soundRef = useRef(sound);
  soundRef.current = sound;

  // Background music follows the game phase
  const musicRef = useRef(null);
  const wantedMusic =
    gameState === 'lobby' ? 'lobby'
      : gameState === 'question' && !showCorrectAnswer ? 'thinking'
        : null;
  useEffect(() => {
    if (musicRef.current === wantedMusic) return;
    musicRef.current = wantedMusic;
    try {
      if (wantedMusic && typeof sound?.startMusic === 'function') sound.startMusic(wantedMusic);
      else if (!wantedMusic && typeof sound?.stopMusic === 'function') sound.stopMusic();
    } catch (e) { /* ignore */ }
  }, [wantedMusic, sound?.startMusic, sound?.stopMusic]);

  // Browsers block audio until the first user gesture - retry the music then
  useEffect(() => {
    const unlock = () => {
      const s = soundRef.current;
      if (musicRef.current && typeof s?.startMusic === 'function') {
        try { s.startMusic(musicRef.current); } catch (e) { /* ignore */ }
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const onStartGame = (settings) => {
    if (players.length > 0 && socket) {
      socket.emit('start-game', { sessionId, settings });
    }
  };

  const onResetGame = () => {
    window.location.reload();
  };

  let screen = null;
  if (gameState === 'lobby') {
    screen = (
      <Lobby
        sessionId={sessionId}
        qrCode={qrCode}
        joinUrl={joinUrl}
        players={players}
        gameSettings={gameSettings}
        totalQuestionCount={totalQuestionCount}
        onStartGame={onStartGame}
        hostSettings={hostSettings}
        onHostSettingsChange={updateHostSettings}
      />
    );
  } else if (gameState === 'starting') {
    screen = (
      <main className="screen screen-center">
        <div className="starting">
          <div className="eyebrow">Gotowi?</div>
          <div className="starting-title">Startujemy!</div>
        </div>
      </main>
    );
  } else if (gameState === 'category-vote' || gameState === 'category-result') {
    screen = (
      <CategoryVote
        voteData={voteData}
        timeLeft={voteTimer}
        players={players}
        showResult={gameState === 'category-result'}
      />
    );
  } else if (gameState === 'question') {
    screen = (
      <Question
        question={currentQuestion}
        meta={questionMeta}
        timer={timer}
        players={players}
        answeredIds={answeredIds}
        answerCount={answerCount}
        showCorrectAnswer={showCorrectAnswer}
        sabotage={sabotageMap}
      />
    );
  } else if (gameState === 'results-summary') {
    screen = <Results resultsData={resultsData} meta={questionMeta} sabotage={sabotageMap} />;
  } else if (gameState === 'round-end' && roundSummaryData) {
    screen = (
      <RoundSummary
        round={roundSummaryData.round}
        totalRounds={questionMeta?.totalRounds}
        players={roundSummaryData.players || players}
      />
    );
  } else if (gameState === 'finished') {
    screen = <FinalResults players={players} onResetGame={onResetGame} />;
  }

  const hostOn = !!hostSettings.enabled;
  const stageClass = [
    'stage',
    hostOn ? 'has-host' : '',
    hostOn && gameState === 'question' ? 'host-compact' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={stageClass}>
      <div className="stage-lights" aria-hidden="true" />
      {screen}
      <SabotageBanner sound={sound} />
      {hostOn && <Host settings={hostSettings} sound={sound} />}
      <HostToggle enabled={hostOn} onToggle={() => updateHostSettings(s => ({ enabled: !s.enabled }))} />
      <MuteButton sound={sound} />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
