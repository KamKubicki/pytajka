import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import useSound from './hooks/useSound';

// Get backend URL from environment or detect IP
const getBackendURL = () => {
  // If running on mobile device, use the IP from URL
  const currentHost = window.location.hostname;
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:3001`;
  }
  return 'http://localhost:3001';
};

const SOCKET_URL = getBackendURL();

const avatars = ['🧑', '👩', '👨', '🧒', '👦', '👧', '🧓', '👴', '👵', '🤵', '👰', '🤖'];

// Karty dostępne podczas tury
const availableCards = [
  {
    id: 'double-points',
    name: 'Podwójne punkty',
    icon: '🔥',
    description: 'Podwój punkty za następną odpowiedź',
    type: 'self',
    category: 'power-up'
  },
  {
    id: 'steal-points',
    name: 'Kradzież punktów',
    icon: '💰',
    description: 'Ukradnij 50 punktów innemu graczowi',
    type: 'target',
    category: 'sabotage'
  },
  {
    id: 'timer-reduce',
    name: 'Skróć czas',
    icon: '⏱️',
    description: 'Zmniejsz czas odpowiedzi innym o 5 sekund',
    type: 'others',
    category: 'sabotage'
  },
  {
    id: 'eliminate-answer',
    name: 'Usuń odpowiedź',
    icon: '❌',
    description: 'Usuń jedną błędną odpowiedź z pytania',
    type: 'self',
    category: 'help'
  },
  {
    id: 'bet-correct',
    name: 'Obstaw poprawną',
    icon: '🎯',
    description: 'Obstaw kto odpowie poprawnie (+100 pkt jeśli trafisz)',
    type: 'target',
    category: 'bet'
  },
  {
    id: 'bet-wrong',
    name: 'Obstaw błędną',
    icon: '💥',
    description: 'Obstaw kto odpowie źle (+100 pkt jeśli trafisz)',
    type: 'target',
    category: 'bet'
  },
  {
    id: 'shuffle-answers',
    name: 'Pomieszaj odpowiedzi',
    icon: '🔀',
    description: 'Zmień kolejność odpowiedzi dla wybranego gracza',
    type: 'target',
    category: 'sabotage'
  },
  {
    id: 'extra-time',
    name: 'Dodatkowy czas',
    icon: '⏰',
    description: 'Daj sobie +10 sekund na następne pytanie',
    type: 'self',
    category: 'power-up'
  }
];

function JoinGame() {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(urlSessionId || '');
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Selfie states
  const [showCamera, setShowCamera] = useState(false);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // Camera functions
  const startCamera = async () => {
    try {
      console.log('Checking camera support...');
      console.log('navigator.mediaDevices:', !!navigator.mediaDevices);
      console.log('getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
      console.log('User agent:', navigator.userAgent);
      console.log('Protocol:', window.location.protocol);
      
      // Check if getUserMedia is supported (with fallbacks)
      let getUserMedia = null;
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      } else if (navigator.getUserMedia) {
        // Fallback for older browsers
        getUserMedia = (constraints) => {
          return new Promise((resolve, reject) => {
            navigator.getUserMedia(constraints, resolve, reject);
          });
        };
      } else if (navigator.webkitGetUserMedia) {
        // Webkit fallback
        getUserMedia = (constraints) => {
          return new Promise((resolve, reject) => {
            navigator.webkitGetUserMedia(constraints, resolve, reject);
          });
        };
      } else if (navigator.mozGetUserMedia) {
        // Firefox fallback
        getUserMedia = (constraints) => {
          return new Promise((resolve, reject) => {
            navigator.mozGetUserMedia(constraints, resolve, reject);
          });
        };
      }
      
      if (!getUserMedia) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        setError(`📱 Kamera nie jest obsługiwana

Na iPhone/iPad:
✅ Użyj Chrome zamiast Safari (najlepsze)
✅ Lub Firefox na iPhone
✅ Lub Opera

Safari nie obsługuje kamery bez HTTPS!`);
        return;
      }

      // Request camera permissions with explicit user activation
      console.log('Requesting camera access...');
      const mediaStream = await getUserMedia({
        video: { 
          facingMode: 'user',
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 }
        },
        audio: false
      });
      
      console.log('Camera access granted');
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => {
            console.error('Error playing video:', e);
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // More specific error messages
      if (error.name === 'NotAllowedError') {
        setError(`🚫 Dostęp do kamery zablokowany

Na iPhone:
• Chrome: Zezwól na dostęp do kamery (najlepsze)
• Firefox: Zezwól na dostęp do kamery  
• Safari: Nie obsługuje kamery bez HTTPS

W ustawieniach przeglądarki włącz dostęp do kamery.`);
      } else if (error.name === 'NotFoundError') {
        setError('📱 Nie znaleziono kamery w urządzeniu');
      } else if (error.name === 'NotSupportedError') {
        setError(`📱 Kamera nie obsługiwana

Na iPhone użyj Chrome zamiast Safari!`);
      } else {
        setError('Błąd dostępu do kamery: ' + error.message);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas size to create square avatar
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = 200;
      canvas.height = 200;
      
      // Calculate crop area for square
      const offsetX = (video.videoWidth - size) / 2;
      const offsetY = (video.videoHeight - size) / 2;
      
      // Save context for transformations
      context.save();
      
      // Flip horizontally to match video mirror effect
      context.scale(-1, 1);
      context.translate(-canvas.width, 0);
      
      // Draw video frame to canvas (cropped and scaled)
      context.drawImage(
        video,
        offsetX, offsetY, size, size,  // Source crop
        0, 0, canvas.width, canvas.height  // Destination
      );
      
      // Restore context
      context.restore();
      
      // Apply AI-style avatar effects
      processAvatarEffects(context, canvas.width, canvas.height);
      
      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelfiePhoto(dataUrl);
      setSelectedAvatar(dataUrl);
      stopCamera();
    }
  };

  // Local AI-style avatar processing without external APIs
  const processAvatarEffects = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply subtle cartoon/anime effect
    for (let i = 0; i < data.length; i += 4) {
      // Brighten and enhance colors slightly
      data[i] = Math.min(255, data[i] * 1.1);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green  
      data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
      
      // Increase contrast slightly
      data[i] = data[i] > 128 ? Math.min(255, data[i] * 1.05) : Math.max(0, data[i] * 0.95);
      data[i + 1] = data[i + 1] > 128 ? Math.min(255, data[i + 1] * 1.05) : Math.max(0, data[i + 1] * 0.95);
      data[i + 2] = data[i + 2] > 128 ? Math.min(255, data[i + 2] * 1.05) : Math.max(0, data[i + 2] * 0.95);
    }
    
    context.putImageData(imageData, 0, 0);
    
    // Add subtle circular vignette
    const gradient = context.createRadialGradient(
      width/2, height/2, 0,
      width/2, height/2, width/2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    
    context.globalCompositeOperation = 'overlay';
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'source-over';
    
    // Add subtle border glow
    context.shadowColor = 'rgba(255,215,0,0.3)';
    context.shadowBlur = 5;
    context.strokeStyle = 'rgba(255,255,255,0.3)';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(width/2, height/2, width/2 - 3, 0, Math.PI * 2);
    context.stroke();
    context.shadowBlur = 0;
  };

  const retakeSelfie = () => {
    setSelfiePhoto(null);
    startCamera();
  };

  const cancelSelfie = () => {
    setSelfiePhoto(null);
    stopCamera();
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
        <h1 className="game-title">❓ Pytajka</h1>
        
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
            
            {/* Selfie option */}
            <div
              className={`avatar-option selfie-option ${selectedAvatar && !avatars.includes(selectedAvatar) ? 'selected' : ''}`}
              onClick={startCamera}
            >
              📸
            </div>
            
            {/* Show captured selfie if available */}
            {selfiePhoto && (
              <div
                className={`avatar-option selfie-preview ${selectedAvatar === selfiePhoto ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(selfiePhoto)}
              >
                <img src={selfiePhoto} alt="Selfie" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
              </div>
            )}
          </div>
        </div>
        
        {/* Camera Modal */}
        {showCamera && (
          <div className="camera-modal">
            <div className="camera-container">
              <div className="camera-header">
                <h3>Zrób selfie 📸</h3>
                <button className="close-camera" onClick={cancelSelfie}>✕</button>
              </div>
              
              <div className="camera-view">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{display: 'none'}} />
              </div>
              
              <div className="camera-controls">
                <button className="capture-button" onClick={capturePhoto}>
                  📷 Zrób zdjęcie
                </button>
                <button className="cancel-button" onClick={cancelSelfie}>
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Selfie Preview Modal */}
        {selfiePhoto && !showCamera && selectedAvatar === selfiePhoto && (
          <div className="selfie-preview-modal">
            <div className="preview-container">
              <h3>Podgląd selfie</h3>
              <div className="preview-image">
                <img src={selfiePhoto} alt="Selfie preview" />
              </div>
              <div className="preview-controls">
                <button className="retake-button" onClick={retakeSelfie}>
                  🔄 Zrób ponownie
                </button>
                <button className="accept-button" onClick={() => {}}>  
                  ✅ Akceptuj
                </button>
              </div>
            </div>
          </div>
        )}

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
  const [gameState, setGameState] = useState('waiting'); // waiting, preparing, playing, answered, results, break, action-phase, turn
  const [playerData, setPlayerData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timer, setTimer] = useState(10);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [breakTimer, setBreakTimer] = useState(5);
  const [nextQuestionNumber, setNextQuestionNumber] = useState(2);

  const { playSound } = useSound();
  
  // Turn system states
  const [playerScores, setPlayerScores] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [turnPhase, setTurnPhase] = useState('question');
  const [availableActions, setAvailableActions] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [turnTimer, setTurnTimer] = useState(20);
  const [showTargetSelection, setShowTargetSelection] = useState(false);

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
          pointsEarned: updatedPlayer.lastPoints || 0,
          timeBonus: updatedPlayer.lastTimeBonus || 0,
          responseTime: updatedPlayer.lastResponseTime || 0
        });

        // Play sound based on correctness
        if (updatedPlayer.lastCorrect) {
          playSound('correct');
        } else {
          playSound('incorrect');
        }

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

    // Turn system event listeners
    newSocket.on('action-phase-start', (data) => {
      console.log('Action phase started:', data);
      setGameState('action-phase');
      setTurnPhase(data.phase);
      setPlayerScores(data.playerScores || []);
      
      // Reset turn states
      setSelectedCard(null);
      setSelectedTarget(null);
      setShowTargetSelection(false);
    });

    newSocket.on('turn-phase-start', (data) => {
      console.log('Turn phase started:', data);
      setGameState('turn');
      setTurnOrder(data.turnOrder);
      setCurrentTurnIndex(data.currentPlayerIndex);
      setTurnPhase('action');
      
      // Check if it's my turn
      const currentPlayer = data.turnOrder[data.currentPlayerIndex];
      const isMyTurnNow = currentPlayer && currentPlayer.playerId === playerData?.id;
      setIsMyTurn(isMyTurnNow);
      
      // Reset turn states
      setSelectedCard(null);
      setSelectedTarget(null);
      setShowTargetSelection(false);
      
      // Start turn timer if it's my turn
      if (isMyTurnNow) {
        setTurnTimer(20);
        const timerInterval = setInterval(() => {
          setTurnTimer(prev => {
            if (prev <= 1) {
              clearInterval(timerInterval);
              // Auto-skip turn when time runs out
              handleSkipTurn();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    });

    newSocket.on('turn-change', (data) => {
      console.log('Turn changed:', data);
      setCurrentTurnIndex(data.currentPlayerIndex);
      
      // Check if it's my turn
      const currentPlayer = turnOrder[data.currentPlayerIndex];
      setIsMyTurn(currentPlayer && currentPlayer.playerId === playerData?.id);
    });

    newSocket.on('action-taken', (data) => {
      console.log('Action taken:', data);
      // Handle action feedback if needed
    });

    newSocket.on('turn-skipped', (data) => {
      console.log('Turn skipped:', data);
      // Handle turn skip feedback if needed
    });

    return () => newSocket.close();
  }, [sessionId, navigate]);

  const handleAnswerSelect = (answerIndex) => {
    if (gameState === 'playing') {
      // Allow changing answer until time runs out
      setSelectedAnswer(answerIndex);
      playSound('answer-submit');

      socket.emit('player-answer', {
        sessionId,
        playerId: playerData.id,
        answer: answerIndex
      });
    }
  };

  const handleProposeTurnOrder = (proposedOrder) => {
    socket.emit('propose-turn-order', {
      sessionId,
      playerId: playerData.id,
      proposedOrder
    });
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    
    if (card.type === 'target') {
      setShowTargetSelection(true);
    } else if (card.type === 'self' || card.type === 'others') {
      // No target needed, can execute immediately
      setSelectedTarget(null);
    }
  };

  const handleTargetSelect = (target) => {
    setSelectedTarget(target);
    setShowTargetSelection(false);
  };

  const handleConfirmAction = () => {
    if (!selectedCard) return;
    
    const action = {
      cardId: selectedCard.id,
      type: selectedCard.type,
      category: selectedCard.category,
      target: selectedTarget
    };
    
    socket.emit('take-turn-action', {
      sessionId,
      playerId: playerData.id,
      action
    });
    
    // Reset states
    setSelectedCard(null);
    setSelectedTarget(null);
    setShowTargetSelection(false);
  };

  const handleCancelAction = () => {
    setSelectedCard(null);
    setSelectedTarget(null);
    setShowTargetSelection(false);
  };

  const handleSkipTurn = () => {
    socket.emit('skip-turn', {
      sessionId,
      playerId: playerData.id
    });
    
    // Reset states
    setSelectedCard(null);
    setSelectedTarget(null);
    setShowTargetSelection(false);
  };

  // Get other players for target selection
  const getOtherPlayers = () => {
    return turnOrder.filter(player => player.playerId !== playerData?.id);
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
        
        {lastResult.correct && lastResult.timeBonus > 0 && (
          <div className="time-bonus">
            ⚡ Bonus za czas: +{lastResult.timeBonus} pkt
          </div>
        )}
        
        {lastResult.responseTime && (
          <div className="response-time">
            ⏱️ Czas odpowiedzi: {(lastResult.responseTime / 1000).toFixed(1)}s
          </div>
        )}
        
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

  const renderActionPhase = () => (
    <div className="mobile-container">
      <div className="controller-screen">
        <div className="controller-header">
          <div className="player-info-mini">
            <span className="player-avatar-mini">{playerData.avatar}</span>
            <span className="player-name-mini">{playerData.name}</span>
            <span className="player-score-mini">{playerData.score} pkt</span>
          </div>
        </div>
        
        <div className="action-phase-content">
          <div className="action-title">⚔️ Faza Akcji</div>
          <div className="instruction">📺 Patrzcie na główny ekran!</div>
          <div className="action-instruction">
            Kolejność tur na podstawie wyników ostatniego pytania
          </div>
          
          <div className="player-scores-list">
            {playerScores.map((player, index) => (
              <div key={player.playerId} className="score-item">
                <span className="rank">#{index + 1}</span>
                <span className="player-avatar">{player.avatar}</span>
                <span className="player-name">{player.name}</span>
                <span className="points">+{player.lastPoints} pkt</span>
              </div>
            ))}
          </div>
          
          <div className="waiting-message">
            Za chwilę każdy gracz po kolei będzie mógł użyć kart...
          </div>
        </div>
      </div>
    </div>
  );

  const renderTurnPhase = () => {
    const currentPlayer = turnOrder[currentTurnIndex];
    
    if (!isMyTurn) {
      return (
        <div className="mobile-container">
          <div className="waiting-turn-screen">
            <div className="waiting-header">
              <div className="waiting-title">⏳ Oczekuj na swoją turę</div>
              <div className="current-player-info">
                <div className="player-avatar-large">{currentPlayer?.avatar}</div>
                <div className="player-name-large">{currentPlayer?.name}</div>
                <div className="turn-message">Wybiera swoją akcję...</div>
              </div>
            </div>
            
            <div className="turn-order-info">
              <div className="order-title">Kolejność kolejek:</div>
              <div className="order-list">
                {turnOrder.map((player, index) => (
                  <div 
                    key={player.playerId} 
                    className={`order-item ${index === currentTurnIndex ? 'current' : ''} ${index < currentTurnIndex ? 'completed' : ''}`}
                  >
                    <span className="player-avatar-small">{player.avatar}</span>
                    <span className="player-name-small">{player.name}</span>
                    {index === currentTurnIndex && <span className="indicator">👈</span>}
                    {index < currentTurnIndex && <span className="indicator">✅</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show target selection screen
    if (showTargetSelection && selectedCard) {
      return (
        <div className="mobile-container">
          <div className="target-selection-screen">
            <div className="target-header">
              <div className="main-title">Twoja tura — wybierz cel</div>
              <div className="timer-bar">
                <div className="timer-progress" style={{width: `${(turnTimer / 20) * 100}%`}}></div>
                <div className="timer-text">{turnTimer}s</div>
              </div>
            </div>

            <div className="player-info-header">
              <div className="player-avatar">{playerData.avatar}</div>
              <div className="player-name">{playerData.name}</div>
            </div>

            <div className="selected-card-info">
              <div className="card-icon">{selectedCard.icon}</div>
              <div className="card-name">{selectedCard.name}</div>
              <div className="card-description">{selectedCard.description}</div>
            </div>

            <div className="target-list">
              <div className="target-instruction">Wybierz cel akcji:</div>
              {getOtherPlayers().map((player) => (
                <button
                  key={player.playerId}
                  className={`target-button ${selectedTarget?.playerId === player.playerId ? 'selected' : ''}`}
                  onClick={() => handleTargetSelect(player)}
                >
                  <span className="target-avatar">{player.avatar}</span>
                  <span className="target-name">{player.name}</span>
                </button>
              ))}
            </div>

            <div className="action-buttons">
              <button 
                className="confirm-button" 
                onClick={handleConfirmAction}
                disabled={!selectedTarget}
              >
                Potwierdź
              </button>
              <button className="cancel-button" onClick={handleCancelAction}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Main turn screen - card selection
    return (
      <div className="mobile-container">
        <div className="my-turn-screen">
          <div className="turn-header">
            <div className="main-title">Twoja tura — wybierz akcję</div>
            <div className="timer-bar">
              <div className="timer-progress" style={{width: `${(turnTimer / 20) * 100}%`}}></div>
              <div className="timer-text">{turnTimer}s</div>
            </div>
          </div>

          <div className="player-info-header">
            <div className="player-avatar">{playerData.avatar}</div>
            <div className="player-name">{playerData.name}</div>
          </div>

          {selectedCard ? (
            // Card selected - show confirmation
            <div className="card-confirmation">
              <div className="selected-card-display">
                <div className="card-icon-large">{selectedCard.icon}</div>
                <div className="card-name-large">{selectedCard.name}</div>
                <div className="card-description-large">{selectedCard.description}</div>
              </div>

              <div className="action-buttons">
                <button className="confirm-button" onClick={handleConfirmAction}>
                  Potwierdź
                </button>
                <button className="cancel-button" onClick={handleCancelAction}>
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            // Show available cards
            <div className="cards-grid">
              {availableCards.map((card) => (
                <button
                  key={card.id}
                  className={`card-button ${card.category}`}
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="card-icon">{card.icon}</div>
                  <div className="card-name">{card.name}</div>
                  <div className="card-description">{card.description}</div>
                </button>
              ))}
              
              <button className="skip-button" onClick={handleSkipTurn}>
                <div className="card-icon">⏭️</div>
                <div className="card-name">Pomiń turę</div>
                <div className="card-description">Nie wykonuj żadnej akcji</div>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {gameState === 'waiting' && renderWaiting()}
      {gameState === 'preparing' && renderPreparing()}
      {gameState === 'break' && renderBreak()}
      {gameState === 'action-phase' && renderActionPhase()}
      {gameState === 'turn' && renderTurnPhase()}
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