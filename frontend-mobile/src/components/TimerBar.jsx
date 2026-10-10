import React, { useRef } from 'react';

// Horizontal countdown bar + number. `left` and `total` in seconds.
export default function TimerBar({ left, total }) {
  const prevRef = useRef(left);
  // Animate only while counting down; jump instantly when the timer restarts
  const animate = left < prevRef.current;
  prevRef.current = left;

  const safeTotal = total > 0 ? total : 1;
  const pct = Math.max(0, Math.min(100, (left / safeTotal) * 100));
  const urgent = left <= 3;
  return (
    <div className={`timer ${urgent ? 'timer--urgent' : ''}`} role="timer" aria-label={`Pozostało ${left} sekund`}>
      <div className="timer__track">
        <div className="timer__fill" style={{ width: `${pct}%`, transition: animate ? undefined : 'none' }} />
      </div>
      <div className="timer__num">{left}</div>
    </div>
  );
}
