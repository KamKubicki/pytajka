import React from 'react';
import { sabotageMeta } from '../sabotage';

/**
 * Compact avatar strip for up to ~20 players.
 * `doneIds` - Set/array of player ids that get a ✓ badge (answered / voted).
 * `highlightIds` - optional ids rendered as "correct" (after reveal).
 * `sabotage` - optional Map(playerId -> [{ type, fromName }]) – sabotaged players get the
 *   card icon(s); after the reveal a hit despite the sabotage gets a "💪 mimo sabotażu" ribbon.
 */
function PlayerStrip({ players = [], doneIds, highlightIds, dimOthers = false, sabotage }) {
  const done = doneIds instanceof Set ? doneIds : new Set(doneIds || []);
  const highlight = highlightIds ? (highlightIds instanceof Set ? highlightIds : new Set(highlightIds)) : null;
  const density = players.length > 14 ? 'dense' : players.length > 8 ? 'medium' : 'roomy';

  return (
    <ul className={`player-strip ${density}`}>
      {players.map(p => {
        const isDone = done.has(p.id);
        const isHi = highlight?.has(p.id);
        const sabs = sabotage instanceof Map ? sabotage.get(p.id) : null;
        const survived = !!(sabs?.length && highlight && isHi);
        const cls = [
          'strip-player',
          isDone ? 'is-done' : '',
          highlight ? (isHi ? 'is-hit' : (dimOthers ? 'is-miss' : '')) : '',
          p.connected === false ? 'is-offline' : '',
          sabs?.length ? 'is-sabotaged' : '',
          survived ? 'is-survivor' : ''
        ].filter(Boolean).join(' ');
        const sabTitle = sabs?.length
          ? sabs.map(s => `${sabotageMeta(s.type).name} od: ${s.fromName}`).join(', ')
          : undefined;
        return (
          <li key={p.id} className={cls} title={sabTitle}>
            <span className="strip-avatar">
              {p.avatar || '🙂'}
              {(isDone || isHi) && <span className="strip-check">✓</span>}
              {sabs?.length > 0 && (
                <span className="strip-sab" aria-label={`Sabotaż: ${sabTitle}`}>
                  {sabs.slice(0, 2).map((s, i) => <span key={i}>{sabotageMeta(s.type).icon}</span>)}
                  {sabs.length > 2 && <b>+{sabs.length - 2}</b>}
                </span>
              )}
              {survived && <span className="strip-survivor">💪 mimo sabotażu</span>}
            </span>
            <span className="strip-name">{p.name}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default PlayerStrip;
