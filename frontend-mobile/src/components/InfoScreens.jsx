import React from 'react';
import Avatar from './Avatar';
import PlayerHeader from './PlayerHeader';
import { letterFor, ANSWER_COLORS } from '../config';

export function WaitingScreen({ player, message = 'Czekamy na start gry', hint = 'Patrz na ekran TV – zaraz zaczynamy!' }) {
  return (
    <div className="screen screen--center waiting">
      <div className="hero-card">
        <Avatar avatar={player?.avatar} size="xl" className="pulse-ring" />
        <div className="hero-card__name">{player?.name}</div>
        <div className="score-pill score-pill--lg">
          <span className="score-pill__num">{player?.score ?? 0}</span>
          <span className="score-pill__unit">pkt</span>
        </div>
      </div>
      <div className="waiting__msg">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        {message}
      </div>
      {hint && <p className="subtitle">{hint}</p>}
    </div>
  );
}

export function VoteResultScreen({ player, result }) {
  return (
    <div className="screen screen--fixed vote-result" style={{ '--tile': result?.color || 'var(--accent)' }}>
      <PlayerHeader player={player} />
      <div className="vote-result__center">
        <div className="eyebrow">Runda {result?.round ?? ''} · wybrano kategorię</div>
        <div className="vote-result__icon" aria-hidden="true">{result?.icon || '🎯'}</div>
        <h2 className="vote-result__name">{result?.name || result?.categoryKey || 'Losowa'}</h2>
        <div className="waiting__msg">
          <span className="dots" aria-hidden="true"><i /><i /><i /></span>
          Przygotuj się na pierwsze pytanie
        </div>
      </div>
    </div>
  );
}

export function FeedbackOverlay({ result, question }) {
  if (!result) return null;
  const noAnswer = result.answer == null && !result.correct;
  const variant = result.correct ? 'good' : noAnswer ? 'none' : 'bad';
  const correctText = question?.answers?.[result.correctAnswer];
  return (
    <div className={`feedback feedback--${variant}`} role="status">
      <div className="feedback__icon" aria-hidden="true">
        {result.correct ? '🎉' : noAnswer ? '⏰' : '😬'}
      </div>
      <div className="feedback__title">
        {result.correct ? 'Brawo!' : noAnswer ? 'Brak odpowiedzi' : 'Nie tym razem'}
      </div>
      <div className="feedback__points">+{result.pointsEarned || 0}<small> pkt</small></div>
      {result.correct && result.timeBonus > 0 && (
        <div className="feedback__bonus">⚡ w tym bonus za czas +{result.timeBonus}</div>
      )}
      {result.responseTime > 0 && (
        <div className="feedback__meta">Czas odpowiedzi {(result.responseTime / 1000).toFixed(1)} s</div>
      )}
      {!result.correct && result.correctAnswer != null && (
        <div className="feedback__correct">
          <span className="feedback__letter" style={{ '--ans': ANSWER_COLORS[result.correctAnswer % 4] }}>
            {letterFor(result.correctAnswer)}
          </span>
          <span className="feedback__answer">{correctText}</span>
        </div>
      )}
    </div>
  );
}

function Leaderboard({ players, meId, limit = 5 }) {
  if (!players?.length) return null;
  const myIndex = players.findIndex(p => p.id === meId);
  let rows = players.slice(0, limit).map((p, i) => ({ p, i }));
  if (myIndex >= limit) rows = [...rows.slice(0, limit - 1), { p: players[myIndex], i: myIndex, gap: true }];
  return (
    <ol className="board">
      {rows.map(({ p, i, gap }) => (
        <li key={p.id ?? i} className={`board__row ${p.id === meId ? 'is-me' : ''} ${gap ? 'is-gap' : ''}`}>
          <span className="board__rank">{rankOf(players, p.id)}</span>
          <Avatar avatar={p.avatar} size="xs" />
          <span className="board__name">{p.name}</span>
          <span className="board__score">{p.score ?? 0}</span>
        </li>
      ))}
    </ol>
  );
}

// Competition ranking: tied scores share the same place
const rankOf = (players, id) => {
  const me = players.find(p => p.id === id);
  if (!me) return null;
  return 1 + players.filter(p => (p.score || 0) > (me.score || 0)).length;
};

const rankEmoji = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎯');

export function RoundEndScreen({ player, round, standings, meId }) {
  const rank = rankOf(standings, meId);
  return (
    <div className="screen screen--scroll ranking">
      <PlayerHeader player={player} />
      <div className="eyebrow">Koniec rundy {round ?? ''}</div>
      <div className="rank-hero">
        <div className="rank-hero__emoji" aria-hidden="true">{rankEmoji(rank)}</div>
        <div className="rank-hero__place">
          {rank ? <>Miejsce <strong>{rank}</strong>{standings.length ? <span> / {standings.length}</span> : null}</> : 'Ranking'}
        </div>
        <div className="rank-hero__score">{player?.score ?? 0} pkt</div>
      </div>
      <Leaderboard players={standings} meId={meId} />
      <p className="subtitle">Za chwilę głosowanie na kolejną kategorię…</p>
    </div>
  );
}

export function FinishedScreen({ player, standings, meId, onNewGame }) {
  const rank = rankOf(standings, meId);
  return (
    <div className="screen screen--scroll ranking finished">
      <div className="eyebrow">Koniec gry</div>
      <div className="rank-hero rank-hero--final">
        <div className="rank-hero__emoji" aria-hidden="true">{rank === 1 ? '🏆' : rankEmoji(rank)}</div>
        <Avatar avatar={player?.avatar} size="lg" />
        <div className="hero-card__name">{player?.name}</div>
        {rank && <div className="rank-hero__place">Miejsce <strong>{rank}</strong><span> / {standings.length}</span></div>}
        <div className="rank-hero__score">{player?.score ?? 0} pkt</div>
      </div>
      <Leaderboard players={standings} meId={meId} />
      <p className="subtitle">Dzięki za grę!</p>
      <button type="button" className="btn btn--primary btn--block" onClick={onNewGame}>Nowa gra</button>
    </div>
  );
}
