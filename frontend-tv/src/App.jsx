import React from 'react';
import { GameProvider, GameContext } from './contexts/GameContext.jsx';
import useSocket from './hooks/useSocket';
import Lobby from './components/Lobby';
import Question from './components/Question';
import Results from './components/Results';
import FinalResults from './components/FinalResults';
import Preparing from './components/Preparing';
import Break from './components/Break';

function AppContent() {
  const {
    gameState,
    sessionId,
    qrCode,
    joinUrl,
    localIP,
    players,
    gameSettings,
    totalQuestionCount,
    currentQuestion,
    timer,
    realTimeAnswers,
    showCorrectAnswer,
    resultsData,
    questionNumber,
    totalQuestions,
    prepareTimer,
    breakTimer,
    socket
  } = React.useContext(GameContext);

  useSocket();

  const onStartGame = (settings) => {
    if (players.length > 0) {
      socket.emit('start-game', { sessionId, settings });
    }
  };

  const onResetGame = () => {
    window.location.reload();
  };

  return (
    <>
      {gameState === 'lobby' && (
        <Lobby
          sessionId={sessionId}
          qrCode={qrCode}
          joinUrl={joinUrl}
          localIP={localIP}
          players={players}
          gameSettings={gameSettings}
          totalQuestionCount={totalQuestionCount}
          onStartGame={onStartGame}
        />
      )}
      {gameState === 'preparing' && (
        <Preparing
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          prepareTimer={prepareTimer}
        />
      )}
      {gameState === 'break' && (
        <Break
          breakTimer={breakTimer}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />
      )}
      {gameState === 'results-summary' && <Results resultsData={resultsData} />}
      {(gameState === 'playing' || gameState === 'question') && (
        <Question
          currentQuestion={currentQuestion}
          timer={timer}
          players={players}
          realTimeAnswers={realTimeAnswers}
          showCorrectAnswer={showCorrectAnswer}
        />
      )}
      {gameState === 'finished' && (
        <FinalResults players={players} onResetGame={onResetGame} />
      )}
    </>
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