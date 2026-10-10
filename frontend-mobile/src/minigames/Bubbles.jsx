import { useEffect, useRef, useState } from 'react';
import './Bubbles.css';

export const meta = {
  type: 'bubbles',
  name: 'Bąbelki',
  icon: '🫧',
  hint: 'Przebij wszystkie bąbelki!',
};

const COUNT = 8;
const LETTERS = ['A', 'B', 'C', 'D'];
const HUES = [190, 300, 45, 140, 210, 330, 260, 20];

function makeBubbles(w, h) {
  const list = [];
  for (let i = 0; i < COUNT; i += 1) {
    const size = Math.round(58 + Math.random() * 18); // 58–76 px
    const speed = 35 + Math.random() * 45; // px / s
    const angle = Math.random() * Math.PI * 2;
    // spread start positions over a 2×4 grid so they don't pile up
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cellW = w / 2;
    const cellH = h / 4;
    const x = Math.min(Math.max(0, col * cellW + Math.random() * Math.max(0, cellW - size)), Math.max(0, w - size));
    const y = Math.min(Math.max(0, row * cellH + Math.random() * Math.max(0, cellH - size)), Math.max(0, h - size));
    list.push({
      id: i,
      size,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      phase: Math.random() * Math.PI * 2,
      hue: HUES[i % HUES.length],
    });
  }
  return list;
}

export default function Bubbles({ answers = [], onComplete, playSound }) {
  const areaRef = useRef(null);
  const nodesRef = useRef([]);
  const bubblesRef = useRef(null);
  const boundsRef = useRef({ w: 0, h: 0 });
  const poppedRef = useRef(new Set());
  const doneRef = useRef(false);
  const finishTimerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const playSoundRef = useRef(playSound);
  const [bubbles, setBubbles] = useState([]);
  const [popped, setPopped] = useState(() => new Set());

  onCompleteRef.current = onComplete;
  playSoundRef.current = playSound;

  const sound = (t) => {
    try {
      playSoundRef.current?.(t);
    } catch {
      /* ignore */
    }
  };

  // init + animation loop
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return undefined;

    const measure = () => {
      const r = area.getBoundingClientRect();
      boundsRef.current = { w: r.width, h: r.height };
      const list = bubblesRef.current;
      if (list) {
        list.forEach((b) => {
          b.x = Math.min(Math.max(0, b.x), Math.max(0, r.width - b.size));
          b.y = Math.min(Math.max(0, b.y), Math.max(0, r.height - b.size));
        });
      }
    };
    measure();

    if (!bubblesRef.current) {
      const { w, h } = boundsRef.current;
      bubblesRef.current = makeBubbles(w, h);
      setBubbles(bubblesRef.current.map(({ id, size, hue }) => ({ id, size, hue })));
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(area);
    window.addEventListener('resize', measure);

    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { w, h } = boundsRef.current;
      const list = bubblesRef.current || [];
      for (let i = 0; i < list.length; i += 1) {
        const b = list[i];
        if (poppedRef.current.has(b.id)) continue;
        b.phase += dt * 2;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const maxX = Math.max(0, w - b.size);
        const maxY = Math.max(0, h - b.size);
        if (b.x <= 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        else if (b.x >= maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); }
        if (b.y <= 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        else if (b.y >= maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); }
        const node = nodesRef.current[b.id];
        if (node) {
          const wobble = 1 + Math.sin(b.phase) * 0.04;
          node.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) scale(${wobble}, ${2 - wobble})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => () => {
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
  }, []);

  const pop = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (doneRef.current || poppedRef.current.has(id)) return;
    poppedRef.current.add(id);
    // freeze the popped bubble where it was hit
    const node = nodesRef.current[id];
    const b = bubblesRef.current?.find((x) => x.id === id);
    if (node && b) node.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
    setPopped(new Set(poppedRef.current));
    sound('button-tap');
    if (poppedRef.current.size >= COUNT) {
      doneRef.current = true;
      sound('correct');
      finishTimerRef.current = window.setTimeout(() => {
        finishTimerRef.current = null;
        onCompleteRef.current?.();
      }, 400);
    }
  };

  const count = popped.size;
  const done = count >= COUNT;

  return (
    <div className="mg-bub" role="dialog" aria-label={`${meta.name}: ${meta.hint}`}>
      <header className="mg-bub__head">
        <div className="mg-bub__title">
          <span className="mg-bub__icon" aria-hidden="true">{meta.icon}</span>
          <span>{meta.name}</span>
        </div>
        <span className={`mg-bub__count${done ? ' is-done' : ''}`} data-testid="bubbles-count" aria-live="polite">
          {count}/{COUNT}
        </span>
        <p className="mg-bub__hint">{meta.hint}</p>
      </header>

      <div className="mg-bub__area" ref={areaRef}>
        <ul className={`mg-bub__answers${done ? ' is-done' : ''}`} aria-hidden={!done}>
          {LETTERS.map((l, i) => (
            <li key={l} className={`mg-bub__ans mg-bub__ans--${l.toLowerCase()}`}>
              <span className="mg-bub__letter">{l}</span>
              <span className="mg-bub__text">{answers[i] ?? ''}</span>
            </li>
          ))}
        </ul>
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            ref={(el) => {
              nodesRef.current[b.id] = el;
              const src = bubblesRef.current?.find((x) => x.id === b.id);
              if (el && src && !el.style.transform) {
                el.style.transform = `translate3d(${src.x}px, ${src.y}px, 0)`;
              }
            }}
            className={`mg-bub__bubble${popped.has(b.id) ? ' is-popped' : ''}`}
            style={{ width: b.size, height: b.size, '--hue': b.hue }}
            onPointerDown={(e) => pop(b.id, e)}
            aria-label="Bąbelek"
            disabled={popped.has(b.id)}
          >
            <span className="mg-bub__pop" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
