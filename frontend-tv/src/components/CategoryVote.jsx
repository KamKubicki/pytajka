import React from 'react';
import PlayerStrip from './PlayerStrip';

const FALLBACK_COLORS = ['#7C5CFF', '#FF6B9A', '#22D3EE'];

function CategoryVote({ voteData, timeLeft = 0, players = [], showResult = false }) {
  const {
    round,
    totalRounds,
    duration = 10,
    options = [],
    votes = {},
    totalVotes = 0,
    totalPlayers,
    votedPlayerIds = [],
    result
  } = voteData || {};

  const maxVotes = Math.max(1, ...options.map(o => votes[o.key] || 0));
  const voters = totalPlayers || players.length;
  const winnerKey = showResult ? result?.key : null;
  const fraction = Math.max(0, Math.min(1, timeLeft / (duration || 10)));
  const winner = winnerKey ? options.find(o => o.key === winnerKey) || result : null;

  return (
    <main className={`screen vote-screen ${showResult ? 'is-result' : ''}`}>
      <header className="vote-header">
        <div className="eyebrow">
          {round ? `Runda ${round}${totalRounds ? ` z ${totalRounds}` : ''}` : 'Nowa runda'}
        </div>
        <h1 className="vote-title">
          {showResult && winner
            ? <>Gramy: <span style={{ color: winner.color || 'var(--accent)' }}>{winner.icon} {winner.name}</span></>
            : <>Głosujcie na kategorię!</>}
        </h1>
        {!showResult && (
          <div className="vote-timer" style={{ '--fraction': fraction }}>
            <div className="vote-timer-bar" />
            <span className="vote-timer-value">{timeLeft}s</span>
          </div>
        )}
      </header>

      <section className={`vote-options count-${options.length || 3}`}>
        {options.map((opt, i) => {
          const count = votes[opt.key] || 0;
          const color = opt.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
          const isWinner = winnerKey === opt.key;
          const isLoser = showResult && winnerKey && !isWinner;
          return (
            <div
              key={opt.key || i}
              className={`vote-tile ${isWinner ? 'is-winner' : ''} ${isLoser ? 'is-loser' : ''} ${opt.available === false ? 'is-unavailable' : ''}`}
              style={{ '--tile-color': color }}
            >
              <div className="vote-tile-number">{i + 1}</div>
              <div className="vote-tile-icon">{opt.icon || '❓'}</div>
              <div className="vote-tile-name">{opt.name}</div>
              <div className="vote-tile-meter">
                <div className="vote-tile-bar" style={{ width: `${(count / maxVotes) * 100}%` }} />
              </div>
              <div className="vote-tile-count">
                <strong>{count}</strong> {count === 1 ? 'głos' : (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) ? 'głosy' : 'głosów'}
              </div>
              {isWinner && <div className="vote-tile-crown">★ Wybrana</div>}
            </div>
          );
        })}
      </section>

      <footer className="vote-footer">
        <div className="answer-counter">
          <span className="counter-label">Zagłosowało</span>
          <span className="counter-value">{totalVotes}<small>/{voters}</small></span>
        </div>
        {showResult
          ? <div className="vote-next">Pierwsze pytanie za chwilę…</div>
          : <PlayerStrip players={players} doneIds={votedPlayerIds} />}
      </footer>
    </main>
  );
}

export default CategoryVote;
