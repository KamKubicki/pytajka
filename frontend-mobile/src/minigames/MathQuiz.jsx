import { useCallback, useEffect, useRef, useState } from 'react';
import './MathQuiz.css';

export const meta = {
  type: 'math',
  name: 'Szybka matma',
  icon: '🧮',
  hint: 'Rozwiąż działanie!',
};

const BTN_COLORS = ['#E63946', '#2A9DF4', '#F4B400'];
const LOCK_MS = 1000;

const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Działanie z wynikiem 0–50, łatwe do policzenia w głowie.
function makeProblem(prevText) {
  for (;;) {
    const op = ['+', '−', '×'][rnd(0, 2)];
    let a;
    let b;
    let result;
    if (op === '+') {
      a = rnd(3, 30);
      b = rnd(2, Math.min(20, 50 - a));
      result = a + b;
    } else if (op === '−') {
      a = rnd(10, 50);
      b = rnd(2, Math.min(20, a));
      result = a - b;
    } else {
      a = rnd(2, 9);
      b = rnd(2, Math.min(9, Math.floor(50 / a)));
      result = a * b;
    }
    const text = `${a} ${op} ${b}`;
    if (text === prevText) continue;

    // Dystraktory blisko wyniku, unikalne i nieujemne.
    const options = new Set([result]);
    for (const d of shuffle([-3, -2, -1, 1, 2, 3])) {
      if (options.size >= 3) break;
      if (result + d >= 0) options.add(result + d);
    }
    let extra = 4;
    while (options.size < 3) options.add(result + extra++);

    return { text, result, options: shuffle([...options]) };
  }
}

export default function MathQuiz({ onComplete, playSound }) {
  const [problem, setProblem] = useState(() => makeProblem());
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [wrongValue, setWrongValue] = useState(null);
  const [solved, setSolved] = useState(false);
  const doneRef = useRef(false);
  const busyRef = useRef(false);
  const timersRef = useRef([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    },
    []
  );

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

  const pick = (value) => {
    if (doneRef.current || busyRef.current) return;
    if (value === problem.result) {
      doneRef.current = true;
      setSolved(true);
      sound('correct');
      onCompleteRef.current?.();
      return;
    }
    busyRef.current = true;
    sound('incorrect');
    setWrongValue(value);
    setShake(true);
    setLocked(true);
    timersRef.current.push(setTimeout(() => setShake(false), 450));
    timersRef.current.push(
      setTimeout(() => {
        busyRef.current = false;
        setLocked(false);
        setWrongValue(null);
        setProblem((p) => makeProblem(p.text));
      }, LOCK_MS)
    );
  };

  return (
    <div className="mg-math" role="dialog" aria-modal="true" aria-label={meta.name}>
      <div className="mg-math__head">
        <span className="mg-math__icon" aria-hidden="true">{meta.icon}</span>
        <span className="mg-math__title">{meta.name}</span>
      </div>
      <p className="mg-math__hint">
        {locked ? 'Źle! Chwila kary…' : solved ? 'Brawo!' : meta.hint}
      </p>

      <div
        className={`mg-math__card${shake ? ' is-shaking' : ''}${solved ? ' is-solved' : ''}`}
      >
        <span className="mg-math__expr">{problem.text} = ?</span>
      </div>

      <div className="mg-math__options">
        {problem.options.map((v, i) => (
          <button
            key={`${problem.text}-${v}`}
            type="button"
            className={`mg-math__btn${wrongValue === v ? ' is-wrong' : ''}${
              solved && v === problem.result ? ' is-right' : ''
            }`}
            style={{ '--btn-color': BTN_COLORS[i % BTN_COLORS.length] }}
            disabled={locked || solved}
            onPointerDown={(e) => {
              e.preventDefault();
              pick(v);
            }}
            onClick={(e) => {
              // Klawiatura / czytnik ekranu (click bez wskaźnika, detail === 0).
              if (e.detail === 0) pick(v);
            }}
          >
            {v}
          </button>
        ))}
      </div>
      {locked && (
        <div className="mg-math__lock" aria-hidden="true">
          🔒
        </div>
      )}
    </div>
  );
}
