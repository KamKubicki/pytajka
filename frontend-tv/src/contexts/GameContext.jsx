import React, { createContext, useState } from 'react';

const GameContext = createContext();

const EMPTY_VOTE = {
  round: null,
  totalRounds: null,
  duration: 10,
  options: [],
  votes: {},
  totalVotes: 0,
  totalPlayers: 0,
  votedPlayerIds: [],
  result: null
};

const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState('lobby');
  const [players, setPlayers] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  // Meta for the current question: round, totalRounds, questionNumber, totalQuestions,
  // questionInRound, questionsPerRound, timeLimit, roundCategory (all optional)
  const [questionMeta, setQuestionMeta] = useState({ timeLimit: 15 });
  const [timer, setTimer] = useState(15);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  // Only WHO answered - never what they answered
  const [answeredIds, setAnsweredIds] = useState(() => new Set());
  const [answerCount, setAnswerCount] = useState({ total: 0, players: 0 });
  const [voteData, setVoteData] = useState(EMPTY_VOTE);
  const [voteTimer, setVoteTimer] = useState(0);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [gameSettings, setGameSettings] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [roundSummaryData, setRoundSummaryData] = useState(null);
  const [socket, setSocket] = useState(null);
  // Sabotage cards (see sabotage.js): feed of announced attacks (for the banner + host),
  // victims of the current question and attacks queued for the next one.
  const [sabotageFeed, setSabotageFeed] = useState([]);
  const [activeSabotage, setActiveSabotage] = useState([]); // [{ targetPlayerId, type, fromName }]
  const [pendingSabotage, setPendingSabotage] = useState([]);

  const value = {
    gameState, setGameState,
    players, setPlayers,
    sessionId, setSessionId,
    qrCode, setQrCode,
    joinUrl, setJoinUrl,
    currentQuestion, setCurrentQuestion,
    questionMeta, setQuestionMeta,
    timer, setTimer,
    showCorrectAnswer, setShowCorrectAnswer,
    answeredIds, setAnsweredIds,
    answerCount, setAnswerCount,
    voteData, setVoteData,
    voteTimer, setVoteTimer,
    totalQuestionCount, setTotalQuestionCount,
    gameSettings, setGameSettings,
    resultsData, setResultsData,
    roundSummaryData, setRoundSummaryData,
    socket, setSocket,
    sabotageFeed, setSabotageFeed,
    activeSabotage, setActiveSabotage,
    pendingSabotage, setPendingSabotage
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export { GameContext, GameProvider, EMPTY_VOTE };
