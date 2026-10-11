import React from 'react';
import PlayerHeader from './PlayerHeader';
import TimerBar from './TimerBar';
import { CATEGORY_FALLBACK_COLORS } from '../config';

export default function VoteScreen({ player, vote, counts, myVote, timer, onVote }) {
  const options = Array.isArray(vote?.options) ? vote.options : [];
  const votes = counts?.votes || {};
  const totalVotes = counts?.totalVotes ?? Object.values(votes).reduce((s, n) => s + (Number(n) || 0), 0);
  const totalPlayers = counts?.totalPlayers;

  return (
    <div className="screen screen--fixed vote">
      <PlayerHeader player={player} />

      <div className="vote__head">
        <div className="eyebrow">
          Runda {vote?.round ?? '?'}{vote?.totalRounds ? ` z ${vote.totalRounds}` : ''}
        </div>
        <h2 className="title">Wybierz kategorię</h2>
        <p className="subtitle">{myVote ? 'Głos oddany – możesz go jeszcze zmienić' : 'Stuknij kafel, żeby zagłosować'}</p>
      </div>

      <TimerBar left={timer} total={vote?.duration || 10} />

      <div className="vote__tiles">
        {options.map((opt, i) => {
          const color = opt.color || CATEGORY_FALLBACK_COLORS[i % CATEGORY_FALLBACK_COLORS.length];
          const count = Number(votes[opt.key]) || 0;
          const share = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const mine = myVote === opt.key;
          const disabled = opt.available === false || timer <= 0;
          return (
            <button
              key={opt.key}
              type="button"
              className={`tile ${mine ? 'is-mine' : ''} ${opt.available === false ? 'is-unavailable' : ''}`}
              style={{ '--tile': color }}
              onClick={() => onVote(opt.key)}
              disabled={disabled}
              aria-pressed={mine}
            >
              <span className="tile__icon" aria-hidden="true">{opt.icon || '❓'}</span>
              <span className="tile__body">
                <span className="tile__name">{opt.name || opt.key}</span>
                <span className="tile__bar"><span style={{ width: `${share}%` }} /></span>
              </span>
              <span className="tile__count" aria-label={`${count} głosów`}>{count}</span>
              {mine && <span className="tile__badge">Twój głos</span>}
              {opt.available === false && <span className="tile__badge tile__badge--off">brak pytań</span>}
            </button>
          );
        })}
      </div>

      <div className="vote__foot">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        Oddane głosy: <strong>{totalVotes}{totalPlayers ? ` / ${totalPlayers}` : ''}</strong>
      </div>
    </div>
  );
}
