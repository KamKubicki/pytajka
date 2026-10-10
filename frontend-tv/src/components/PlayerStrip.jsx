import React from 'react';

/**
 * Compact avatar strip for up to ~20 players.
 * `doneIds` - Set/array of player ids that get a ✓ badge (answered / voted).
 * `highlightIds` - optional ids rendered as "correct" (after reveal).
 */
function PlayerStrip({ players = [], doneIds, highlightIds, dimOthers = false }) {
  const done = doneIds instanceof Set ? doneIds : new Set(doneIds || []);
  const highlight = highlightIds ? (highlightIds instanceof Set ? highlightIds : new Set(highlightIds)) : null;
  const density = players.length > 14 ? 'dense' : players.length > 8 ? 'medium' : 'roomy';

  return (
    <ul className={`player-strip ${density}`}>
      {players.map(p => {
        const isDone = done.has(p.id);
        const isHi = highlight?.has(p.id);
        const cls = [
          'strip-player',
          isDone ? 'is-done' : '',
          highlight ? (isHi ? 'is-hit' : (dimOthers ? 'is-miss' : '')) : '',
          p.connected === false ? 'is-offline' : ''
        ].filter(Boolean).join(' ');
        return (
          <li key={p.id} className={cls}>
            <span className="strip-avatar">
              {p.avatar || '🙂'}
              {(isDone || isHi) && <span className="strip-check">✓</span>}
            </span>
            <span className="strip-name">{p.name}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default PlayerStrip;
