import React from 'react';
import Avatar from './Avatar';

// Compact top bar: avatar + name on the left, score on the right, optional extra row content
export default function PlayerHeader({ player, children }) {
  return (
    <header className="topbar">
      <div className="topbar__me">
        <Avatar avatar={player?.avatar} size="sm" />
        <span className="topbar__name">{player?.name}</span>
      </div>
      {children}
      <div className="score-pill" aria-label={`${player?.score ?? 0} punktów`}>
        <span className="score-pill__num">{player?.score ?? 0}</span>
        <span className="score-pill__unit">pkt</span>
      </div>
    </header>
  );
}
