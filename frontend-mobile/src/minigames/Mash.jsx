import { useCallback, useRef, useState } from 'react';
import './Mash.css';

export const meta = {
  type: 'mash',
  name: 'Klikacz',
  icon: '👆',
  hint: 'Klikaj jak szalony!',
};

const TARGET = 20;
const RADIUS = 46;
const CIRC = 2 * Math.PI * RADIUS;

export default function Mash({ onComplete, playSound }) {
  const [count, setCount] = useState(0);
  const [bumpOdd, setBumpOdd] = useState(false);
  const countRef = useRef(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const sound = useCallback(
    (t) => {
      try {
        playSound?.(t);
      } catch {
        /* dźwięk jest opcjonalny */
      }
    },
    [playSound]
  );

  const tap = (e) => {
    e.preventDefault();
    if (doneRef.current) return;
    countRef.current += 1;
    const n = countRef.current;
    setCount(n);
    setBumpOdd((b) => !b);
    try {
      navigator.vibrate?.(10);
    } catch {
      /* brak wibracji */
    }
    if (n >= TARGET) {
      doneRef.current = true;
      sound('correct');
      onCompleteRef.current?.();
    } else {
      sound('button-tap');
    }
  };

  const progress = Math.min(count / TARGET, 1);
  const done = count >= TARGET;
  const bumpClass = count === 0 ? '' : bumpOdd ? ' is-bump-a' : ' is-bump-b';

  return (
    <div className="mg-mash" role="dialog" aria-modal="true" aria-label={meta.name}>
      <div className="mg-mash__head">
        <span className="mg-mash__icon" aria-hidden="true">{meta.icon}</span>
        <span className="mg-mash__title">{meta.name}</span>
      </div>
      <p className="mg-mash__hint">{done ? 'Gotowe!' : meta.hint}</p>

      <div className="mg-mash__stage">
        <svg className="mg-mash__ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="mg-mash__ring-bg" cx="50" cy="50" r={RADIUS} />
          <circle
            className="mg-mash__ring-fg"
            cx="50"
            cy="50"
            r={RADIUS}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
          />
        </svg>
        <button
          type="button"
          className={`mg-mash__btn${done ? ' is-done' : bumpClass}`}
          onPointerDown={tap}
          onClick={(e) => {
            // Klawiatura / czytnik ekranu (click bez wskaźnika, detail === 0).
            if (e.detail === 0) tap(e);
          }}
          onContextMenu={(e) => e.preventDefault()}
          disabled={done}
          aria-label={`Klikaj! ${count} z ${TARGET}`}
        >
          <span className="mg-mash__count">{done ? '✓' : TARGET - count}</span>
          <span className="mg-mash__sub">{done ? 'Brawo!' : 'KLIK!'}</span>
        </button>
      </div>

      <div className="mg-mash__counter" aria-live="polite">
        {Math.min(count, TARGET)} / {TARGET}
      </div>
    </div>
  );
}
