import React, { createContext, useState } from 'react';

const GameContext = createContext();

const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState('lobby');
  const [players, setPlayers] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [localIP, setLocalIP] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(15);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [playerAnswers, setPlayerAnswers] = useState(new Map());
  const [realTimeAnswers, setRealTimeAnswers] = useState(new Map());
  const [prepareTimer, setPrepareTimer] = useState(5);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [breakTimer, setBreakTimer] = useState(5);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [gameSettings, setGameSettings] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [socket, setSocket] = useState(null);

  const value = {
    gameState, setGameState,
    players, setPlayers,
    sessionId, setSessionId,
    qrCode, setQrCode,
    joinUrl, setJoinUrl,
    localIP, setLocalIP,
    currentQuestion, setCurrentQuestion,
    questionIndex, setQuestionIndex,
    timer, setTimer,
    showCorrectAnswer, setShowCorrectAnswer,
    playerAnswers, setPlayerAnswers,
    realTimeAnswers, setRealTimeAnswers,
    prepareTimer, setPrepareTimer,
    questionNumber, setQuestionNumber,
    totalQuestions, setTotalQuestions,
    breakTimer, setBreakTimer,
    totalQuestionCount, setTotalQuestionCount,
    gameSettings, setGameSettings,
    resultsData, setResultsData,
    socket, setSocket
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export { GameContext, GameProvider };