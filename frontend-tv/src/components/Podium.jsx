import React from 'react';

const SLOTS = [
  { idx: 1, cls: 'second', medal: '2' },
  { idx: 0, cls: 'first', medal: '1' },
  { idx: 2, cls: 'third', medal: '3' }
];

/** Top-3 podium + compact list of the rest. `sorted` must already be sorted by score. */
function Podium({ sorted = [], big = false }) {
  const rest = sorted.slice(3);
  return (
    <div className={`podium-wrap ${big ? 'is-big' : ''} ${rest.length ? 'has-rest' : ''}`}>
      <div className="podium">
        {SLOTS.map(slot => {
          const p = sorted[slot.idx];
          if (!p) return <div key={slot.cls} className={`podium-col ${slot.cls} is-empty`} />;
          return (
            <div key={p.id} className={`podium-col ${slot.cls}`}>
              <div className="podium-avatar">{p.avatar}</div>
              <div className="podium-name">{p.name}</div>
              <div className="podium-score">{p.score} pkt</div>
              <div className="podium-block"><span>{slot.medal}</span></div>
            </div>
          );
        })}
      </div>
      {rest.length > 0 && (
        <ol className={`rest-list ranking-list ${rest.length > 8 ? 'two-col' : ''}`} style={{ '--rows': rest.length > 8 ? Math.ceil(rest.length / 2) : rest.length }}>
          {rest.map((p, i) => (
            <li key={p.id} className="ranking-row">
              <span className="rank-pos">{i + 4}</span>
              <span className="rank-avatar">{p.avatar}</span>
              <span className="rank-name">{p.name}</span>
              <span className="rank-score">{p.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default Podium;
