import React from 'react';
import Podium from './Podium';

function RoundSummary({ round, totalRounds, players }) {
  const sorted = [...(players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <main className="screen podium-screen round-summary">
      <header className="results-header">
        <div className="eyebrow">Koniec rundy {round}{totalRounds ? ` z ${totalRounds}` : ''}</div>
        <h1 className="screen-title">Ranking po rundzie</h1>
      </header>
      <section className="podium-area">
        <Podium sorted={sorted} />
      </section>
      <footer className="screen-footnote">Za chwilę głosowanie na kolejną kategorię…</footer>
    </main>
  );
}

export default RoundSummary;
