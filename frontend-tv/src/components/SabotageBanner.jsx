import React, { useContext, useEffect, useRef, useState } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import { sabotageMeta } from '../sabotage';

const SHOW_MS = 3000; // whole banner life incl. slide in/out
const SHOW_MS_BUSY = 2200; // shorter when more attacks are waiting
const LEAVE_MS = 380;
const MAX_WAITING = 6;

/**
 * Studio-style "breaking news" strip announcing a played sabotage card.
 * Sits in the top band of the game area (over the header row, never over the question
 * or the answers), one at a time; several attacks at once are queued.
 */
function SabotageBanner({ sound }) {
  const { sabotageFeed } = useContext(GameContext);
  const [current, setCurrent] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const queueRef = useRef([]);
  const seenRef = useRef(0);
  const busyRef = useRef(false);
  const timersRef = useRef([]);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const showNextRef = useRef(() => {});
  showNextRef.current = () => {
    const next = queueRef.current.shift();
    if (!next) {
      busyRef.current = false;
      setCurrent(null);
      setLeaving(false);
      return;
    }
    busyRef.current = true;
    setLeaving(false);
    setCurrent(next);
    const fn = soundRef.current?.playSound;
    if (typeof fn === 'function') {
      try { fn('sabotage'); } catch (e) { /* sound is optional */ }
    }
    const life = queueRef.current.length ? SHOW_MS_BUSY : SHOW_MS;
    timersRef.current = [
      setTimeout(() => setLeaving(true), life - LEAVE_MS),
      setTimeout(() => showNextRef.current(), life)
    ];
  };

  useEffect(() => {
    const feed = Array.isArray(sabotageFeed) ? sabotageFeed : [];
    if (!feed.length) {
      // new game – forget everything still waiting
      queueRef.current = [];
      return;
    }
    const fresh = feed.filter(e => e.id > seenRef.current);
    if (!fresh.length) return;
    seenRef.current = fresh[fresh.length - 1].id;
    queueRef.current = [...queueRef.current, ...fresh].slice(-MAX_WAITING);
    if (!busyRef.current) showNextRef.current();
  }, [sabotageFeed]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  if (!current) return null;
  const meta = sabotageMeta(current.type);

  return (
    <div className="sab-banner-wrap" aria-live="polite">
      <div key={current.id} className={`sab-banner ${leaving ? 'is-leaving' : ''}`} role="status">
        <span className="sab-tag">Sabotaż!</span>
        <span className="sab-icon" aria-hidden="true">{meta.icon}</span>
        <span className="sab-text">
          <b className="sab-from">{current.fromName}</b>
          <span className="sab-verb"> rzuca </span>
          <b className="sab-card">{meta.acc}</b>
          <span className="sab-verb">!</span>
        </span>
        <span className="sab-target">
          <span className="sab-target-label">cel</span>
          <b className="sab-target-name">🎯 {current.targetName}</b>
        </span>
      </div>
    </div>
  );
}

export default SabotageBanner;
