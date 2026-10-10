import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './Sequence.css';

export const meta = {
  type: 'sequence',
  name: 'Kolejność',
  icon: '🔢',
  hint: 'Klikaj od 1 do 6!',
};

const COUNT = 6;
const GAP = 10;

// Losowe, nienachodzące pozycje kółek o średnicy `d` w obszarze w×h.
function layout(w, h, d) {
  const maxX = Math.max(0, w - d);
  const maxY = Math.max(0, h - d);
  const minDist = d + GAP;
  for (let attempt = 0; attempt < 60; attempt++) {
    const pts = [];
    let tries = 0;
    while (pts.length < COUNT && tries < 400) {
      tries++;
      const p = { x: Math.random() * maxX, y: Math.random() * maxY };
      if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= minDist)) pts.push(p);
    }
    if (pts.length === COUNT) return pts;
  }
  // Awaryjnie: siatka z przetasowaniem (zawsze mieści się w obszarze).
  const cols = w >= h ? 3 : 2;
  const rows = Math.ceil(COUNT / cols);
  const cw = w / cols;
  const rh = h / rows;
  const cells = Array.from({ length: COUNT }, (_, i) => ({
    x: Math.min(maxX, Math.max(0, (i % cols) * cw + (cw - d) / 2)),
    y: Math.min(maxY, Math.max(0, Math.floor(i / cols) * rh + (rh - d) / 2)),
  }));
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

export default function Sequence({ onComplete, playSound }) {
  const areaRef = useRef(null);
  const doneRef = useRef(false);
  const flashTimer = useRef(null);
  const flashRaf = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const playSoundRef = useRef(playSound);
  onCompleteRef.current = onComplete;
  playSoundRef.current = playSound;

  const [size, setSize] = useState(null); // { w, h, d }
  const [positions, setPositions] = useState([]);
  const [next, setNextState] = useState(1);
  const nextRef = useRef(1);
  const setNext = (v) => {
    nextRef.current = v;
    setNextState(v);
  };
  const [flash, setFlash] = useState(false);

  const sound = useCallback((t) => {
    try {
      playSoundRef.current?.(t);
    } catch {
      /* dźwięk nie może zepsuć gry */
    }
  }, []);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return undefined;
    const measure = () => {
      const w = Math.floor(el.clientWidth);
      const h = Math.floor(el.clientHeight);
      if (w <= 0 || h <= 0) return;
      // Średnica: min. 56 px, większa gdy jest miejsce.
      const d = Math.max(56, Math.min(84, Math.floor(Math.min(w, h) / 4.2)));
      setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h, d }));
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (size) setPositions(layout(size.w, size.h, size.d));
  }, [size]);

  useEffect(
    () => () => {
      clearTimeout(flashTimer.current);
      cancelAnimationFrame(flashRaf.current);
    },
    []
  );

  const handleTap = (n) => (e) => {
    e.preventDefault();
    const cur = nextRef.current;
    if (doneRef.current || n < cur) return;
    if (n === cur) {
      if (n === COUNT) {
        doneRef.current = true;
        setNext(COUNT + 1);
        sound('correct');
        onCompleteRef.current?.();
        return;
      }
      sound('button-tap');
      setNext(n + 1);
    } else {
      sound('incorrect');
      setNext(1);
      // restart animacji błysku
      setFlash(false);
      clearTimeout(flashTimer.current);
      cancelAnimationFrame(flashRaf.current);
      flashRaf.current = requestAnimationFrame(() => {
        setFlash(true);
        flashTimer.current = setTimeout(() => setFlash(false), 450);
      });
    }
  };

  const solved = next > COUNT;

  return (
    <div className={`mg-seq${flash ? ' mg-seq--flash' : ''}`} role="dialog" aria-label={meta.name}>
      <header className="mg-seq__head">
        <div className="mg-seq__title">
          <span aria-hidden="true">{meta.icon}</span> {meta.name}
        </div>
        <div className="mg-seq__hint">{solved ? 'Gotowe!' : meta.hint}</div>
        <div className="mg-seq__progress" aria-label={`${Math.min(next - 1, COUNT)}/${COUNT}`}>
          {Array.from({ length: COUNT }, (_, i) => (
            <span key={i} className={`mg-seq__pip${i + 1 < next ? ' is-on' : ''}`} />
          ))}
        </div>
      </header>
      <div className="mg-seq__area" ref={areaRef}>
        {size &&
          positions.map((p, i) => {
            const n = i + 1;
            const gone = n < next;
            return (
              <button
                key={n}
                type="button"
                className={`mg-seq__ball${gone ? ' is-gone' : ''}`}
                data-n={n}
                style={{
                  width: size.d,
                  height: size.d,
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  fontSize: Math.round(size.d * 0.45),
                }}
                disabled={gone || solved}
                onPointerDown={handleTap(n)}
                aria-label={`Liczba ${n}`}
              >
                <span>{n}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
