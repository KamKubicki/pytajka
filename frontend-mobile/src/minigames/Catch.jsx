import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './Catch.css';

export const meta = {
  type: 'catch',
  name: 'Uciekinier',
  icon: '🏃',
  hint: 'Złap uciekający przycisk 4 razy!',
};

const GOAL = 4;
const JUMP_MS = 900;
const BTN = 76; // ≥ 56 px
const HIT_COOLDOWN_MS = 150;

// Losowe miejsce w całości w obszarze, wyraźnie oddalone od poprzedniego.
function randomPos(w, h, prev) {
  const maxX = Math.max(0, w - BTN);
  const maxY = Math.max(0, h - BTN);
  const minJump = Math.min(maxX, maxY, BTN * 1.5);
  let p = { x: Math.random() * maxX, y: Math.random() * maxY };
  for (let i = 0; i < 20 && prev; i++) {
    if (Math.hypot(p.x - prev.x, p.y - prev.y) >= minJump) break;
    p = { x: Math.random() * maxX, y: Math.random() * maxY };
  }
  return p;
}

export default function Catch({ onComplete, playSound }) {
  const areaRef = useRef(null);
  const sizeRef = useRef(null);
  const posRef = useRef(null);
  const timerRef = useRef(null);
  const doneRef = useRef(false);
  const hitsRef = useRef(0);
  const lastHitRef = useRef(-Infinity);
  const onCompleteRef = useRef(onComplete);
  const playSoundRef = useRef(playSound);
  onCompleteRef.current = onComplete;
  playSoundRef.current = playSound;

  const [pos, setPos] = useState(null);
  const [hits, setHits] = useState(0);

  const sound = useCallback((t) => {
    try {
      playSoundRef.current?.(t);
    } catch {
      /* dźwięk nie może zepsuć gry */
    }
  }, []);

  const jump = useCallback(() => {
    const s = sizeRef.current;
    if (!s) return;
    const p = randomPos(s.w, s.h, posRef.current);
    posRef.current = p;
    setPos(p);
  }, []);

  const schedule = useCallback(() => {
    clearInterval(timerRef.current);
    if (doneRef.current) return;
    timerRef.current = setInterval(jump, JUMP_MS);
  }, [jump]);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return undefined;
    const measure = () => {
      const w = Math.floor(el.clientWidth);
      const h = Math.floor(el.clientHeight);
      if (w <= 0 || h <= 0) return;
      sizeRef.current = { w, h };
      const p = posRef.current;
      if (!p) {
        jump();
      } else if (p.x > w - BTN || p.y > h - BTN) {
        // po zmianie rozmiaru dociśnij przycisk do obszaru
        const c = { x: Math.max(0, Math.min(p.x, w - BTN)), y: Math.max(0, Math.min(p.y, h - BTN)) };
        posRef.current = c;
        setPos(c);
      }
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [jump, schedule]);

  // Osobny efekt timera – po ponownym zamontowaniu (StrictMode, HMR) wystartuje znowu.
  useEffect(() => {
    schedule();
    return () => clearInterval(timerRef.current);
  }, [schedule]);

  const handleHit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (doneRef.current) return;
    // multi-touch: kilka palców naraz na tym samym miejscu liczy się raz
    const now = performance.now();
    if (now - lastHitRef.current < HIT_COOLDOWN_MS) return;
    lastHitRef.current = now;
    const n = hitsRef.current + 1;
    hitsRef.current = n;
    setHits(n);
    if (n >= GOAL) {
      doneRef.current = true;
      clearInterval(timerRef.current);
      sound('correct');
      onCompleteRef.current?.();
      return;
    }
    sound('button-tap');
    jump();
    schedule();
  };

  const solved = hits >= GOAL;

  return (
    <div className="mg-catch" role="dialog" aria-label={meta.name}>
      <header className="mg-catch__head">
        <div className="mg-catch__title">
          <span aria-hidden="true">{meta.icon}</span> {meta.name}
        </div>
        <div className="mg-catch__hint">{solved ? 'Złapany!' : meta.hint}</div>
        <div className="mg-catch__count" aria-live="polite" key={hits}>
          {hits}/{GOAL}
        </div>
      </header>
      <div className="mg-catch__area" ref={areaRef}>
        {pos && (
          <button
            type="button"
            className={`mg-catch__btn${solved ? ' is-caught' : ''}`}
            style={{ width: BTN, height: BTN, transform: `translate(${pos.x}px, ${pos.y}px)` }}
            onPointerDown={handleHit}
            onClick={(e) => {
              // klawiatura / czytnik ekranu (click bez wskaźnika)
              if (e.detail === 0) handleHit(e);
            }}
            disabled={solved}
            aria-label="Złap!"
          >
            <span className="mg-catch__emoji" aria-hidden="true">🏃</span>
            <span className="mg-catch__label">Złap!</span>
          </button>
        )}
      </div>
    </div>
  );
}
