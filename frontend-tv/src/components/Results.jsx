import React from 'react';

const LETTERS = ['A', 'B', 'C', 'D'];

function Results({ resultsData, meta = {} }) {
  if (!resultsData) return null;

  const { correctAnswer, questionData = {} } = resultsData;
  const updatedPlayers = resultsData.updatedPlayers || [];
  const correctAnswerText = questionData.answers?.[correctAnswer];
  const sorted = [...updatedPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));
  const hits = updatedPlayers.filter(p => p.lastCorrect);
  const fastest = hits
    .filter(p => Number.isFinite(p.lastResponseTime))
    .reduce((best, p) => (!best || p.lastResponseTime < best.lastResponseTime ? p : best), null);
  const cols = sorted.length > 10 ? 'two-col' : '';
  const category = meta.roundCategory;

  return (
    <main className="screen results-screen">
      <header className="results-header">
        <div className="eyebrow">
          {category?.icon} {category?.name || questionData.category || 'Wyniki'}
          {meta.round && meta.totalRounds ? ` · Runda ${meta.round}/${meta.totalRounds}` : ''}
        </div>
        <h1 className="screen-title">Wyniki pytania</h1>
      </header>

      <aside className="results-answer panel">
        <div className="panel-title"><span>Poprawna odpowiedź</span></div>
        {Number.isInteger(correctAnswer) && (
          <div className={`correct-answer ans-${correctAnswer}`}>
            <span className="answer-letter">{LETTERS[correctAnswer]}</span>
            <span className="answer-text">{correctAnswerText}</span>
          </div>
        )}
        {questionData.explanation && (
          <p className="results-explanation">💡 {questionData.explanation}</p>
        )}
        <div className="results-stats">
          <div className="stat">
            <span className="stat-value">{hits.length}<small>/{updatedPlayers.length}</small></span>
            <span className="stat-label">trafień</span>
          </div>
          {fastest && (
            <div className="stat stat-fastest">
              <span className="stat-value">{fastest.avatar} {(fastest.lastResponseTime / 1000).toFixed(1)}s</span>
              <span className="stat-label">⚡ najszybciej: {fastest.name}</span>
            </div>
          )}
        </div>
      </aside>

      <section className="results-ranking panel">
        <div className="panel-title"><span>Ranking</span></div>
        <ol className={`ranking-list ${cols}`} style={{ '--rows': cols ? Math.ceil(sorted.length / 2) : Math.max(sorted.length, 1) }}>
          {sorted.map((p, i) => {
            const answered = p.lastAnswer !== null && p.lastAnswer !== undefined;
            return (
              <li key={p.id} className={`ranking-row ${p.lastCorrect ? 'is-hit' : 'is-miss'}`}>
                <span className="rank-pos">{i + 1}</span>
                <span className="rank-avatar">{p.avatar}</span>
                <span className="rank-name">{p.name}</span>
                <span className="rank-gain">
                  {p.lastPoints > 0 ? `+${p.lastPoints}` : answered ? '✗' : '—'}
                </span>
                <span className="rank-score">{p.score}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

export default Results;
