import { useRef, useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// SYNTH-START – game-show sound synthesis (WebAudio only, no audio files).
// Shared verbatim with frontend-mobile/src/hooks/useSound.js.
// ---------------------------------------------------------------------------

const MASTER_GAIN = 0.8;
const FLOOR = 0.0001; // exponential ramps can't touch 0

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

const noiseBuffers = new WeakMap();
function getNoiseBuffer(ctx) {
  let buf = noiseBuffers.get(ctx);
  if (!buf) {
    const len = Math.floor(ctx.sampleRate * 2);
    buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buf);
  }
  return buf;
}

// Disconnect the whole chain once the source has finished (no node leaks).
function cleanupOnEnd(src, nodes) {
  src.onended = () => {
    for (const n of nodes) {
      try { n.disconnect(); } catch (e) { /* already disconnected */ }
    }
  };
}

// ADSR on a gain AudioParam; returns the time the envelope reaches silence.
function applyEnvelope(param, t, peak, env = {}) {
  const { attack = 0.005, decay = 0.1, sustain = 0, hold = 0, release = 0.08 } = env;
  const a = t + attack;
  const d = a + decay;
  const s = Math.max(peak * sustain, FLOOR);
  param.setValueAtTime(FLOOR, t);
  param.linearRampToValueAtTime(Math.max(peak, FLOOR), a);
  param.exponentialRampToValueAtTime(s, d);
  const relStart = Math.max(d, t + hold);
  if (relStart > d) param.setValueAtTime(s, relStart);
  const end = relStart + release;
  param.exponentialRampToValueAtTime(FLOOR, end);
  return end;
}

function applyFilter(ctx, t, filter) {
  const f = ctx.createBiquadFilter();
  f.type = filter.type || 'lowpass';
  f.Q.value = filter.Q ?? 0.8;
  f.frequency.setValueAtTime(filter.sweep ? filter.sweep.from : (filter.freq ?? 2000), t);
  if (filter.sweep) {
    f.frequency.exponentialRampToValueAtTime(filter.sweep.to, t + filter.sweep.time);
  }
  return f;
}

// One oscillator voice: osc -> [filter] -> envelope gain -> dest
function voice(ctx, dest, {
  freq, type = 'sine', t, peak = 0.2, env, detune = 0, glide, filter,
}) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide.to, t + glide.time);
  if (detune) osc.detune.setValueAtTime(detune, t);
  const g = ctx.createGain();
  const nodes = [osc, g];
  let head = osc;
  if (filter) {
    const f = applyFilter(ctx, t, filter);
    head.connect(f);
    head = f;
    nodes.push(f);
  }
  head.connect(g);
  g.connect(dest);
  const end = applyEnvelope(g.gain, t, peak, env);
  osc.start(t);
  osc.stop(end + 0.02);
  cleanupOnEnd(osc, nodes);
  return end;
}

// Filtered noise burst: noise -> filter -> envelope gain -> dest
function noise(ctx, dest, { t, peak = 0.2, env, filter = { type: 'highpass', freq: 1000 } }) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  src.loop = true;
  const f = applyFilter(ctx, t, filter);
  const g = ctx.createGain();
  src.connect(f);
  f.connect(g);
  g.connect(dest);
  const end = applyEnvelope(g.gain, t, peak, env);
  src.start(t, Math.random() * 1.5);
  src.stop(end + 0.02);
  cleanupOnEnd(src, [src, f, g]);
  return end;
}

// ---- instruments ----------------------------------------------------------

function brass(ctx, dest, note, t, dur, peak = 0.12) {
  const freq = midi(note);
  const env = { attack: 0.03, decay: 0.15, sustain: 0.7, hold: dur, release: 0.18 };
  const filter = { type: 'lowpass', Q: 1.2, sweep: { from: freq * 1.5, to: Math.min(freq * 7, 12000), time: 0.07 } };
  voice(ctx, dest, { freq, type: 'sawtooth', t, peak, env, detune: -7, filter });
  voice(ctx, dest, { freq, type: 'sawtooth', t, peak: peak * 0.8, env, detune: 7, filter });
}

function brassChord(ctx, dest, notes, t, dur, peak = 0.22) {
  const each = peak / notes.length;
  notes.forEach((n) => brass(ctx, dest, n, t, dur, each));
}

function bell(ctx, dest, note, t, peak = 0.08, len = 0.8) {
  const freq = midi(note);
  voice(ctx, dest, { freq, type: 'sine', t, peak, env: { attack: 0.002, decay: len, release: 0.1 } });
  voice(ctx, dest, { freq: freq * 2.76, type: 'sine', t, peak: peak * 0.35, env: { attack: 0.002, decay: len * 0.4, release: 0.05 } });
}

function pluck(ctx, dest, note, t, peak = 0.15, len = 0.25, type = 'triangle') {
  voice(ctx, dest, {
    freq: midi(note), type, t, peak,
    env: { attack: 0.004, decay: len, release: 0.05 },
    filter: { type: 'lowpass', freq: 2500, Q: 0.7 },
  });
}

function pad(ctx, dest, notes, t, dur, peak = 0.12) {
  const each = peak / notes.length;
  notes.forEach((n) => {
    voice(ctx, dest, {
      freq: midi(n), type: 'triangle', t, peak: each,
      env: { attack: Math.min(0.4, dur / 3), decay: 0.2, sustain: 0.8, hold: dur, release: 0.4 },
      filter: { type: 'lowpass', freq: 1400, Q: 0.5 },
    });
  });
}

function kick(ctx, dest, t, peak = 0.6) {
  voice(ctx, dest, {
    freq: 160, type: 'sine', t, peak,
    glide: { to: 42, time: 0.12 }, env: { attack: 0.002, decay: 0.28, release: 0.05 },
  });
}

function snare(ctx, dest, t, peak = 0.25) {
  noise(ctx, dest, { t, peak, env: { attack: 0.001, decay: 0.12, release: 0.04 }, filter: { type: 'highpass', freq: 1200 } });
  voice(ctx, dest, { freq: 190, type: 'triangle', t, peak: peak * 0.6, env: { attack: 0.001, decay: 0.06, release: 0.02 } });
}

function hat(ctx, dest, t, peak = 0.08) {
  noise(ctx, dest, { t, peak, env: { attack: 0.001, decay: 0.035, release: 0.01 }, filter: { type: 'highpass', freq: 7500 } });
}

function crash(ctx, dest, t, peak = 0.18, len = 1.4) {
  noise(ctx, dest, { t, peak, env: { attack: 0.002, decay: len, release: 0.2 }, filter: { type: 'highpass', freq: 4500, Q: 0.5 } });
}

function whoosh(ctx, dest, t, dur = 0.45, peak = 0.22, up = true) {
  noise(ctx, dest, {
    t, peak,
    env: { attack: dur * 0.75, decay: 0.05, sustain: 0.6, hold: dur * 0.75, release: dur * 0.25 },
    filter: { type: 'bandpass', Q: 1.8, sweep: up ? { from: 300, to: 5000, time: dur } : { from: 5000, to: 300, time: dur } },
  });
}

function boom(ctx, dest, t, peak = 0.7) {
  voice(ctx, dest, { freq: 95, type: 'sine', t, peak, glide: { to: 30, time: 0.9 }, env: { attack: 0.004, decay: 1.1, release: 0.2 } });
  noise(ctx, dest, { t, peak: peak * 0.3, env: { attack: 0.002, decay: 0.4, release: 0.1 }, filter: { type: 'lowpass', freq: 300 } });
}

function drumroll(ctx, dest, t, dur = 2, from = 0.03, to = 0.28) {
  const step = 0.034;
  const n = Math.floor(dur / step);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const p = from + (to - from) * k * k;
    noise(ctx, dest, {
      t: t + i * step + (i % 2 ? 0.004 : 0),
      peak: p * (i % 2 ? 0.8 : 1),
      env: { attack: 0.001, decay: 0.05, release: 0.02 },
      filter: { type: 'bandpass', freq: 2500, Q: 0.6 },
    });
  }
  return t + n * step;
}

// ---- sound effects ---------------------------------------------------------
// Each receives (ctx, out, t) where t is the start time.

const SOUNDS = {
  correct: (ctx, out, t) => {
    [72, 76, 79].forEach((n, i) => pluck(ctx, out, n, t + i * 0.07, 0.16, 0.18, 'square'));
    brassChord(ctx, out, [72, 76, 79, 84], t + 0.21, 0.35, 0.3);
    bell(ctx, out, 96, t + 0.21, 0.06, 0.6);
    bell(ctx, out, 91, t + 0.3, 0.04, 0.5);
  },
  incorrect: (ctx, out, t) => {
    [0, 0.3].forEach((dt) => {
      [130, 137].forEach((f) => voice(ctx, out, {
        freq: f, type: 'sawtooth', t: t + dt, peak: 0.16,
        env: { attack: 0.01, decay: 0.05, sustain: 0.9, hold: 0.22, release: 0.05 },
        filter: { type: 'lowpass', freq: 1300, Q: 1 },
      }));
    });
  },
  tick: (ctx, out, t) => {
    voice(ctx, out, { freq: 1250, type: 'triangle', t, peak: 0.12, env: { attack: 0.001, decay: 0.045, release: 0.01 } });
    hat(ctx, out, t, 0.05);
  },
  'countdown-final': (ctx, out, t) => {
    voice(ctx, out, {
      freq: 1760, type: 'square', t, peak: 0.08,
      env: { attack: 0.001, decay: 0.09, release: 0.02 }, filter: { type: 'lowpass', freq: 3500 },
    });
    voice(ctx, out, { freq: 880, type: 'sine', t, peak: 0.12, env: { attack: 0.001, decay: 0.12, release: 0.02 } });
    kick(ctx, out, t, 0.45);
  },
  'time-up': (ctx, out, t) => {
    [45, 46, 52].forEach((n) => voice(ctx, out, {
      freq: midi(n), type: 'sawtooth', t, peak: 0.12,
      env: { attack: 0.01, decay: 0.2, sustain: 0.7, hold: 0.6, release: 0.3 },
      filter: { type: 'lowpass', Q: 2, sweep: { from: 2500, to: 350, time: 0.9 } },
    }));
    boom(ctx, out, t, 0.5);
    crash(ctx, out, t, 0.12, 0.8);
  },
  'round-end': (ctx, out, t) => {
    [0, 0.12, 0.24].forEach((dt) => { brass(ctx, out, 67, t + dt, 0.07, 0.12); snare(ctx, out, t + dt, 0.12); });
    brassChord(ctx, out, [60, 64, 67, 72], t + 0.36, 0.6, 0.32);
    kick(ctx, out, t + 0.36, 0.5);
    crash(ctx, out, t + 0.36, 0.15);
  },
  'game-start': (ctx, out, t) => {
    whoosh(ctx, out, t, 0.55, 0.2);
    const hit = t + 0.55;
    boom(ctx, out, hit, 0.6);
    brassChord(ctx, out, [48, 55, 60, 64, 67], hit, 0.8, 0.35);
    crash(ctx, out, hit, 0.18);
    [84, 88, 91, 96].forEach((n, i) => bell(ctx, out, n, hit + 0.1 + i * 0.06, 0.04, 0.5));
  },
  'answer-submit': (ctx, out, t) => {
    voice(ctx, out, { freq: 660, type: 'sine', t, peak: 0.2, glide: { to: 990, time: 0.06 }, env: { attack: 0.003, decay: 0.15, release: 0.03 } });
    bell(ctx, out, 88, t + 0.05, 0.05, 0.3);
  },
  'player-join': (ctx, out, t) => {
    voice(ctx, out, { freq: 280, type: 'sine', t, peak: 0.25, glide: { to: 840, time: 0.08 }, env: { attack: 0.002, decay: 0.12, release: 0.03 } });
    bell(ctx, out, 91, t + 0.06, 0.06, 0.35);
  },
  'vote-start': (ctx, out, t) => {
    brassChord(ctx, out, [65, 69, 72], t, 0.14, 0.22);
    snare(ctx, out, t, 0.12);
    brassChord(ctx, out, [67, 71, 74], t + 0.22, 0.14, 0.22);
    snare(ctx, out, t + 0.22, 0.14);
    brassChord(ctx, out, [72, 76, 79, 84], t + 0.44, 0.55, 0.3);
    kick(ctx, out, t + 0.44, 0.5);
    crash(ctx, out, t + 0.44, 0.14);
  },
  'vote-cast': (ctx, out, t) => {
    voice(ctx, out, {
      freq: 1400, type: 'square', t, peak: 0.07,
      env: { attack: 0.001, decay: 0.05, release: 0.01 }, filter: { type: 'lowpass', freq: 3000 },
    });
    voice(ctx, out, { freq: 2100, type: 'sine', t: t + 0.04, peak: 0.05, env: { attack: 0.001, decay: 0.05, release: 0.01 } });
  },
  'vote-result': (ctx, out, t) => {
    boom(ctx, out, t, 0.5);
    brassChord(ctx, out, [53, 60, 65], t, 0.2, 0.28);
    [72, 76, 79].forEach((n, i) => { brass(ctx, out, n, t + 0.35 + i * 0.12, 0.08, 0.12); snare(ctx, out, t + 0.35 + i * 0.12, 0.1); });
    const hit = t + 0.71;
    brassChord(ctx, out, [72, 76, 79, 84], hit, 0.7, 0.32);
    kick(ctx, out, hit, 0.5);
    crash(ctx, out, hit, 0.16);
    [91, 96].forEach((n, i) => bell(ctx, out, n, hit + 0.08 + i * 0.08, 0.04, 0.5));
  },
  'question-start': (ctx, out, t) => {
    whoosh(ctx, out, t, 0.35, 0.18);
    const hit = t + 0.35;
    boom(ctx, out, hit, 0.65);
    [45, 52, 57, 60].forEach((n) => voice(ctx, out, {
      freq: midi(n), type: 'sawtooth', t: hit, peak: 0.07,
      env: { attack: 0.02, decay: 0.3, sustain: 0.6, hold: 0.8, release: 0.4 },
      filter: { type: 'lowpass', Q: 3, sweep: { from: 300, to: 2600, time: 0.6 } },
    }));
    crash(ctx, out, hit, 0.12, 1.2);
    voice(ctx, out, { freq: midi(81), type: 'sine', t: hit + 0.1, peak: 0.04, env: { attack: 0.3, decay: 0.2, sustain: 0.8, hold: 0.8, release: 0.3 } });
  },
  reveal: (ctx, out, t) => {
    whoosh(ctx, out, t, 0.45, 0.2);
    const hit = t + 0.42;
    [72, 76, 79, 84].forEach((n) => bell(ctx, out, n, hit, 0.05, 0.7));
    brassChord(ctx, out, [60, 67, 72], hit, 0.45, 0.24);
    crash(ctx, out, hit, 0.1, 0.9);
  },
  drumroll: (ctx, out, t) => {
    const end = drumroll(ctx, out, t, 1.95, 0.03, 0.3);
    kick(ctx, out, end + 0.02, 0.6);
    crash(ctx, out, end + 0.02, 0.2, 1.2);
  },
  leaderboard: (ctx, out, t) => {
    const seq = [[0, 67, 0.07], [0.1, 67, 0.07], [0.2, 67, 0.07], [0.3, 72, 0.22], [0.6, 76, 0.1], [0.75, 79, 0.5]];
    seq.forEach(([dt, n, d]) => { brass(ctx, out, n, t + dt, d, 0.13); snare(ctx, out, t + dt, 0.1); });
    kick(ctx, out, t + 0.3, 0.5);
    brassChord(ctx, out, [60, 64, 67, 72], t + 0.75, 0.6, 0.26);
    kick(ctx, out, t + 0.75, 0.6);
    crash(ctx, out, t + 0.75, 0.16);
  },
  'game-over': (ctx, out, t) => {
    const rollEnd = drumroll(ctx, out, t, 1.0, 0.04, 0.25);
    const s = rollEnd + 0.02;
    crash(ctx, out, s, 0.14, 0.8);
    const seq = [
      [0, 72, 0.07], [0.12, 72, 0.07], [0.24, 72, 0.07], [0.36, 72, 0.35],
      [0.84, 68, 0.28], [1.2, 70, 0.28], [1.56, 72, 1.2],
    ];
    seq.forEach(([dt, n, d]) => brass(ctx, out, n, s + dt, d, 0.14));
    brassChord(ctx, out, [56, 63, 68], s + 0.84, 0.28, 0.18);
    brassChord(ctx, out, [58, 65, 70], s + 1.2, 0.28, 0.18);
    const fin = s + 1.56;
    brassChord(ctx, out, [48, 60, 64, 67], fin, 1.2, 0.3);
    boom(ctx, out, fin, 0.5);
    kick(ctx, out, s, 0.5);
    kick(ctx, out, s + 0.36, 0.5);
    crash(ctx, out, fin, 0.2, 2);
    [84, 88, 91, 96, 100].forEach((n, i) => bell(ctx, out, n, fin + 0.1 + i * 0.07, 0.035, 0.6));
  },
  'button-tap': (ctx, out, t) => {
    voice(ctx, out, { freq: 1800, type: 'sine', t, peak: 0.05, env: { attack: 0.001, decay: 0.025, release: 0.01 } });
  },
};

function createAudioGraph() {
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Ctx) return null;
  const ctx = new Ctx();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 12;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;
  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN;
  const sfx = ctx.createGain();
  sfx.gain.value = 1;
  sfx.connect(master);
  master.connect(comp);
  comp.connect(ctx.destination);
  return { ctx, master, sfx };
}

// Play now if the context runs; if it is still resuming (resume() is async –
// e.g. the very gesture that unlocks audio, or iOS 'interrupted'), play once it
// resumes, but only if that happens quickly – stale sounds are dropped.
const RESUME_GRACE_MS = 400;
function playWhenRunning(ctx, fn) {
  const run = () => fn(ctx.currentTime + 0.01);
  if (ctx.state === 'running') { run(); return; }
  if (ctx.state === 'closed') return;
  const t0 = Date.now();
  ctx.resume().then(() => {
    if (ctx.state === 'running' && Date.now() - t0 < RESUME_GRACE_MS) {
      try { run(); } catch (e) { /* sound is optional */ }
    }
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// SYNTH-END
// ---------------------------------------------------------------------------

// ---- background music (TV only) -------------------------------------------

const MUSIC_GAIN = 0.15;
const MUSIC_FADE = 0.8;
const LOOKAHEAD = 0.15;
const SCHEDULER_MS = 40;
const LOOP_STEPS = 64; // 4 bars of 16ths

const MUSIC = {
  lobby: {
    bpm: 112,
    play(ctx, out, step, t, sd) {
      const bar = Math.floor(step / 16);
      const s = step % 16;
      const prog = [[36, [60, 64, 67]], [33, [57, 60, 64]], [41, [57, 60, 65]], [43, [55, 59, 62]]];
      const [root, chord] = prog[bar];
      if (s === 0 || s === 8) kick(ctx, out, t, 0.55);
      if (s === 4 || s === 12) snare(ctx, out, t, 0.16);
      if (s % 4 === 2) hat(ctx, out, t, 0.12);
      const bassSteps = { 0: 0, 3: 12, 6: 0, 8: 0, 11: 7, 14: 12 };
      if (bassSteps[s] !== undefined) {
        voice(ctx, out, {
          freq: midi(root + 12 + bassSteps[s]), type: 'sawtooth', t, peak: 0.22,
          env: { attack: 0.004, decay: sd * 1.4, release: 0.04 }, filter: { type: 'lowpass', freq: 700, Q: 2 },
        });
      }
      if (s === 2 || s === 7 || s === 10) {
        chord.forEach((n) => pluck(ctx, out, n, t, 0.06, sd * 1.5));
      }
      if (s === 0) bell(ctx, out, chord[2] + 12, t, 0.05, 0.5);
      if (s === 12 && bar % 2 === 1) bell(ctx, out, chord[1] + 12, t, 0.035, 0.4);
    },
  },
  thinking: {
    bpm: 100,
    play(ctx, out, step, t, sd) {
      const bar = Math.floor(step / 16);
      const s = step % 16;
      const roots = [45, 45, 46, 44];
      const pads = [[57, 60, 64], [57, 60, 64], [58, 62, 65], [56, 59, 64]];
      if (s % 2 === 0) {
        voice(ctx, out, {
          freq: midi(roots[bar]), type: 'sawtooth', t, peak: s % 4 === 0 ? 0.24 : 0.16,
          env: { attack: 0.005, decay: sd * 1.2, release: 0.04 }, filter: { type: 'lowpass', freq: 550, Q: 3 },
        });
      }
      if (s === 0) kick(ctx, out, t, 0.55);
      if (s === 3) kick(ctx, out, t, 0.35);
      hat(ctx, out, t, s % 4 === 0 ? 0.06 : 0.03);
      if (s === 0) pad(ctx, out, pads[bar], t, sd * 15, 0.13);
      if (s === 8) bell(ctx, out, bar === 2 ? 82 : 81, t, 0.03, 0.5);
    },
  },
};

// Custom hook for playing sounds in the game (TV)
const useSound = () => {
  const graphRef = useRef(null); // { ctx, master, sfx, music }
  const trackRef = useRef(null); // currently playing music track
  const desiredMusicRef = useRef(null);
  const mutedRef = useRef(false);
  const duckedRef = useRef(false); // host is speaking -> music quieter
  const [muted, setMutedState] = useState(false);

  const fadeOutTrack = useCallback((track) => {
    if (!track || track.stopped) return;
    track.stopped = true;
    clearTimeout(track.timer);
    const g = graphRef.current;
    if (!g || g.ctx.state === 'closed') return;
    const now = g.ctx.currentTime;
    try {
      track.bus.gain.cancelScheduledValues(now);
      track.bus.gain.setValueAtTime(Math.max(track.bus.gain.value, FLOOR), now);
      track.bus.gain.exponentialRampToValueAtTime(FLOOR, now + MUSIC_FADE);
    } catch (e) { /* ignore */ }
    setTimeout(() => {
      try { track.bus.disconnect(); } catch (e) { /* ignore */ }
    }, (MUSIC_FADE + LOOKAHEAD + 0.5) * 1000);
  }, []);

  const syncMusic = useCallback(() => {
    const g = graphRef.current;
    if (!g || g.ctx.state !== 'running') return;
    const kind = desiredMusicRef.current;
    const current = trackRef.current;
    if (current && !current.stopped && current.kind === kind) return;
    if (current) fadeOutTrack(current);
    trackRef.current = null;
    if (!kind || !MUSIC[kind]) return;

    const { ctx } = g;
    const def = MUSIC[kind];
    const sd = 60 / def.bpm / 4;
    const bus = ctx.createGain();
    const now = ctx.currentTime;
    bus.gain.setValueAtTime(FLOOR, now);
    bus.gain.exponentialRampToValueAtTime(1, now + MUSIC_FADE);
    bus.connect(g.music);
    const track = { kind, bus, step: 0, next: now + 0.05, timer: null, stopped: false };
    const tick = () => {
      if (track.stopped || ctx.state === 'closed') return;
      if (ctx.state === 'running') {
        // tab was throttled – skip missed steps instead of bursting them
        if (track.next < ctx.currentTime - 0.05) track.next = ctx.currentTime + 0.02;
        while (track.next < ctx.currentTime + LOOKAHEAD) {
          if (!mutedRef.current) {
            try { def.play(ctx, bus, track.step, track.next, sd); } catch (e) { /* ignore */ }
          }
          track.next += sd;
          track.step = (track.step + 1) % LOOP_STEPS;
        }
      }
      track.timer = setTimeout(tick, SCHEDULER_MS);
    };
    trackRef.current = track;
    tick();
  }, [fadeOutTrack]);

  // Initialize Audio Context (lazy initialization)
  const getGraph = useCallback(() => {
    if (!graphRef.current) {
      const g = createAudioGraph();
      if (!g) return null;
      g.music = g.ctx.createGain();
      g.music.gain.value = duckedRef.current ? MUSIC_GAIN * 0.3 : MUSIC_GAIN;
      g.music.connect(g.master);
      if (mutedRef.current) g.master.gain.value = 0;
      g.ctx.onstatechange = () => syncMusic();
      graphRef.current = g;
    }
    const g = graphRef.current;
    if (g.ctx.state !== 'running' && g.ctx.state !== 'closed') {
      g.ctx.resume().catch(() => {});
    }
    return g;
  }, [syncMusic]);

  // Unlock audio on the first user gesture (browser autoplay policy).
  useEffect(() => {
    const unlock = () => {
      try {
        getGraph();
        syncMusic();
      } catch (e) { /* sound is optional */ }
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock, { passive: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      if (trackRef.current) {
        trackRef.current.stopped = true;
        clearTimeout(trackRef.current.timer);
        trackRef.current = null;
      }
      const g = graphRef.current;
      graphRef.current = null;
      if (g) {
        g.ctx.onstatechange = null;
        if (g.ctx.state !== 'closed') g.ctx.close().catch(() => {});
      }
    };
  }, [getGraph, syncMusic]);

  // Play sound function – unknown type or blocked audio = silent no-op
  const playSound = useCallback((type) => {
    try {
      const fn = SOUNDS[type];
      if (!fn || mutedRef.current) return;
      const g = getGraph();
      if (!g) return;
      playWhenRunning(g.ctx, (t) => fn(g.ctx, g.sfx, t));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [getGraph]);

  // Background music: 'lobby' | 'thinking'. Switching crossfades.
  const startMusic = useCallback((kind) => {
    if (!MUSIC[kind]) return;
    desiredMusicRef.current = kind;
    try {
      getGraph();
      syncMusic();
    } catch (e) { /* ignore */ }
  }, [getGraph, syncMusic]);

  const stopMusic = useCallback(() => {
    desiredMusicRef.current = null;
    fadeOutTrack(trackRef.current);
    trackRef.current = null;
  }, [fadeOutTrack]);

  const setMuted = useCallback((value) => {
    const m = !!value;
    mutedRef.current = m;
    setMutedState(m);
    const g = graphRef.current;
    if (g && g.ctx.state !== 'closed') {
      const now = g.ctx.currentTime;
      g.master.gain.cancelScheduledValues(now);
      g.master.gain.setValueAtTime(g.master.gain.value, now);
      g.master.gain.linearRampToValueAtTime(m ? 0 : MASTER_GAIN, now + 0.3);
    }
  }, []);

  const toggleMute = useCallback(() => setMuted(!mutedRef.current), [setMuted]);

  // Lower the background music while the host is speaking (only if audio already exists)
  const duckMusic = useCallback((on) => {
    const d = !!on;
    if (duckedRef.current === d) return;
    duckedRef.current = d;
    const g = graphRef.current;
    if (!g || !g.music || g.ctx.state === 'closed') return;
    try {
      const now = g.ctx.currentTime;
      g.music.gain.cancelScheduledValues(now);
      g.music.gain.setValueAtTime(g.music.gain.value, now);
      g.music.gain.linearRampToValueAtTime(d ? MUSIC_GAIN * 0.3 : MUSIC_GAIN, now + 0.25);
    } catch (e) { /* ignore */ }
  }, []);

  return { playSound, startMusic, stopMusic, muted, setMuted, toggleMute, duckMusic };
};

export default useSound;
