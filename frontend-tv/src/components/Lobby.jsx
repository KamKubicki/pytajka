import React, { useState, useEffect } from 'react';

function Stepper({ label, value, min, max, onChange }) {
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-controls">
        <button type="button" className="stepper-btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} mniej`}>−</button>
        <span className="stepper-value">{value}</span>
        <button type="button" className="stepper-btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} więcej`}>+</button>
      </div>
    </div>
  );
}

function Lobby({ sessionId, qrCode, joinUrl, players = [], gameSettings, totalQuestionCount, onStartGame }) {
  const [rounds, setRounds] = useState(gameSettings?.rounds || 5);
  const [questionsPerRound, setQuestionsPerRound] = useState(gameSettings?.questionsPerRound || 5);

  // gameSettings arrive asynchronously after mount - apply backend defaults once loaded
  useEffect(() => {
    if (gameSettings?.rounds) setRounds(gameSettings.rounds);
    if (gameSettings?.questionsPerRound) setQuestionsPerRound(gameSettings.questionsPerRound);
  }, [gameSettings]);

  const handleStartGame = () => {
    // Backend rejects out-of-range values (silently for the TV), so clamp here
    const clamp = (v, min, max) => Math.min(max, Math.max(min, Math.round(v) || min));
    onStartGame({ rounds: clamp(rounds, 1, 10), questionsPerRound: clamp(questionsPerRound, 1, 20) });
  };

  const density = players.length > 21 ? 'dense' : players.length > 10 ? 'medium' : 'roomy';

  return (
    <main className="screen lobby-screen">
      <header className="lobby-header">
        <h1 className="brand">Pytajka<span className="brand-dot">?</span></h1>
        <p className="brand-tagline">Quiz na żywo · dołącz telefonem</p>
      </header>

      <section className="lobby-join panel">
        <div className="join-code-label">Kod gry</div>
        <div className="join-code">{sessionId || '······'}</div>
        <div className="qr-frame">
          {qrCode ? <img src={qrCode} alt="Kod QR do dołączenia" /> : <div className="qr-placeholder">…</div>}
        </div>
        {joinUrl && <div className="join-url">{joinUrl.replace(/^https?:\/\//, '')}</div>}
      </section>

      <section className="lobby-players panel">
        <div className="panel-title">
          <span>Gracze</span>
          <span className="pill">{players.length}</span>
        </div>
        {players.length === 0 ? (
          <div className="lobby-empty">
            <div className="lobby-empty-icon">📱</div>
            <div>Zeskanujcie kod i dołączcie!</div>
          </div>
        ) : (
          <ul className={`lobby-player-grid ${density}`}>
            {players.map(player => (
              <li key={player.id} className="lobby-player">
                <span className="lobby-player-avatar">{player.avatar}</span>
                <span className="lobby-player-name">{player.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="lobby-settings panel">
        <div className="panel-title"><span>Ustawienia</span></div>
        <Stepper label="Rundy" value={rounds} min={1} max={10} onChange={setRounds} />
        <Stepper label="Pytania w rundzie" value={questionsPerRound} min={1} max={20} onChange={setQuestionsPerRound} />
        <div className="settings-total">
          <span>Łącznie pytań</span>
          <strong>{rounds * questionsPerRound}</strong>
        </div>
        {gameSettings?.showQuestionCountOnStartScreen && (
          <div className="settings-total muted">
            <span>W bazie</span>
            <strong>{totalQuestionCount}</strong>
          </div>
        )}
        <p className="settings-hint">Przed każdą rundą gracze głosują na kategorię.</p>
        <button
          type="button"
          className="btn-primary"
          onClick={handleStartGame}
          disabled={players.length === 0}
        >
          {players.length === 0 ? 'Czekam na graczy…' : 'Start gry ▶'}
        </button>
      </section>
    </main>
  );
}

export default Lobby;
