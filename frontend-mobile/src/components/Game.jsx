import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import useSound from '../hooks/useSound';
import { SOCKET_URL } from '../config';
import QuestionScreen from './QuestionScreen';
import VoteScreen from './VoteScreen';
import SabotageOverlay from './SabotageOverlay';
import { SabotageDock, SabotageButton, SabotageSheet } from './SabotagePanel';
import { cardInfo, getMinigame } from '../sabotage/registry';
import {
  WaitingScreen,
  VoteResultScreen,
  FeedbackOverlay,
  RoundEndScreen,
  FinishedScreen
} from './InfoScreens';

const pid = (p) => p?.id ?? p?.playerId;

// Screens that show the sabotage card dock at the bottom
const DOCK_STATES = ['waiting', 'starting', 'voting', 'vote-result', 'round-end'];

// Players sorted by score (desc) with a normalised `id`
const toStandings = (players) =>
  (Array.isArray(players) ? players : [])
    .map(p => ({ ...p, id: pid(p) }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

export default function Game() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  // waiting | voting | vote-result | playing | answered | results | round-end | finished
  const [gameState, setGameState] = useState('waiting');
  const [playerData, setPlayerData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionMeta, setQuestionMeta] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timer, setTimer] = useState(15);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [connectionWarning, setConnectionWarning] = useState('');

  // Category voting
  const [vote, setVote] = useState(null);
  const [voteCounts, setVoteCounts] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [voteTimer, setVoteTimer] = useState(10);
  const [voteResult, setVoteResult] = useState(null);

  // Rankings
  const [standings, setStandings] = useState([]);
  const [roundEnded, setRoundEnded] = useState(null);

  // Sabotage
  const [players, setPlayers] = useState([]); // from player-list-updated
  const [cards, setCards] = useState([]); // card types in hand (max 2)
  const [sheet, setSheet] = useState(null); // null | { type }
  const [sabPending, setSabPending] = useState(false);
  const [obstacles, setObstacles] = useState([]); // queue: { id, type, fromName }

  // Refs used inside socket handlers (avoid stale closures) and for timer cleanup
  const playerIdRef = useRef(null);
  const questionTimerRef = useRef(null);
  const voteTimerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const navigateTimeoutRef = useRef(null);
  const rejoinRetryRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const showToastRef = useRef(null);
  const answerSentRef = useRef(false);
  const gameStateRef = useRef('waiting');
  const questionActiveRef = useRef(false); // set synchronously by new-question / question-ended
  const pendingIncomingRef = useRef([]); // sabotage-incoming that arrived before its question
  // { type, version, timedOut } while a sabotage-use awaits the server. It survives the
  // UI timeout so a late sabotage-used still knows whether the hand was refreshed.
  const sabPendingRef = useRef(null);
  const sabPendingTimeoutRef = useRef(null);
  const cardsVersionRef = useRef(0);
  const obstacleSeqRef = useRef(0);
  const lastHitSfxRef = useRef(0);

  const { playSound } = useSound();
  const playSoundRef = useRef(playSound);
  playSoundRef.current = playSound;

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    let playerName = location.state?.playerName;
    let avatar = location.state?.avatar;
    const sfx = (type) => playSoundRef.current?.(type);

    // Try to restore from localStorage if missing
    if (!playerName || !avatar) {
      const stored = localStorage.getItem(`game-${sessionId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          playerName = data.playerName;
          avatar = data.avatar;
        } catch (e) {
          localStorage.removeItem(`game-${sessionId}`);
        }
      }
    }

    if (!playerName || !avatar) {
      navigate(`/join/${sessionId}`);
      return;
    }

    // Store player data for reconnection
    try {
      localStorage.setItem(`game-${sessionId}`, JSON.stringify({ playerName, avatar }));
    } catch (e) {
      console.warn('Could not store player data:', e);
    }

    const clearTimer = (ref, fn = clearInterval) => {
      if (ref.current) {
        fn(ref.current);
        ref.current = null;
      }
    };
    // Countdown based on a deadline, so it stays correct when the phone
    // throttles timers (screen off / background tab).
    const startCountdown = (ref, setter, seconds, onDone, onTick) => {
      clearTimer(ref);
      const deadline = Date.now() + seconds * 1000;
      let last = seconds;
      setter(seconds);
      ref.current = setInterval(() => {
        const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        if (left !== last) {
          last = left;
          setter(left);
          if (onTick) onTick(left);
        }
        if (left <= 0) {
          clearTimer(ref);
          if (onDone) onDone();
        }
      }, 250);
    };
    const showToast = (msg, variant = '', ms = 3000) => {
      setToast({ msg, variant });
      clearTimer(toastTimeoutRef, clearTimeout);
      toastTimeoutRef.current = setTimeout(() => {
        toastTimeoutRef.current = null;
        setToast('');
      }, ms);
    };
    showToastRef.current = showToast;
    const hitSfx = () => {
      // sabotage-used + sabotage-incoming can land together – one sting is enough
      const now = Date.now();
      if (now - lastHitSfxRef.current < 1500) return;
      lastHitSfxRef.current = now;
      sfx('sabotage-hit');
    };
    const clearSabPending = () => {
      sabPendingRef.current = null;
      clearTimer(sabPendingTimeoutRef, clearTimeout);
      setSabPending(false);
    };
    // Only types with a playable minigame (or the mash fallback) become obstacles
    const toObstacles = (list) =>
      list
        .filter(s => s && getMinigame(s.type))
        .map(s => ({ id: ++obstacleSeqRef.current, type: s.type, fromName: s.fromName || '' }));
    let rejoinAttempts = 0;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Fallback for Safari
      forceNew: true,
      reconnection: true,
      timeout: 20000
    });
    setSocket(newSocket);

    const emitJoin = () => {
      newSocket.emit('player-join', {
        sessionId,
        playerName,
        avatar,
        // Lets the backend restore our player after a reconnect
        previousPlayerId: playerIdRef.current || undefined
      });
    };

    // (Re)join on every connect - after a reconnect (screen lock, Wi-Fi drop)
    // the server sees a brand new socket that is not in the game room.
    newSocket.on('connect', () => {
      setConnectionWarning('');
      emitJoin();
    });

    newSocket.on('disconnect', (reason) => {
      if (reason !== 'io client disconnect') {
        setConnectionWarning('Utracono połączenie – łączę ponownie…');
      }
    });

    newSocket.on('connect_error', () => {
      // Non-blocking: socket.io keeps retrying, don't replace the whole UI
      setConnectionWarning('Problem z połączeniem z serwerem – próbuję ponownie…');
    });

    newSocket.on('player-joined', (data) => {
      rejoinAttempts = 0;
      clearTimer(rejoinRetryRef, clearTimeout);
      const isRejoin = playerIdRef.current !== null;
      playerIdRef.current = data.playerId;
      setConnectionWarning('');
      setPlayerData(prev => (isRejoin && prev
        ? { ...prev, id: data.playerId }
        : { id: data.playerId, name: playerName, avatar, score: 0 }));
    });

    newSocket.on('join-error', (data) => {
      const message = data?.message || 'Nie udało się dołączyć do gry';
      // During a reconnect the server may still hold our old player entry
      // (until it notices the dead socket) -> name "taken". Retry for a while.
      if (playerIdRef.current && /zaj[eę]ta/i.test(message) && rejoinAttempts < 15) {
        rejoinAttempts++;
        setConnectionWarning('Wracam do gry…');
        clearTimer(rejoinRetryRef, clearTimeout);
        rejoinRetryRef.current = setTimeout(() => {
          rejoinRetryRef.current = null;
          if (newSocket.connected) emitJoin();
        }, 5000);
        return;
      }
      setError(playerIdRef.current ? `Utracono połączenie z grą: ${message}` : message);
      clearTimer(navigateTimeoutRef, clearTimeout);
      navigateTimeoutRef.current = setTimeout(() => navigate(`/join/${sessionId}`), 4000);
    });

    newSocket.on('error', (data) => {
      if (sabPendingRef.current) {
        // Errors carry no event name: a pending throw is the most likely cause.
        // Still reset a vote highlight so a rejected vote can be cast again.
        clearSabPending();
        if (gameStateRef.current === 'voting') setMyVote(null);
        showToast(`😕 ${data?.message || 'Nie udało się rzucić karty'}`, 'bad');
        return;
      }
      // Only vote errors are relevant to the player (others are raw English backend strings)
      if (data?.message && gameStateRef.current === 'voting') {
        setMyVote(null);
        showToast('Nie udało się oddać głosu – spróbuj jeszcze raz');
      }
    });

    newSocket.on('player-list-updated', (data) => {
      if (Array.isArray(data?.players)) setPlayers(data.players);
    });

    newSocket.on('sabotage-cards', (data) => {
      cardsVersionRef.current++;
      setCards(Array.isArray(data?.cards) ? data.cards.filter(Boolean) : []);
    });

    newSocket.on('sabotage-used', (data) => {
      const me = playerIdRef.current;
      if (!data || !me) return;
      const info = cardInfo(data.type);
      if (data.fromPlayerId === me) {
        const pending = sabPendingRef.current;
        // Server didn't refresh our hand (yet) -> drop the used card locally
        if (!pending || pending.version === cardsVersionRef.current) {
          setCards(prev => {
            const i = prev.indexOf(data.type);
            return i === -1 ? prev : [...prev.slice(0, i), ...prev.slice(i + 1)];
          });
        }
        clearSabPending();
        setSheet(null);
        sfx('sabotage-send');
        showToast(`🎯 Trafiłeś! ${data.targetName || 'Ofiara'} dostaje ${info.icon} ${info.acc}`, 'sab');
      } else if (data.targetPlayerId === me) {
        hitSfx();
        showToast(`😈 ${data.fromName || 'Ktoś'} rzuca na Ciebie ${info.icon} ${info.acc}!`, 'hit', 3500);
      }
    });

    newSocket.on('sabotage-incoming', (data) => {
      const list = Array.isArray(data?.sabotages) ? data.sabotages : [];
      if (!list.length) return;
      if (questionActiveRef.current && !answerSentRef.current) {
        const items = toObstacles(list);
        if (!items.length) return;
        setSheet(null);
        setObstacles(prev => [...prev, ...items]);
        hitSfx();
      } else if (!questionActiveRef.current) {
        // Arrived before its question – play it once the question shows up
        pendingIncomingRef.current = [...pendingIncomingRef.current, ...list];
      }
    });

    newSocket.on('game-started', () => {
      // Old backend goes straight to questions, new one starts with a vote.
      setGameState(prev => (prev === 'waiting' ? 'starting' : prev));
    });

    newSocket.on('category-vote-start', (data) => {
      clearTimer(feedbackTimeoutRef, clearTimeout);
      setShowFeedback(false);
      pendingIncomingRef.current = [];
      setVote(data || {});
      setVoteCounts(null);
      setMyVote(null);
      setVoteResult(null);
      setGameState('voting');
      sfx('vote-start');
      startCountdown(voteTimerRef, setVoteTimer, Number(data?.duration) > 0 ? Number(data.duration) : 10);
    });

    newSocket.on('category-vote-update', (data) => {
      setVoteCounts(data || null);
    });

    newSocket.on('category-vote-result', (data) => {
      clearTimer(voteTimerRef);
      setVoteTimer(0);
      setVoteResult(data || {});
      setGameState('vote-result');
      sfx('vote-result');
    });

    newSocket.on('new-question', (data) => {
      if (!data?.question || !Array.isArray(data.question.answers)) return;
      clearTimer(feedbackTimeoutRef, clearTimeout);
      clearTimer(voteTimerRef);
      setShowFeedback(false);
      answerSentRef.current = false;
      questionActiveRef.current = true;
      const pendingObstacles = toObstacles(pendingIncomingRef.current);
      pendingIncomingRef.current = [];
      setObstacles(pendingObstacles);
      if (pendingObstacles.length) {
        setSheet(null);
        hitSfx();
      }
      const timeLimit = Number(data.timeLimit) > 0 ? Number(data.timeLimit) : 15;
      setCurrentQuestion(data.question);
      setQuestionMeta({
        round: data.round,
        totalRounds: data.totalRounds,
        questionNumber: data.questionNumber,
        totalQuestions: data.totalQuestions,
        questionInRound: data.questionInRound,
        questionsPerRound: data.questionsPerRound,
        roundCategory: data.roundCategory || null,
        timeLimit
      });
      setSelectedAnswer(null);
      setGameState('playing');
      setLastResult(null);
      sfx('question-start');

      // Start timer (previous one is cleared, so intervals never stack)
      startCountdown(questionTimerRef, setTimer, timeLimit, null, (left) => {
        if (left > 0 && left <= 3 && !answerSentRef.current) sfx('countdown-final');
      });
    });

    newSocket.on('question-ended', (data) => {
      clearTimer(questionTimerRef);
      setTimer(0);
      questionActiveRef.current = false;
      setObstacles([]);

      const players = Array.isArray(data?.updatedPlayers) ? data.updatedPlayers : [];
      if (players.length) setStandings(toStandings(players));

      // Find player by ID (socket ID changes after a reconnect)
      const socketId = newSocket.id;
      const updatedPlayer =
        players.find(p => playerIdRef.current && pid(p) === playerIdRef.current) ||
        players.find(p => p.socketId === socketId);

      const correctAnswer = data?.correctAnswer;
      if (updatedPlayer) {
        setPlayerData(prev => ({ ...prev, score: updatedPlayer.score }));
        const answer = updatedPlayer.lastAnswer ?? null;
        if (answer != null) setSelectedAnswer(prev => (prev == null ? answer : prev));
        setLastResult({
          correct: !!updatedPlayer.lastCorrect,
          correctAnswer,
          answer: answer ?? (answerSentRef.current ? -1 : null),
          pointsEarned: updatedPlayer.lastPoints || 0,
          timeBonus: updatedPlayer.lastTimeBonus || 0,
          responseTime: updatedPlayer.lastResponseTime || 0
        });

        sfx(updatedPlayer.lastCorrect ? 'correct' : 'incorrect');

        setShowFeedback(true);
        clearTimer(feedbackTimeoutRef, clearTimeout);
        feedbackTimeoutRef.current = setTimeout(() => {
          feedbackTimeoutRef.current = null;
          setShowFeedback(false);
        }, 2200);
      } else {
        setLastResult(correctAnswer != null ? { correct: false, correctAnswer, answer: null, pointsEarned: 0 } : null);
      }
      setGameState('results');
    });

    newSocket.on('round-end', (data) => {
      clearTimer(feedbackTimeoutRef, clearTimeout);
      setShowFeedback(false);
      const list = toStandings(data?.players);
      if (list.length) {
        setStandings(list);
        const me = list.find(p => p.id === playerIdRef.current);
        if (me) setPlayerData(prev => (prev ? { ...prev, score: me.score ?? prev.score } : prev));
      }
      setRoundEnded(data?.round ?? null);
      setGameState('round-end');
      sfx('round-end');
    });

    newSocket.on('game-finished', (data) => {
      questionActiveRef.current = false;
      pendingIncomingRef.current = [];
      setObstacles([]);
      setSheet(null);
      clearTimer(questionTimerRef);
      clearTimer(voteTimerRef);
      clearTimer(feedbackTimeoutRef, clearTimeout);
      setShowFeedback(false);
      const list = toStandings(data?.players);
      if (list.length) setStandings(list);
      setGameState('finished');
      sfx('game-over');
    });

    return () => {
      clearTimer(questionTimerRef);
      clearTimer(voteTimerRef);
      clearTimer(feedbackTimeoutRef, clearTimeout);
      clearTimer(navigateTimeoutRef, clearTimeout);
      clearTimer(rejoinRetryRef, clearTimeout);
      clearTimer(toastTimeoutRef, clearTimeout);
      clearTimer(sabPendingTimeoutRef, clearTimeout);
      newSocket.removeAllListeners();
      newSocket.close();
    };
  }, [sessionId, navigate]);

  const obstacleActive = gameState === 'playing' && timer > 0 && obstacles.length > 0;

  const handleAnswerSelect = (answerIndex) => {
    // Backend accepts only the FIRST answer per question, so lock after the
    // first tap instead of pretending the answer was changed.
    if (gameState !== 'playing' || answerSentRef.current || timer <= 0) return;
    if (obstacleActive) return; // sabotage minigame first
    if (!socket || !playerData) return;
    answerSentRef.current = true;
    setSelectedAnswer(answerIndex);
    setGameState('answered');
    playSound('answer-submit');
    if (navigator.vibrate) navigator.vibrate(30);

    socket.emit('player-answer', {
      sessionId,
      playerId: playerData.id,
      answer: answerIndex
    });
  };

  const handleVote = (categoryKey) => {
    if (gameStateRef.current !== 'voting' || voteTimer <= 0) return;
    if (!socket || !playerData || myVote === categoryKey) return;
    setMyVote(categoryKey);
    playSound('vote-cast');
    if (navigator.vibrate) navigator.vibrate(20);
    socket.emit('category-vote', { sessionId, playerId: playerData.id, categoryKey });
  };

  const handleObstacleDone = useCallback((id) => {
    setObstacles(prev => (prev[0]?.id === id ? prev.slice(1) : prev));
  }, []);

  const openSheet = (type = null) => {
    if (!cards.length) return;
    playSound('button-tap');
    setSheet({ type });
  };

  const handleThrow = (type, targetPlayerId) => {
    if (!socket || !playerData || (sabPendingRef.current && !sabPendingRef.current.timedOut)) return;
    if (!type || !targetPlayerId || !cards.includes(type)) return;
    sabPendingRef.current = { type, version: cardsVersionRef.current, timedOut: false };
    setSabPending(true);
    playSound('button-tap');
    if (navigator.vibrate) navigator.vibrate(20);
    socket.emit('sabotage-use', { sessionId, playerId: playerData.id, targetPlayerId, type });
    // No confirmation and no error -> unlock the button again
    if (sabPendingTimeoutRef.current) clearTimeout(sabPendingTimeoutRef.current);
    sabPendingTimeoutRef.current = setTimeout(() => {
      sabPendingTimeoutRef.current = null;
      if (!sabPendingRef.current) return;
      // Unlock the button only; keep the record for a late confirmation
      sabPendingRef.current.timedOut = true;
      setSabPending(false);
      showToastRef.current?.('Serwer nie odpowiada – spróbuj jeszcze raz', 'bad');
    }, 8000);
  };

  // Close the sheet once there is nothing left to throw
  useEffect(() => {
    if (sheet && !cards.length && !sabPending) setSheet(null);
  }, [sheet, cards, sabPending]);

  const goHome = () => {
    playSound('button-tap');
    navigate('/');
  };

  if (error) {
    return (
      <div className="screen screen--center">
        <div className="alert" role="alert">{error}</div>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => { playSound('button-tap'); navigate(`/join/${sessionId}`); }}
        >
          Wróć do dołączania
        </button>
      </div>
    );
  }

  const overlays = (
    <>
      {toast && <div className={`toast ${toast.variant ? `toast--${toast.variant}` : ''}`} role="alert">{toast.msg}</div>}
      {connectionWarning && <div className="conn-banner" role="status">{connectionWarning}</div>}
    </>
  );

  if (!playerData) {
    return (
      <>
        <div className="screen screen--center">
          <div className="waiting__msg">
            <span className="dots" aria-hidden="true"><i /><i /><i /></span>
            Dołączam do gry…
          </div>
        </div>
        {overlays}
      </>
    );
  }

  let content;
  switch (gameState) {
    case 'voting':
      content = (
        <VoteScreen
          player={playerData}
          vote={vote}
          counts={voteCounts}
          myVote={myVote}
          timer={voteTimer}
          onVote={handleVote}
        />
      );
      break;
    case 'vote-result':
      content = <VoteResultScreen player={playerData} result={voteResult} />;
      break;
    case 'playing':
    case 'answered':
    case 'results':
      content = currentQuestion ? (
        <QuestionScreen
          player={playerData}
          question={currentQuestion}
          meta={questionMeta}
          phase={gameState}
          selectedAnswer={selectedAnswer}
          lastResult={lastResult}
          timer={timer}
          onAnswer={handleAnswerSelect}
          obstructed={obstacleActive}
          headerExtra={<SabotageButton cards={cards} onOpen={() => openSheet(null)} />}
        />
      ) : (
        <WaitingScreen player={playerData} message="Czekamy na pytanie" />
      );
      break;
    case 'round-end':
      content = (
        <RoundEndScreen player={playerData} round={roundEnded} standings={standings} meId={playerData.id} />
      );
      break;
    case 'finished':
      content = <FinishedScreen player={playerData} standings={standings} meId={playerData.id} onNewGame={goHome} />;
      break;
    case 'starting':
      content = <WaitingScreen player={playerData} message="Gra startuje!" hint="Za chwilę głosowanie na kategorię" />;
      break;
    default:
      content = <WaitingScreen player={playerData} />;
  }

  // Dock with cards under the vote / waiting / ranking screens
  const showDock = cards.length > 0 && DOCK_STATES.includes(gameState);

  return (
    <>
      {showDock ? (
        <div className="with-dock">
          {content}
          <SabotageDock cards={cards} onPick={(type) => openSheet(type)} />
        </div>
      ) : content}
      {obstacleActive && (
        <SabotageOverlay
          key={obstacles[0].id}
          item={obstacles[0]}
          total={obstacles.length}
          answers={currentQuestion?.answers}
          timer={timer}
          onComplete={handleObstacleDone}
          playSound={playSound}
        />
      )}
      {showFeedback && <FeedbackOverlay result={lastResult} question={currentQuestion} />}
      {sheet && gameState !== 'finished' && !obstacleActive && (
        <SabotageSheet
          key={sheet.type || 'any'}
          cards={cards}
          initialType={sheet.type}
          players={players.length ? players : standings}
          meId={playerData.id}
          pending={sabPending}
          onThrow={handleThrow}
          onClose={() => setSheet(null)}
        />
      )}
      {overlays}
    </>
  );
}
