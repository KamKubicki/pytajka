import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Auto-detect if we're on localhost or network IP
const getBackendURL = () => {
  const currentHost = window.location.hostname;
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:8001`;
  }
  return 'http://localhost:8001';
};

const SOCKET_URL = getBackendURL();

const sampleQuestions = [
  {
    id: 1,
    question: "Która planeta jest najbliżej Słońca?",
    answers: ["Merkury", "Wenus", "Ziemia", "Mars"],
    correct: 0,
    category: "nauka"
  },
  {
    id: 2,
    question: "Kto napisał 'Lalka'?",
    answers: ["Adam Mickiewicz", "Bolesław Prus", "Henryk Sienkiewicz", "Juliusz Słowacki"],
    correct: 1,
    category: "literatura"
  },
  {
    id: 3,
    question: "W którym roku Polska wstąpiła do Unii Europejskiej?",
    answers: ["2002", "2003", "2004", "2005"],
    correct: 2,
    category: "historia"
  },
  {
    id: 4,
    question: "Która drużyna wygrała ostatnie Mistrzostwa Świata w piłce nożnej?",
    answers: ["Francja", "Argentyna", "Brazylia", "Niemcy"],
    correct: 1,
    category: "sport"
  },
  {
    id: 5,
    question: "Stolica Australii to:",
    answers: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correct: 2,
    category: "geografia"
  }
];

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('lobby'); // lobby, playing, preparing, question, break, finished
  const [sessionId, setSessionId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [localIP, setLocalIP] = useState('');
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(15);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [playerAnswers, setPlayerAnswers] = useState(new Map());
  const [realTimeAnswers, setRealTimeAnswers] = useState(new Map()); // Track answers as they come in
  const [prepareTimer, setPrepareTimer] = useState(5);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [breakTimer, setBreakTimer] = useState(5);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected, creating session...');
      // Create session after socket connects
      createGameSession(newSocket);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('host-joined', (data) => {
      console.log('Host joined:', data);
    });

    newSocket.on('player-list-updated', (data) => {
      setPlayers(data.players);
    });

    newSocket.on('player-answer', (data) => {
      console.log('Player answer received:', data);
      setPlayerAnswers(prev => new Map(prev.set(data.playerId, data.answer)));
    });

    newSocket.on('player-answer-realtime', (data) => {
      console.log('Real-time player answer:', data);
      setRealTimeAnswers(prev => new Map(prev.set(data.playerId, {
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatar: data.playerAvatar,
        answer: data.answer,
        timestamp: data.timestamp
      })));
    });

    newSocket.on('game-started', () => {
      console.log('Game started event received');
      setGameState('playing');
    });

    newSocket.on('question-prepare', (data) => {
      console.log('Question prepare:', data);
      setGameState('preparing');
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setPrepareTimer(5);
      
      // Start prepare countdown
      const prepareInterval = setInterval(() => {
        setPrepareTimer(prev => {
          if (prev <= 1) {
            clearInterval(prepareInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    newSocket.on('new-question', (data) => {
      console.log('New question received:', data.question);
      setCurrentQuestion(data.question);
      setGameState('question');
      setTimer(15);
      setShowCorrectAnswer(false);
      setPlayerAnswers(new Map());
      setRealTimeAnswers(new Map()); // Reset real-time answers for new question
      
      // Start countdown
      const timerInterval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    newSocket.on('question-ended', (data) => {
      console.log('Question ended:', data);
      setShowCorrectAnswer(true);
      
      // Update players with scores
      setPlayers(data.updatedPlayers);
    });

    newSocket.on('question-break', (data) => {
      console.log('Question break:', data);
      setGameState('break');
      setQuestionNumber(data.nextQuestionNumber);
      setTotalQuestions(data.totalQuestions);
      setBreakTimer(5);
      
      // Start break countdown
      const breakInterval = setInterval(() => {
        setBreakTimer(prev => {
          if (prev <= 1) {
            clearInterval(breakInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    newSocket.on('game-finished', () => {
      console.log('Game finished');
      setGameState('finished');
    });

    return () => newSocket.close();
  }, []);

  // Questions are now managed by backend

  const createGameSession = async (socketToUse) => {
    try {
      console.log('Creating game session...');
      const response = await fetch(`${SOCKET_URL}/api/session/create`, {
        method: 'POST'
      });
      const data = await response.json();
      console.log('Session created:', data);
      setSessionId(data.sessionId);
      
      // Get QR code
      const qrResponse = await fetch(`${SOCKET_URL}/api/session/${data.sessionId}/qr`);
      const qrData = await qrResponse.json();
      setQrCode(qrData.qrCode);
      setJoinUrl(qrData.joinUrl);
      setLocalIP(qrData.localIP);
      
      // Join as host
      const socketToEmit = socketToUse || socket;
      if (socketToEmit) {
        console.log('Host joining session:', data.sessionId);
        socketToEmit.emit('host-join', { sessionId: data.sessionId });
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const startGame = () => {
    if (players.length > 0) {
      socket.emit('start-game', { sessionId });
    }
  };


  // Backend now handles question logic

  const resetGame = () => {
    // Create completely new session
    window.location.reload();
  };

  const renderLobby = () => (
    <div className="tv-container">
      <h1 className="game-title">🧠 Wiedza to Potęga</h1>
      
      <div className="session-info">
        <div className="session-id">Kod gry: {sessionId}</div>
        <div>Zeskanuj QR kod telefonem, aby dołączyć!</div>
        
        {qrCode && (
          <div className="qr-container">
            <img src={qrCode} alt="QR Code" />
          </div>
        )}
        
        {joinUrl && (
          <div style={{fontSize: '1rem', margin: '1rem 0', opacity: 0.8}}>
            Lub wejdź na: {joinUrl}
          </div>
        )}
        
        {localIP && (
          <div style={{fontSize: '0.9rem', opacity: 0.7}}>
            IP sieciowy: {localIP}:3002
          </div>
        )}
        
        <div style={{fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem'}}>
          Graczy: {players.length}
        </div>
      </div>

      {players.length > 0 && (
        <div className="players-container">
          {players.map(player => (
            <div key={player.id} className="player-card">
              <div className="player-avatar">{player.avatar}</div>
              <div className="player-name">{player.name}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop: 'auto', paddingBottom: '2rem'}}>
        <button 
          className="start-button" 
          onClick={startGame}
          disabled={players.length === 0}
        >
          {players.length === 0 ? 'Czekam na graczy...' : 'Rozpocznij grę!'}
        </button>
      </div>
    </div>
  );

  const renderQuestion = () => {
    if (!currentQuestion) {
      return (
        <div className="tv-container">
          <div className="question-container">
            <div>Przygotowywanie pytania...</div>
            <div style={{marginTop: '1rem'}}>Graczy: {players.length}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="tv-container">
        <div className="question-container">
          <div className="timer">{timer}</div>
          <div className="question-text">{currentQuestion.question}</div>
          
          <div className="answers-arena">
            {currentQuestion.answers.map((answer, index) => {
              // Get players who chose this answer
              const playersForThisAnswer = Array.from(realTimeAnswers.values())
                .filter(playerAnswer => playerAnswer.answer === index);
              
              return (
                <div 
                  key={index}
                  className={`answer-column ${showCorrectAnswer && index === currentQuestion.correct ? 'correct' : ''}`}
                >
                  <div className="answer-header">
                    <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="answer-text">{answer}</span>
                  </div>
                  
                  <div className="players-for-answer">
                    {playersForThisAnswer.map(playerAnswer => (
                      <div 
                        key={playerAnswer.playerId} 
                        className={`player-choice ${showCorrectAnswer ? (index === currentQuestion.correct ? 'correct-choice' : 'wrong-choice') : ''}`}
                      >
                        <div className="player-avatar">{playerAnswer.playerAvatar}</div>
                        <div className="player-name">{playerAnswer.playerName}</div>
                        {playerAnswer.responseTime && (
                          <div className="response-time-display">
                            ⏱️ {(playerAnswer.responseTime / 1000).toFixed(1)}s
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="game-stats">
            <div>Odpowiedzi: {realTimeAnswers.size}/{players.length}</div>
            <div>Pozostało: {timer}s</div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinished = () => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    return (
      <div className="tv-container">
        <div className="final-results">
          <h1 className="game-title">🏆 Koniec gry!</h1>
          
          <div className="podium">
            {sortedPlayers.slice(0, 3).map((player, index) => (
              <div key={player.id} className={`podium-place ${['second', 'first', 'third'][index]}`}>
                <div className="player-avatar" style={{fontSize: '3rem'}}>{player.avatar}</div>
                <div className="player-name">{player.name}</div>
                <div className="player-score">{player.score} pkt</div>
                <div style={{fontSize: '2rem'}}>{['🥈', '🥇', '🥉'][index]}</div>
              </div>
            ))}
          </div>

          <button className="start-button" onClick={resetGame}>
            Nowa gra
          </button>
        </div>
      </div>
    );
  };

  const renderPreparing = () => (
    <div className="tv-container">
      <div className="question-container">
        <div className="prepare-title">🎯 Pytanie {questionNumber}/{totalQuestions}</div>
        <div className="prepare-text">Przygotujcie się!</div>
        <div className="prepare-timer">{prepareTimer}</div>
        <div className="prepare-subtitle">Za chwilę pojawi się pytanie...</div>
      </div>
    </div>
  );

  const renderBreak = () => (
    <div className="tv-container">
      <div className="question-container">
        <div className="prepare-title">⏸️ Przerwa</div>
        <div className="prepare-text">Czas na oddech!</div>
        <div className="prepare-timer">{breakTimer}</div>
        <div className="prepare-subtitle">Za chwilę następne pytanie {questionNumber}/{totalQuestions}...</div>
      </div>
    </div>
  );

  return (
    <>
      {gameState === 'lobby' && renderLobby()}
      {gameState === 'preparing' && renderPreparing()}
      {gameState === 'break' && renderBreak()}
      {(gameState === 'playing' || gameState === 'question') && renderQuestion()}
      {gameState === 'finished' && renderFinished()}
    </>
  );
}

export default App;