import React from 'react';
import Podium from './Podium';

function FinalResults({ players = [], onResetGame }) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sorted[0];

  return (
    <main className="screen podium-screen final-screen">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
      </div>
      <header className="results-header">
        <div className="eyebrow">Koniec gry</div>
        <h1 className="screen-title final-title">
          {winner ? <>Wygrywa <span className="winner-name">{winner.name}</span>!</> : 'Koniec gry!'}
        </h1>
      </header>
      <section className="podium-area">
        <Podium sorted={sorted} big />
      </section>
      <footer className="screen-footnote">
        <button type="button" className="btn-primary btn-small" onClick={onResetGame}>Nowa gra ↻</button>
      </footer>
    </main>
  );
}

export default FinalResults;
