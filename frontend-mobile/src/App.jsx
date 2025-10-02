import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

// Get backend URL from environment or detect IP
const getBackendURL = () => {
  // If running on mobile device, use the IP from URL
  const currentHost = window.location.hostname;
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:8001`;
  }
  return 'http://localhost:8001';
};

const SOCKET_URL = getBackendURL();

const avatars = ['🧑', '👩', '👨', '🧒', '👦', '👧', '🧓', '👴', '👵', '🤵', '👰', '🤖'];

function JoinGame() {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(urlSessionId || '');
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!sessionId.trim() || !playerName.trim()) {
      setError('Wprowadź kod gry i swoje imię');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Check if session exists
      const response = await fetch(`${SOCKET_URL}/api/session/${sessionId.toUpperCase()}`);
      
      if (!response.ok) {
        setError('Nie znaleziono gry o tym kodzie');
        setIsJoining(false);
        return;
      }

      const sessionData = await response.json();
      
      if (sessionData.status !== 'lobby') {
        setError('Gra już się rozpoczęła');
        setIsJoining(false);
        return;
      }

      // Navigate to game
      navigate(`/game/${sessionId.toUpperCase()}`, {
        state: { playerName, avatar: selectedAvatar }
      });
    } catch (error) {
      setError('Błąd połączenia z serwerem');
      setIsJoining(false);
    }
  };

  return (
    <div className="mobile-container">
      <div className="join-form">
        <h1 className="game-title">🧠 Wiedza to Potęga</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Kod gry:</label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            placeholder="Wprowadź kod gry"
            maxLength={8}
          />
        </div>

        <div className="form-group">
          <label>Twoje imię:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Wprowadź swoje imię"
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label>Wybierz awatar:</label>
          <div className="avatar-selector">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                {avatar}
              </div>
            ))}
          </div>
        </div>

        <button 
          className="join-button"
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? 'Dołączam...' : 'Dołącz do gry!'}
        </button>
      </div>
    </div>
  );
}

function Game() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, preparing, playing, answered, results, break
  const [playerData, setPlayerData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timer, setTimer] = useState(10);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [breakTimer, setBreakTimer] = useState(5);
  const [nextQuestionNumber, setNextQuestionNumber] = useState(2);

  useEffect(() => {
    let playerName = location.state?.playerName;
    let avatar = location.state?.avatar;
    
    // Try to restore from localStorage if missing
    if (!playerName || !avatar) {
      const stored = localStorage.getItem(`game-${sessionId}`);
      if (stored) {
        const data = JSON.parse(stored);
        playerName = data.playerName;
        avatar = data.avatar;
        console.log('Restored player data from localStorage:', { playerName, avatar });
      }
    }
    
    if (!playerName || !avatar) {
      navigate(`/join/${sessionId}`);
      return;
    }
    
    // Store player data for reconnection
    localStorage.setItem(`game-${sessionId}`, JSON.stringify({ playerName, avatar }));

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Fallback for Safari
      forceNew: true,
      reconnection: true,
      timeout: 20000
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Mobile: Socket connected successfully');
      // Temporary alert for Safari debugging
      // alert('Socket connected!');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Mobile: Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.log('Mobile: Connection error:', error);
      setError('Błąd połączenia z serwerem');
    });

    // Join game
    console.log('Mobile: Emitting player-join', { sessionId, playerName, avatar });
    newSocket.emit('player-join', {
      sessionId,
      playerName,
      avatar
    });

    newSocket.on('player-joined', (data) => {
      setPlayerData({
        id: data.playerId,
        name: playerName,
        avatar: avatar,
        score: 0
      });
    });

    newSocket.on('join-error', (data) => {
      setError(data.message);
      setTimeout(() => navigate('/'), 3000);
    });

    newSocket.on('game-started', () => {
      console.log('Game started event received');
      setGameState('playing');
    });

    newSocket.on('question-prepare', (data) => {
      console.log('Question prepare:', data);
      setGameState('preparing');
    });

    newSocket.on('new-question', (data) => {
      setCurrentQuestion(data.question);
      setSelectedAnswer(null);
      setGameState('playing');
      setTimer(15);
      setLastResult(null);

      // Start timer
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
      console.log('Question ended event received:', data);
      console.log('Current playerData in closure:', playerData);
      
      // Find player by socket ID since playerData might not be set yet
      const socketId = newSocket.id;
      const updatedPlayer = data.updatedPlayers.find(p => p.socketId === socketId);
      
      console.log('Found updated player:', updatedPlayer);
      
      if (updatedPlayer) {
        setPlayerData(prev => ({ ...prev, score: updatedPlayer.score }));
        setLastResult({
          correct: updatedPlayer.lastCorrect,
          correctAnswer: data.correctAnswer,
          pointsEarned: updatedPlayer.lastCorrect ? 100 : 0
        });
        
        console.log('Setting showFeedback to true');
        // Show full-screen feedback
        setShowFeedback(true);
        setTimeout(() => {
          console.log('Hiding feedback after 2 seconds');
          setShowFeedback(false);
          setGameState('results');
        }, 2000); // Show for 2 seconds
      } else {
        console.log('Player not found in updatedPlayers');
      }
    });

    newSocket.on('question-break', (data) => {
      console.log('Question break event received:', data);
      setGameState('break');
      setNextQuestionNumber(data.nextQuestionNumber);
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
      console.log('Game finished event received');
      setGameState('finished');
    });

    return () => newSocket.close();
  }, [sessionId, navigate]);

  const handleAnswerSelect = (answerIndex) => {
    if (gameState === 'playing') {
      // Allow changing answer until time runs out
      setSelectedAnswer(answerIndex);
      
      socket.emit('player-answer', {
        sessionId,
        playerId: playerData.id,
        answer: answerIndex
      });
    }
  };

  if (error) {
    return (
      <div className="mobile-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="mobile-container">
        <div className="waiting-screen">
          <div>Dołączam do gry...</div>
        </div>
      </div>
    );
  }

  const renderWaiting = () => (
    <div className="mobile-container">
      <div className="waiting-screen">
        <div className="player-info">
          <div className="player-avatar">{playerData.avatar}</div>
          <div className="player-name">{playerData.name}</div>
          <div className="player-score">{playerData.score} pkt</div>
        </div>
        <div>Czekam na rozpoczęcie gry...</div>
        <div style={{fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7}}>
          Stan: {gameState}
        </div>
      </div>
    </div>
  );

  const renderQuestion = () => (
    <div className="mobile-container">
      <div className="controller-screen">
        <div className="controller-header">
          <div className="player-info-mini">
            <span className="player-avatar-mini">{playerData.avatar}</span>
            <span className="player-name-mini">{playerData.name}</span>
            <span className="player-score-mini">{playerData.score} pkt</span>
          </div>
          <div className="question-timer">{timer}s</div>
        </div>
        
        <div className="controller-instruction">
          📺 Patrzcie na główny ekran!
        </div>
        
        <div className="answers-container">
          {currentQuestion.answers.map((answer, index) => {
            let buttonClass = 'answer-button';
            
            if (selectedAnswer === index) {
              buttonClass += ' selected';
            }
            
            // Show correct/incorrect after question ends
            if (lastResult) {
              if (index === lastResult.correctAnswer) {
                buttonClass += ' correct';
              } else if (selectedAnswer === index && !lastResult.correct) {
                buttonClass += ' incorrect';
              }
            }
            
            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={gameState === 'answered' || gameState === 'results'}
              >
                {String.fromCharCode(65 + index)}. {answer}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="mobile-container">
      <div className="result-screen">
        <div className="result-icon">
          {lastResult?.correct ? '🎉' : '😔'}
        </div>
        <div className="result-text">
          {lastResult?.correct ? 'Brawo!' : 'Nie tym razem'}
        </div>
        <div className="points-earned">
          +{lastResult?.pointsEarned} pkt
        </div>
        <div className="total-score">
          Łącznie: {playerData.score} punktów
        </div>
        
        {lastResult && (
          <div>
            Poprawna odpowiedź: {String.fromCharCode(65 + lastResult.correctAnswer)}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreparing = () => (
    <div className="mobile-container">
      <div className="waiting-screen">
        <div className="prepare-icon">🎯</div>
        <div className="prepare-text">Przygotuj się!</div>
        <div className="prepare-subtitle">Za chwilę pojawi się pytanie...</div>
      </div>
    </div>
  );

  const renderBreak = () => (
    <div className="mobile-container">
      <div className="waiting-screen">
        <div className="prepare-icon">⏸️</div>
        <div className="prepare-text">Przerwa!</div>
        <div className="prepare-timer" style={{fontSize: '3rem', color: '#FFD700', margin: '1rem 0'}}>{breakTimer}s</div>
        <div className="prepare-subtitle">Za chwilę pytanie {nextQuestionNumber}...</div>
      </div>
    </div>
  );

  const renderFinished = () => (
    <div className="mobile-container">
      <div className="result-screen">
        <div className="result-icon">🏆</div>
        <div className="result-text" style={{fontSize: '2rem', marginBottom: '1rem'}}>
          Koniec gry!
        </div>
        <div className="player-info" style={{marginBottom: '2rem'}}>
          <div className="player-avatar">{playerData?.avatar}</div>
          <div className="player-name">{playerData?.name}</div>
        </div>
        <div className="total-score" style={{fontSize: '2.5rem', color: '#FFD700', fontWeight: 'bold', marginBottom: '1rem'}}>
          {playerData?.score} punktów
        </div>
        <div style={{fontSize: '1.2rem', opacity: 0.8}}>
          Dziękujemy za grę!
        </div>
        <button 
          className="join-button" 
          style={{marginTop: '2rem'}}
          onClick={() => navigate('/')}
        >
          Nowa gra
        </button>
      </div>
    </div>
  );

  const renderFeedback = () => {
    if (!lastResult || !currentQuestion) return null;
    
    const correctAnswer = currentQuestion.answers[lastResult.correctAnswer];
    
    return (
      <div className={`feedback-screen ${lastResult.correct ? 'correct' : 'incorrect'}`}>
        <div className="feedback-icon">
          {lastResult.correct ? '🎉' : '😞'}
        </div>
        <div className="feedback-text">
          {lastResult.correct ? 'BRAWO!' : 'NIE TYM RAZEM'}
        </div>
        <div className="feedback-points">
          +{lastResult.pointsEarned} punktów
        </div>
        <div style={{
          fontSize: '1.5rem', 
          marginTop: '1rem', 
          color: 'white',
          textAlign: 'center',
          opacity: 0.9
        }}>
          Poprawna odpowiedź:<br/>
          <strong>{String.fromCharCode(65 + lastResult.correctAnswer)}. {correctAnswer}</strong>
        </div>
      </div>
    );
  };

  return (
    <>
      {gameState === 'waiting' && renderWaiting()}
      {gameState === 'preparing' && renderPreparing()}
      {gameState === 'break' && renderBreak()}
      {(gameState === 'playing' && currentQuestion) && renderQuestion()}
      {(gameState === 'playing' && !currentQuestion) && (
        <div className="mobile-container">
          <div className="waiting-screen">
            <div>Gra w toku... Czekam na pytanie</div>
            <div style={{fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7}}>
              Stan: {gameState}
            </div>
          </div>
        </div>
      )}
      {gameState === 'answered' && renderQuestion()}
      {gameState === 'results' && currentQuestion && renderQuestion()}
      {gameState === 'results' && !currentQuestion && renderResults()}
      {gameState === 'finished' && renderFinished()}
      
      {/* Full-screen feedback overlay */}
      {showFeedback && renderFeedback()}
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinGame />} />
      <Route path="/join/:sessionId" element={<JoinGame />} />
      <Route path="/game/:sessionId" element={<Game />} />
    </Routes>
  );
}

export default App;