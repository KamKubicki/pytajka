import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import { pickLine, POOL_EMOTION, CATEGORY_POOLS } from '../hostLines';

// How chatty the host is: chance multiplier for "sometimes" comments, min gap between
// bubbles and the silence needed before a random interjection.
const FREQ = {
  rare: { chance: 0.45, gap: 6500, filler: [60000, 95000] },
  normal: { chance: 1, gap: 4000, filler: [28000, 48000] },
  often: { chance: 1.6, gap: 2800, filler: [15000, 26000] }
};

const P_FILLER = 0;
const P_LOW = 1;
const P_NORMAL = 2;
const P_HIGH = 3;
const P_REVEAL = 4; // answer reveal beats everything, incl. the hurry-up line

const HIGH_GAP = 2200; // reveal / round / final may follow a bit sooner
const SPEECH_EXTRA = 3500; // TTS may keep the bubble this much longer than its reading time
const SPEECH_START_TIMEOUT = 1500; // blocked speech (no user gesture yet) never fires any event
const MAX_QUEUE = 3;
const STREAK_MILESTONES = [3, 5, 7, 10];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const rand = (min, max) => min + Math.random() * (max - min);
const bubbleDuration = (text) => clamp(1800 + text.length * 45, 3000, 6000);
const isConnected = (p) => p && p.connected !== false;
const byScore = (a, b) => (b.score || 0) - (a.score || 0);
const fmtSeconds = (ms) => (ms / 1000).toFixed(1).replace('.', ',');

const speechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';

/** Best Polish voice: neural/premium first, then Google, slight preference for a male voice. */
const pickPolishVoice = () => {
  if (!speechSupported()) return null;
  let voices = [];
  try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { return null; }
  const pl = voices.filter(v => /^pl([-_]|$)/i.test(v.lang || ''));
  if (!pl.length) return null;
  const score = (v) => {
    const n = (v.name || '').toLowerCase();
    let s = 0;
    if (/natural|neural|premium|enhanced|wavenet|online/.test(n)) s += 5;
    if (/google/.test(n)) s += 3;
    if (/krzysztof|marek|jacek|adam|jan\b/.test(n)) s += 2;
    if (/pl-pl|pl_pl/i.test(v.lang || '')) s += 0.5;
    if (v.default) s += 0.2;
    return s;
  };
  return [...pl].sort((a, b) => score(b) - score(a))[0];
};

/**
 * Prof. Pytajek's brain: watches the game context, decides when to comment, keeps a small
 * priority queue (one bubble at a time, cooldown between bubbles) and optionally speaks via
 * the Web Speech API.
 */
function useHostCommentary({ settings, sound }) {
  const ctx = useContext(GameContext);
  const { gameState, players, currentQuestion, timer, showCorrectAnswer } = ctx;

  const [bubble, setBubble] = useState(null); // { id, text, emotion }
  const [speaking, setSpeaking] = useState(false);
  const [entranceKey, setEntranceKey] = useState(0);

  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const qKey = currentQuestion ? String(currentQuestion.id ?? currentQuestion.question ?? '') : null;
  // phases in which a queued line still makes sense
  const phasesRef = useRef(new Set());
  phasesRef.current = new Set([gameState, qKey ? `q:${qKey}` : null].filter(Boolean));

  const queueRef = useRef([]);
  const currentRef = useRef(null);
  const lastEndRef = useRef(Date.now());
  const idRef = useRef(0);
  const hideTimerRef = useRef(null);
  const capTimerRef = useRef(null);
  const startTimerRef = useRef(null);
  const pumpTimerRef = useRef(null);
  const utteranceRef = useRef(null); // keep a reference – Chrome GCs unreferenced utterances
  const voiceRef = useRef(null);
  const flapListenersRef = useRef(new Set());
  const fillerDelayRef = useRef(rand(...FREQ.normal.filler) * 0.5);
  const aliveRef = useRef(true);

  const freq = () => FREQ[settingsRef.current?.frequency] || FREQ.normal;

  // ---------------------------------------------------------------- speech
  useEffect(() => {
    if (!speechSupported()) return undefined;
    const refresh = () => { voiceRef.current = pickPolishVoice(); };
    refresh();
    const synth = window.speechSynthesis;
    try { synth.addEventListener('voiceschanged', refresh); } catch (e) { /* old API */ }
    return () => {
      try { synth.removeEventListener('voiceschanged', refresh); } catch (e) { /* ignore */ }
    };
  }, []);

  const duck = useCallback((on) => {
    const fn = soundRef.current?.duckMusic;
    if (typeof fn === 'function') {
      try { fn(on); } catch (e) { /* ignore */ }
    }
  }, []);

  const stopSpeech = useCallback(() => {
    const u = utteranceRef.current;
    utteranceRef.current = null;
    if (u) {
      u.onend = null; u.onerror = null; u.onboundary = null; u.onstart = null;
    }
    if (speechSupported()) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
    setSpeaking(false);
    duck(false);
  }, [duck]);

  const emitFlap = useCallback(() => {
    flapListenersRef.current.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } });
  }, []);

  const subscribeFlap = useCallback((fn) => {
    flapListenersRef.current.add(fn);
    return () => flapListenersRef.current.delete(fn);
  }, []);

  // ---------------------------------------------------------------- queue
  const pumpRef = useRef(() => {});

  const finish = useCallback((id) => {
    const cur = currentRef.current;
    if (!cur || cur.id !== id) return;
    clearTimeout(hideTimerRef.current);
    clearTimeout(capTimerRef.current);
    clearTimeout(startTimerRef.current);
    if (utteranceRef.current) stopSpeech();
    currentRef.current = null;
    lastEndRef.current = Date.now();
    if (aliveRef.current) setBubble(null);
    pumpRef.current();
  }, [stopSpeech]);

  const show = useCallback((item) => {
    clearTimeout(hideTimerRef.current);
    clearTimeout(capTimerRef.current);
    clearTimeout(startTimerRef.current);
    if (utteranceRef.current) stopSpeech();

    const id = ++idRef.current;
    const cur = { ...item, id, shownAt: Date.now(), minDone: false, speechDone: true };
    currentRef.current = cur;
    setBubble({ id, text: item.text, emotion: item.emotion });

    const s = settingsRef.current || {};
    const voice = voiceRef.current;
    if (s.voice && !soundRef.current?.muted && voice && speechSupported()) {
      try {
        const u = new window.SpeechSynthesisUtterance(item.text);
        u.voice = voice;
        u.lang = voice.lang || 'pl-PL';
        u.pitch = 1.25;
        u.rate = 1.15;
        u.volume = 1;
        let started = false;
        const done = () => {
          if (utteranceRef.current !== u) return;
          utteranceRef.current = null;
          setSpeaking(false);
          duck(false);
          cur.speechDone = true;
          if (cur.minDone) finish(id);
        };
        u.onstart = () => {
          if (utteranceRef.current !== u) return;
          started = true;
          setSpeaking(true);
          duck(true);
        };
        u.onboundary = () => { if (utteranceRef.current === u) emitFlap(); };
        u.onend = done;
        u.onerror = done;
        utteranceRef.current = u;
        cur.speechDone = false;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        startTimerRef.current = setTimeout(() => {
          if (!started && utteranceRef.current === u) {
            stopSpeech();
            cur.speechDone = true;
            if (cur.minDone) finish(id);
          }
        }, SPEECH_START_TIMEOUT);
      } catch (e) {
        utteranceRef.current = null;
        cur.speechDone = true;
      }
    }

    hideTimerRef.current = setTimeout(() => {
      cur.minDone = true;
      // something important is waiting -> do not let a slow voice hold the floor
      if (cur.speechDone || queueRef.current.some(i => i.priority >= cur.priority)) finish(id);
    }, bubbleDuration(item.text));
    capTimerRef.current = setTimeout(() => finish(id), bubbleDuration(item.text) + SPEECH_EXTRA);
  }, [duck, emitFlap, finish, stopSpeech]);

  const pump = useCallback(() => {
    clearTimeout(pumpTimerRef.current);
    if (!aliveRef.current || currentRef.current) return;
    const now = Date.now();
    queueRef.current = queueRef.current.filter(i => i.expiresAt > now && (!i.phase || phasesRef.current.has(i.phase)));
    const next = queueRef.current[0];
    if (!next) return;
    const gap = next.priority >= P_HIGH ? Math.min(HIGH_GAP, freq().gap) : freq().gap;
    const wait = lastEndRef.current + gap - now;
    if (wait > 0) {
      pumpTimerRef.current = setTimeout(() => pumpRef.current(), wait + 20);
      return;
    }
    queueRef.current.shift();
    show(next);
  }, [show]);
  pumpRef.current = pump;

  /** Queue a line from `pool`. Returns true when something was queued. */
  const say = useCallback((pool, vars = {}, opts = {}) => {
    const { priority = P_NORMAL, phase = null, ttl = 5000, chance = 1, force = false } = opts;
    if (!aliveRef.current || !settingsRef.current?.enabled) return false;
    if (!force) {
      const mult = priority >= P_HIGH ? Math.max(freq().chance, 0.8) : freq().chance;
      if (Math.random() >= Math.min(1, chance * mult)) return false;
    }
    const text = pickLine(pool, vars);
    if (!text) return false;
    const now = Date.now();
    const item = {
      text,
      emotion: opts.emotion || POOL_EMOTION[pool] || 'idle',
      priority,
      phase,
      createdAt: now,
      expiresAt: now + ttl
    };

    const cur = currentRef.current;
    const shownFor = cur ? now - cur.shownAt : 0;
    if (cur && ((item.priority >= cur.priority + 2 && shownFor > 500) || (item.priority > cur.priority && shownFor > 900))) {
      // e.g. a reveal comment cuts an idle interjection (or a long-winded join line) short
      show(item);
      return true;
    }
    const q = [...queueRef.current, item].sort((a, b) => (b.priority - a.priority) || (a.createdAt - b.createdAt));
    queueRef.current = q.slice(0, MAX_QUEUE);
    if (cur && cur.minDone && item.priority >= cur.priority) {
      finish(cur.id); // only the voice was still talking – cut it, the line was readable
      return true;
    }
    pump();
    return queueRef.current.includes(item) || currentRef.current?.text === text;
  }, [pump, show]);

  // ---------------------------------------------------------------- lifecycle
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      clearTimeout(hideTimerRef.current);
      clearTimeout(capTimerRef.current);
    clearTimeout(startTimerRef.current);
      clearTimeout(pumpTimerRef.current);
      queueRef.current = [];
      currentRef.current = null;
      stopSpeech();
    };
  }, [stopSpeech]);

  // global mute / voice off -> stop talking immediately (bubble stays)
  useEffect(() => {
    if ((sound?.muted || !settings.voice) && utteranceRef.current) {
      const cur = currentRef.current;
      stopSpeech();
      if (cur) {
        cur.speechDone = true;
        if (cur.minDone) finish(cur.id);
      }
    }
  }, [sound?.muted, settings.voice, stopSpeech, finish]);

  // phase changed -> drop stale queued lines
  useEffect(() => { pump(); }, [gameState, qKey, pump]);

  // ---------------------------------------------------------------- triggers
  // players joining the lobby
  const knownIdsRef = useRef(null);
  useEffect(() => {
    const list = Array.isArray(players) ? players : [];
    if (knownIdsRef.current === null) {
      knownIdsRef.current = new Set(list.map(p => p.id));
      return;
    }
    if (gameState === 'lobby') {
      const fresh = list.filter(p => !knownIdsRef.current.has(p.id));
      if (fresh.length) {
        say('join', { name: fresh[fresh.length - 1].name }, {
          priority: P_NORMAL, phase: 'lobby', ttl: 7000, chance: list.length > 8 ? 0.5 : 0.9
        });
      }
    }
    list.forEach(p => knownIdsRef.current.add(p.id));
  }, [players, gameState, say]);

  // game phase transitions
  const prevStateRef = useRef(gameState);
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = gameState;
    if (prev === gameState) return;
    const c = ctxRef.current;

    if (prev === 'lobby' && gameState !== 'lobby') setEntranceKey(k => k + 1);

    if (gameState === 'starting') {
      const n = (c.players || []).filter(isConnected).length || (c.players || []).length;
      say('start', { n }, { priority: P_HIGH, ttl: 5000 });
    } else if (gameState === 'category-vote') {
      const round = c.voteData?.round || 1;
      // round 1 is already introduced by the start line
      if (round > 1) say('voteStart', { round }, { priority: P_NORMAL, phase: 'category-vote', ttl: 5000, chance: 0.8 });
    } else if (gameState === 'category-result') {
      const r = c.voteData?.result || {};
      const catPool = CATEGORY_POOLS[r.key];
      const pool = catPool && Math.random() < 0.75 ? catPool : 'voteResult';
      say(pool, { category: r.name || 'ta kategoria' }, {
        priority: P_HIGH, ttl: 4500, emotion: Math.random() < 0.5 ? 'happy' : 'laugh'
      });
    } else if (gameState === 'round-end') {
      const list = [...(c.roundSummaryData?.players || c.players || [])].sort(byScore);
      if (list.length) {
        const round = c.roundSummaryData?.round ?? '';
        const leader = list[0].name;
        const last = list[list.length - 1].name;
        say(list.length === 1 ? 'roundEndSolo' : 'roundEnd', { round, leader, last }, {
          priority: P_HIGH, phase: 'round-end', ttl: 8000
        });
      }
    } else if (gameState === 'finished') {
      const list = [...(c.players || [])].sort(byScore);
      if (list.length) {
        say('finished', { winner: list[0].name }, { priority: P_HIGH, phase: 'finished', ttl: 8000 });
        if (list.length >= 3) {
          say('podium', { second: list[1].name, third: list[2].name }, {
            priority: P_NORMAL, phase: 'finished', ttl: 30000, force: true
          });
        }
      }
    }
  }, [gameState, say]);

  // new question (sometimes)
  const lastQRef = useRef(null);
  useEffect(() => {
    if (gameState !== 'question' || !qKey || showCorrectAnswer) return;
    if (lastQRef.current === qKey) return;
    lastQRef.current = qKey;
    const m = ctxRef.current.questionMeta || {};
    const phase = `q:${qKey}`;
    if (m.totalQuestions > 1 && m.questionNumber === m.totalQuestions) {
      say('lastQuestion', {}, { priority: P_NORMAL, phase, ttl: 4000 });
    } else if (m.questionInRound !== 1) {
      // the first question of a round follows the category comment - keep quiet then
      say('newQuestion', { n: m.questionNumber || '' }, { priority: P_LOW, phase, ttl: 3000, chance: 0.3 });
    }
  }, [gameState, qKey, showCorrectAnswer, say]);

  // last 5 seconds – hurry up
  const hurryRef = useRef(null);
  useEffect(() => {
    if (gameState !== 'question' || showCorrectAnswer || !qKey || timer !== 5) return;
    if (hurryRef.current === qKey) return;
    hurryRef.current = qKey;
    const c = ctxRef.current;
    const connected = (c.players || []).filter(isConnected);
    const done = c.answeredIds instanceof Set ? c.answeredIds : new Set();
    const waiting = connected.filter(p => !done.has(p.id));
    if (!waiting.length) return;
    const phase = `q:${qKey}`;
    if (waiting.length <= 2 && connected.length >= 3 && Math.random() < 0.6) {
      say('hurryName', { name: waiting[Math.floor(Math.random() * waiting.length)].name }, { priority: P_HIGH, phase, ttl: 3000, chance: 0.8 });
    } else {
      say('hurry', {}, { priority: P_HIGH, phase, ttl: 3000, chance: 0.6 });
    }
  }, [gameState, showCorrectAnswer, qKey, timer, say]);

  // reveal: nobody / everybody / only one / fastest + leader change + streaks
  const revealRef = useRef(null);
  const streaksRef = useRef(new Map()); // id -> { hit, miss }
  const leaderRef = useRef(null); // id of the current sole leader
  useEffect(() => {
    if (!showCorrectAnswer || !qKey || revealRef.current === qKey) return;
    revealRef.current = qKey;
    const c = ctxRef.current;
    const all = Array.isArray(c.players) ? c.players : [];
    const participants = all.filter(isConnected);
    if (!participants.length) return;
    const phase = `q:${qKey}`;
    const n = participants.length;
    const hits = participants.filter(p => p.lastCorrect);
    const answered = participants.filter(p => p.lastAnswer !== null && p.lastAnswer !== undefined);

    // streaks (counted on the TV)
    const streaks = streaksRef.current;
    all.forEach(p => {
      const s = streaks.get(p.id) || { hit: 0, miss: 0 };
      if (p.lastCorrect) { s.hit += 1; s.miss = 0; } else { s.miss += 1; s.hit = 0; }
      streaks.set(p.id, s);
    });
    const streakHero = participants
      .filter(p => STREAK_MILESTONES.includes(streaks.get(p.id)?.hit))
      .sort((a, b) => streaks.get(b.id).hit - streaks.get(a.id).hit)[0];
    const missers = n >= 2 ? participants.filter(p => streaks.get(p.id)?.miss === 3) : [];
    const missHero = missers[Math.floor(Math.random() * missers.length)];

    // leader change (only a clear, sole leader counts)
    const sorted = [...all].sort(byScore);
    let leaderChange = null;
    if (sorted.length >= 2 && (sorted[0].score || 0) > (sorted[1].score || 0)) {
      const prevId = leaderRef.current;
      if (prevId && prevId !== sorted[0].id) {
        const prevPlayer = all.find(p => p.id === prevId);
        leaderChange = { name: sorted[0].name, prev: prevPlayer?.name || 'poprzedni lider' };
      }
      leaderRef.current = sorted[0].id;
    }

    const timeLimit = c.questionMeta?.timeLimit || 15;
    const allFast = n >= 2 && answered.length === n && Number(c.timer) > timeLimit / 2;
    const fastest = hits
      .filter(p => Number.isFinite(p.lastResponseTime))
      .reduce((best, p) => (!best || p.lastResponseTime < best.lastResponseTime ? p : best), null);

    const candidates = [];
    if (hits.length === 0) candidates.push(['noneCorrect', {}]);
    else if (hits.length === n && n >= 2) candidates.push(['allCorrect', {}]);
    else if (hits.length === 1 && n >= 3) candidates.push(['onlyOne', { name: hits[0].name }]);
    const special = candidates.length > 0;
    if (streakHero) candidates.push(['streak', { name: streakHero.name, n: streaks.get(streakHero.id).hit }]);
    if (leaderChange) candidates.push(['leaderChange', leaderChange]);
    if (!special) {
      if (allFast && Math.random() < 0.5) candidates.push(['allFast', {}]);
      if (fastest && Math.random() < 0.65) candidates.push(['fastest', { name: fastest.name, time: fmtSeconds(fastest.lastResponseTime) }]);
      else candidates.push(['mixed', { hits: hits.length, total: n }]);
    }
    if (missHero) candidates.push(['missStreak', { name: missHero.name }]);

    const [first, second] = candidates;
    if (first) {
      const chance = special || first[0] === 'streak' || first[0] === 'leaderChange' ? 1 : 0.7;
      say(first[0], first[1], { priority: P_REVEAL, phase, ttl: 6500, chance });
    }
    if (second && (special || second[0] !== 'mixed')) {
      say(second[0], second[1], { priority: P_NORMAL, phase, ttl: 9000, chance: 0.75 });
    }
  }, [showCorrectAnswer, qKey, say]);

  // random interjections in silence
  useEffect(() => {
    const t = setInterval(() => {
      if (!aliveRef.current || !settingsRef.current?.enabled) return;
      if (currentRef.current || queueRef.current.length) return;
      const now = Date.now();
      if (now - lastEndRef.current < fillerDelayRef.current) return;
      const c = ctxRef.current;
      const limit = c.questionMeta?.timeLimit || 15;
      let pool = null;
      if (c.gameState === 'lobby') pool = Math.random() < 0.75 ? 'lobbyIdle' : 'filler';
      else if (c.gameState === 'category-vote' && c.voteTimer > 5) pool = 'voteIdle';
      else if (c.gameState === 'question' && !c.showCorrectAnswer && c.timer > 7 && c.timer < limit - 2) {
        pool = Math.random() < 0.6 ? 'questionIdle' : 'filler';
      }
      if (!pool) return;
      fillerDelayRef.current = rand(...freq().filler);
      say(pool, {}, { priority: P_FILLER, phase: c.gameState, ttl: 2500, force: true });
    }, 1000);
    return () => clearInterval(t);
  }, [say]);

  // ---------------------------------------------------------------- emotion
  let baseEmotion = 'idle';
  if (gameState === 'question' && !showCorrectAnswer) baseEmotion = timer > 5 ? 'think' : 'idle';
  else if (gameState === 'finished') baseEmotion = 'dance';
  else if (gameState === 'round-end') baseEmotion = 'happy';
  const emotion = bubble?.emotion || baseEmotion;

  return { bubble, emotion, speaking, entranceKey, subscribeFlap };
}

export default useHostCommentary;
