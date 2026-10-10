import { useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { GameContext, EMPTY_VOTE } from '../contexts/GameContext.jsx';

const getBackendURL = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const currentHost = window.location.hostname;
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:3001`;
  }
  return 'http://localhost:3001';
};

const SOCKET_URL = getBackendURL();

/**
 * Socket.io wiring for the TV host.
 * `sound` is the single useSound() instance owned by App (so mute affects music too).
 */
function useSocket(sound) {
  const {
    setGameState,
    setPlayers,
    setSessionId,
    setQrCode,
    setJoinUrl,
    setCurrentQuestion,
    setQuestionMeta,
    setTimer,
    setShowCorrectAnswer,
    setAnsweredIds,
    setAnswerCount,
    setVoteData,
    setVoteTimer,
    setResultsData,
    setRoundSummaryData,
    setSocket,
    setTotalQuestionCount,
    setGameSettings
  } = useContext(GameContext);

  const soundRef = useRef(sound);
  soundRef.current = sound;

  const timerIntervalRef = useRef(null);
  const voteIntervalRef = useRef(null);
  const leaderboardTimeoutRef = useRef(null);
  const sessionIdRef = useRef(null);
  const rejoinPendingRef = useRef(false);
  const playerCountRef = useRef(0);
  const voteTotalRef = useRef(0);

  useEffect(() => {
    const play = (type) => {
      const fn = soundRef.current?.playSound;
      if (typeof fn === 'function') {
        try { fn(type); } catch (e) { /* sound is never critical */ }
      }
    };

    const clearTimers = () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (voteIntervalRef.current) {
        clearInterval(voteIntervalRef.current);
        voteIntervalRef.current = null;
      }
      if (leaderboardTimeoutRef.current) {
        clearTimeout(leaderboardTimeoutRef.current);
        leaderboardTimeoutRef.current = null;
      }
    };

    // Deadline based countdown - robust against throttled intervals
    const startCountdown = (ref, seconds, setValue, onSecond) => {
      if (ref.current) clearInterval(ref.current);
      const endAt = Date.now() + seconds * 1000;
      let last = Math.ceil(seconds);
      setValue(last);
      ref.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        if (remaining !== last) {
          last = remaining;
          setValue(remaining);
          if (onSecond) onSecond(remaining);
        }
        if (remaining <= 0) {
          clearInterval(ref.current);
          ref.current = null;
        }
      }, 200);
    };

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
        rejoinPendingRef.current = true;
        socket.emit('host-join', { sessionId: sessionIdRef.current });
        return;
      }
      createGameSession(socket);
    });

    socket.on('join-error', (data) => {
      // Session no longer exists on the backend (e.g. backend restart) - start fresh
      console.warn('Host join error:', data?.message);
      if (!rejoinPendingRef.current) return;
      rejoinPendingRef.current = false;
      sessionIdRef.current = null;
      clearTimers();
      playerCountRef.current = 0;
      setGameState('lobby');
      setPlayers([]);
      setCurrentQuestion(null);
      createGameSession(socket);
    });

    socket.on('error', (data) => {
      console.warn('Server error:', data?.message);
    });

    socket.on('host-joined', () => {
      rejoinPendingRef.current = false;
    });

    socket.on('player-list-updated', (data) => {
      const list = Array.isArray(data?.players) ? data.players : [];
      if (list.length > playerCountRef.current) play('player-join');
      playerCountRef.current = list.length;
      setPlayers(list);
    });

    // Only who answered - the answer itself is never stored on the TV
    socket.on('player-answer-realtime', (data) => {
      if (!data?.playerId) return;
      setAnsweredIds(prev => {
        if (prev.has(data.playerId)) return prev;
        const next = new Set(prev);
        next.add(data.playerId);
        return next;
      });
      setAnswerCount(prev => ({
        total: Number.isFinite(data.totalAnswers) ? data.totalAnswers : prev.total,
        players: Number.isFinite(data.totalPlayers) ? data.totalPlayers : prev.players
      }));
      play('answer-submit');
    });

    socket.on('game-started', () => {
      // Immediate feedback (and no double start) until the first vote/question arrives
      setGameState(prev => (prev === 'lobby' ? 'starting' : prev));
      play('game-start');
    });

    socket.on('category-vote-start', (data = {}) => {
      clearTimers();
      const duration = Number.isFinite(data.duration) ? data.duration : 10;
      setVoteData({
        ...EMPTY_VOTE,
        round: data.round ?? null,
        totalRounds: data.totalRounds ?? null,
        duration,
        options: Array.isArray(data.options) ? data.options : []
      });
      voteTotalRef.current = 0;
      setGameState('category-vote');
      play('vote-start');
      startCountdown(voteIntervalRef, duration, setVoteTimer, (remaining) => {
        if (remaining > 0 && remaining <= 3) play('countdown-final');
      });
    });

    socket.on('category-vote-update', (data = {}) => {
      setVoteData(prev => ({
        ...prev,
        votes: data.votes || {},
        totalVotes: data.totalVotes ?? 0,
        totalPlayers: data.totalPlayers ?? prev.totalPlayers,
        votedPlayerIds: Array.isArray(data.votedPlayerIds) ? data.votedPlayerIds : prev.votedPlayerIds
      }));
      // Only when a new vote really arrived (reconnect re-sends the current state)
      const total = Number(data.totalVotes) || 0;
      if (total > voteTotalRef.current) play('vote-cast');
      voteTotalRef.current = total;
    });

    socket.on('category-vote-result', (data = {}) => {
      if (voteIntervalRef.current) {
        clearInterval(voteIntervalRef.current);
        voteIntervalRef.current = null;
      }
      setVoteTimer(0);
      setVoteData(prev => ({
        ...prev,
        round: data.round ?? prev.round,
        votes: data.votes || prev.votes,
        totalVotes: data.votes
          ? Object.values(data.votes).reduce((sum, n) => sum + (Number(n) || 0), 0)
          : prev.totalVotes,
        result: {
          key: data.categoryKey,
          name: data.name,
          icon: data.icon,
          color: data.color
        }
      }));
      setGameState('category-result');
      play('vote-result');
    });

    socket.on('new-question', (data = {}) => {
      clearTimers();
      const question = data.question || null;
      const timeLimit = Number.isFinite(data.timeLimit) && data.timeLimit > 0 ? data.timeLimit : 15;
      setCurrentQuestion(question);
      setQuestionMeta({
        round: data.round,
        totalRounds: data.totalRounds,
        questionNumber: data.questionNumber,
        totalQuestions: data.totalQuestions,
        questionInRound: data.questionInRound,
        questionsPerRound: data.questionsPerRound,
        timeLimit,
        roundCategory: data.roundCategory || (question?.category ? { name: question.category } : null)
      });
      setShowCorrectAnswer(false);
      setAnsweredIds(new Set());
      setAnswerCount({ total: 0, players: 0 });
      setGameState('question');
      play('question-start');

      startCountdown(timerIntervalRef, timeLimit, setTimer, (remaining) => {
        if (remaining <= 0) play('time-up');
        else if (remaining <= 3) play('countdown-final');
        else if (remaining <= 6) play('tick');
      });
    });

    socket.on('question-ended', (data = {}) => {
      clearTimers();
      // Backend strips `correct` from new-question, so take it from here
      setCurrentQuestion(prev => (prev ? { ...prev, correct: data.correctAnswer } : prev));
      setShowCorrectAnswer(true);
      if (Array.isArray(data.updatedPlayers)) {
        playerCountRef.current = data.updatedPlayers.length;
        setPlayers(data.updatedPlayers);
      }
      play('reveal');
    });

    socket.on('show-results-summary', (data) => {
      clearTimers();
      setResultsData(data);
      if (Array.isArray(data?.updatedPlayers)) setPlayers(data.updatedPlayers);
      setGameState('results-summary');
    });

    socket.on('round-end', (data = {}) => {
      clearTimers();
      setRoundSummaryData(data);
      if (Array.isArray(data.players)) {
        playerCountRef.current = data.players.length;
        setPlayers(data.players);
      }
      setGameState('round-end');
      play('drumroll');
      leaderboardTimeoutRef.current = setTimeout(() => {
        leaderboardTimeoutRef.current = null;
        play('leaderboard');
      }, 1500);
    });

    socket.on('game-finished', () => {
      clearTimers();
      setGameState('finished');
      play('game-over');
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
        const response = await fetch(`${SOCKET_URL}/api/session/create`, { method: 'POST' });
        const data = await response.json();
        sessionIdRef.current = data.sessionId;
        setSessionId(data.sessionId);

        const qrResponse = await fetch(`${SOCKET_URL}/api/session/${data.sessionId}/qr`);
        const qrData = await qrResponse.json();
        setQrCode(qrData.qrCode);
        setJoinUrl(qrData.joinUrl);

        await loadGameStats();

        socketToUse.emit('host-join', { sessionId: data.sessionId });
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };

    return () => {
      clearTimers();
      socket.close();
    };
  }, []);
}

export default useSocket;
