import { useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { GameContext } from '../contexts/GameContext.jsx';

const getBackendURL = () => {
  const currentHost = window.location.hostname;
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:8001`;
  }
  return 'http://localhost:8001';
};

const SOCKET_URL = getBackendURL();

function useSocket() {
  const {
    setGameState,
    setPlayers,
    setSessionId,
    setQrCode,
    setJoinUrl,
    setLocalIP,
    setCurrentQuestion,
    setQuestionNumber,
    setTotalQuestions,
    setPrepareTimer,
    setTimer,
    setShowCorrectAnswer,
    setPlayerAnswers,
    setRealTimeAnswers,
    setBreakTimer,
    setResultsData,
    setSocket,
    setTotalQuestionCount,
    setGameSettings
  } = useContext(GameContext);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(socket);

    socket.on('connect', () => {
      console.log('Socket connected, creating session...');
      createGameSession(socket);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('host-joined', (data) => {
      console.log('Host joined:', data);
    });

    socket.on('player-list-updated', (data) => {
      setPlayers(data.players);
    });

    socket.on('player-answer', (data) => {
      setPlayerAnswers(prev => new Map(prev.set(data.playerId, data.answer)));
    });

    socket.on('player-answer-realtime', (data) => {
      setRealTimeAnswers(prev => new Map(prev.set(data.playerId, {
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatar: data.playerAvatar,
        answer: data.answer,
        timestamp: data.timestamp
      })));
    });

    socket.on('game-started', () => {
      setGameState('playing');
    });

    socket.on('question-prepare', (data) => {
      setGameState('preparing');
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setPrepareTimer(5);
      
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

    socket.on('new-question', (data) => {
      setCurrentQuestion(data.question);
      setGameState('question');
      setTimer(15);
      setShowCorrectAnswer(false);
      setPlayerAnswers(new Map());
      setRealTimeAnswers(new Map());
      
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

    socket.on('question-ended', (data) => {
      setShowCorrectAnswer(true);
      setPlayers(data.updatedPlayers);
    });

    socket.on('show-results-summary', (data) => {
      setGameState('results-summary');
      setResultsData(data);
    });

    socket.on('question-break', (data) => {
      setGameState('break');
      setQuestionNumber(data.nextQuestionNumber);
      setTotalQuestions(data.totalQuestions);
      setBreakTimer(5);
      
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

    socket.on('game-finished', () => {
      setGameState('finished');
    });

    const loadGameStats = async () => {
      try {
        const response = await fetch(`${SOCKET_URL}/api/questions/stats`);
        const data = await response.json();
        setTotalQuestionCount(data.totalQuestions);
        setGameSettings(data.gameSettings);
      } catch (error) {
        console.error('Error loading game stats:', error);
      }
    };

    const createGameSession = async (socketToUse) => {
      try {
        const response = await fetch(`${SOCKET_URL}/api/session/create`, {
          method: 'POST'
        });
        const data = await response.json();
        setSessionId(data.sessionId);
        
        const qrResponse = await fetch(`${SOCKET_URL}/api/session/${data.sessionId}/qr`);
        const qrData = await qrResponse.json();
        setQrCode(qrData.qrCode);
        setJoinUrl(qrData.joinUrl);
        setLocalIP(qrData.localIP);
        
        // Load game stats
        await loadGameStats();
        
        socketToUse.emit('host-join', { sessionId: data.sessionId });
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };

    return () => socket.close();
  }, []);
}

export default useSocket;