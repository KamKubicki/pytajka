import { useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { GameContext } from '../contexts/GameContext.jsx';
import useSound from './useSound';

const getBackendURL = () => {
  const currentHost = window.location.hostname;
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:3001`;
  }
  return 'http://localhost:3001';
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
    setRoundSummaryData,
    setSocket,
    setTotalQuestionCount,
    setGameSettings
  } = useContext(GameContext);

  const { playSound } = useSound();
  const timerIntervalRef = useRef(null);
  const prepareIntervalRef = useRef(null);
  const breakIntervalRef = useRef(null);
  const sessionIdRef = useRef(null);
  const rejoinPendingRef = useRef(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(socket);

    socket.on('connect', () => {
      // On reconnect re-attach to the existing session instead of creating a new one
      if (sessionIdRef.current) {
        console.log('Socket reconnected, rejoining session', sessionIdRef.current);
        rejoinPendingRef.current = true;
        socket.emit('host-join', { sessionId: sessionIdRef.current });
        return;
      }
      console.log('Socket connected, creating session...');
      createGameSession(socket);
    });

    socket.on('join-error', (data) => {
      // Session no longer exists on the backend (e.g. backend restart) - start fresh
      console.warn('Host join error:', data?.message);
      if (!rejoinPendingRef.current) return;
      rejoinPendingRef.current = false;
      sessionIdRef.current = null;
      [timerIntervalRef, prepareIntervalRef, breakIntervalRef].forEach(ref => {
        if (ref.current) {
          clearInterval(ref.current);
          ref.current = null;
        }
      });
      setGameState('lobby');
      setPlayers([]);
      setCurrentQuestion(null);
      createGameSession(socket);
    });

    socket.on('error', (data) => {
      console.warn('Server error:', data?.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('host-joined', (data) => {
      console.log('Host joined:', data);
      rejoinPendingRef.current = false;
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
      playSound('game-start');
    });

    socket.on('question-prepare', (data) => {
      setGameState('preparing');
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setPrepareTimer(5);

      // Clear previous interval if exists
      if (prepareIntervalRef.current) {
        clearInterval(prepareIntervalRef.current);
      }

      prepareIntervalRef.current = setInterval(() => {
        setPrepareTimer(prev => {
          if (prev <= 1) {
            clearInterval(prepareIntervalRef.current);
            prepareIntervalRef.current = null;
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

      // Clear previous timer interval if exists
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Keep the countdown in a local variable so sounds are not played
      // from inside a state updater (StrictMode double-invokes updaters)
      let remaining = 15;
      timerIntervalRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          remaining = 0;
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          playSound('time-up');
        } else if (remaining <= 4) {
          playSound('tick');
        }
        setTimer(remaining);
      }, 1000);
    });

    socket.on('question-ended', (data) => {
      // Clear timer when question ends
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Backend strips `correct` from new-question, so take it from here
      setCurrentQuestion(prev => (prev ? { ...prev, correct: data.correctAnswer } : prev));
      setShowCorrectAnswer(true);
      if (Array.isArray(data.updatedPlayers)) {
        setPlayers(data.updatedPlayers);
      }
      playSound('correct'); // Play reveal sound
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
      playSound('round-end');

      // Clear previous break interval if exists
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }

      breakIntervalRef.current = setInterval(() => {
        setBreakTimer(prev => {
          if (prev <= 1) {
            clearInterval(breakIntervalRef.current);
            breakIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('round-end', (data) => {
      setGameState('round-end');
      setRoundSummaryData(data);
    });

    socket.on('game-finished', () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
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
        sessionIdRef.current = data.sessionId;
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

    return () => {
      // Clean up all intervals on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (prepareIntervalRef.current) {
        clearInterval(prepareIntervalRef.current);
      }
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
      socket.close();
    };
  }, []);
}

export default useSocket;