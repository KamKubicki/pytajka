import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cardInfo, getMinigame } from '../sabotage/registry';

// A crashing minigame must never take the whole game down – skip it instead.
class MinigameBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('[sabotage] Minigierka się wysypała:', error);
    this.props.onFail?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// After a minigame is beaten the overlay stays up this long (showing
// "Odblokowane!") and swallows every pointer event, so the finishing tap –
// its pointerup/click, or the next frantic taps – can never land on the
// answer buttons underneath.
export const UNLOCK_HOLD_MS = 600;

// Swallow an event completely (nothing reaches the screen underneath)
const swallow = (e) => {
  if (e.cancelable) e.preventDefault();
  e.stopPropagation();
};

// Full-screen obstacle shown over the question screen. Answers stay locked
// (in Game) until every queued minigame calls onComplete().
// Game keys this component by obstacle id, so every queued item gets a fresh
// instance (and a fresh minigame state) even when two have the same type.
export default function SabotageOverlay({ item, total, answers, timer, onComplete, playSound }) {
  const doneRef = useRef(false);
  const [solved, setSolved] = useState(false);
  const holdTimerRef = useRef(null);

  useEffect(() => () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  }, []);

  // onComplete is honoured once per obstacle, whatever the minigame does.
  // It is reported to Game only after UNLOCK_HOLD_MS – until then the
  // overlay (with its event shield) stays on screen.
  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setSolved(true);
    const id = item?.id;
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      onComplete(id);
    }, UNLOCK_HOLD_MS);
  }, [onComplete, item?.id]);

  // A crashed minigame is skipped at once – no "beaten" celebration, no hold
  // (it fails on render, so there is no tap in flight to protect against).
  const skip = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete(item?.id);
  }, [onComplete, item?.id]);

  const game = getMinigame(item?.type);
  if (!item || !game) return null;
  const { Component, meta } = game;
  const info = cardInfo(item.type);
  const hint = meta?.hint || info.hint;

  return (
    <div
      className={`sab-overlay${solved ? ' is-solved' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Przeszkoda"
    >
      <div className="sab-overlay__head">
        <div className="sab-overlay__row">
          <span className="sab-overlay__icon" aria-hidden="true">{info.icon}</span>
          <div className="sab-overlay__title">
            <strong>{item.fromName || 'Ktoś'}</strong> rzuca na Ciebie {info.acc}!
          </div>
          <span className={`sab-overlay__timer ${timer <= 5 ? 'is-urgent' : ''}`} aria-label={`Zostało ${timer} sekund`}>
            ⏱ {timer}
          </span>
        </div>
        <div className="sab-overlay__hint">
          {solved ? '🔓 Przeszkoda pokonana!' : `🔒 ${hint || 'Pokonaj przeszkodę, żeby odblokować odpowiedzi'}`}
          {total > 1 && <span className="sab-overlay__count"> · zostało: {total}</span>}
        </div>
      </div>
      {/* transform makes this the containing block for the minigame's
          position:fixed layers, so they fill the stage below the header */}
      <div className="sab-overlay__stage">
        <MinigameBoundary key={item.id} onFail={skip}>
          <Component key={item.id} answers={answers || []} onComplete={complete} playSound={playSound} />
        </MinigameBoundary>
        {solved && (
          <div className="sab-overlay__done" aria-live="assertive">
            <span className="sab-overlay__done-badge">
              {total > 1 ? '✅ Zaliczone! Kolejna przeszkoda…' : '✅ Odblokowane!'}
            </span>
          </div>
        )}
      </div>
      {/* While "Odblokowane!" is shown nothing may get through: this shield
          covers the whole overlay (header + minigame) and eats every event. */}
      {solved && (
        <div
          className="sab-overlay__shield"
          aria-hidden="true"
          onPointerDown={swallow}
          onPointerUp={swallow}
          onPointerCancel={swallow}
          onMouseDown={swallow}
          onMouseUp={swallow}
          onClick={swallow}
          onContextMenu={swallow}
        />
      )}
    </div>
  );
}
