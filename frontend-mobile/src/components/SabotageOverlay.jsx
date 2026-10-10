import React, { useCallback, useRef } from 'react';
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

// Full-screen obstacle shown over the question screen. Answers stay locked
// (in Game) until every queued minigame calls onComplete().
// Game keys this component by obstacle id, so every queued item gets a fresh
// instance (and a fresh minigame state) even when two have the same type.
export default function SabotageOverlay({ item, total, answers, timer, onComplete, playSound }) {
  const doneRef = useRef(false);

  // onComplete is honoured once per obstacle, whatever the minigame does
  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete(item.id);
  }, [onComplete, item?.id]);

  const game = getMinigame(item?.type);
  if (!item || !game) return null;
  const { Component, meta } = game;
  const info = cardInfo(item.type);
  const hint = meta?.hint || info.hint;

  return (
    <div className="sab-overlay" role="dialog" aria-modal="true" aria-label="Przeszkoda">
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
          🔒 {hint || 'Pokonaj przeszkodę, żeby odblokować odpowiedzi'}
          {total > 1 && <span className="sab-overlay__count"> · zostało: {total}</span>}
        </div>
      </div>
      {/* transform makes this the containing block for the minigame's
          position:fixed layers, so they fill the stage below the header */}
      <div className="sab-overlay__stage">
        <MinigameBoundary key={item.id} onFail={complete}>
          <Component key={item.id} answers={answers || []} onComplete={complete} playSound={playSound} />
        </MinigameBoundary>
      </div>
    </div>
  );
}
