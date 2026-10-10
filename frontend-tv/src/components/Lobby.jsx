import React, { useState, useEffect } from 'react';

function Lobby({ sessionId, qrCode, joinUrl, localIP, players, gameSettings, totalQuestionCount, onStartGame }) {
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

  return (
    <div className="tv-container">
      <h1 className="game-title">❓ Pytajka</h1>

      <div className="lobby-main-grid">
        {/* Left Column - QR Code & Join Info */}
        <div className="lobby-qr-section">
          <div className="session-info-box">
            <div className="session-id-display">
              <span className="session-label">Kod gry:</span>
              <span className="session-code">{sessionId}</span>
            </div>

            {qrCode && (
              <div className="qr-code-wrapper">
                <img src={qrCode} alt="QR Code" className="qr-image" />
                <div className="qr-instruction">Zeskanuj kodem QR</div>
              </div>
            )}

            {joinUrl && (
              <div className="join-url-box">
                <div className="url-label">Lub wejdź na:</div>
                <div className="url-text">{joinUrl}</div>
              </div>
            )}
          </div>
        </div>

        {/* Middle Column - Players Grid */}
        <div className="lobby-players-section">
          <div className="players-header">
            <span className="players-icon">👥</span>
            <span className="players-count-text">Gracze ({players.length})</span>
          </div>

          <div className="players-grid-container">
            {players.length === 0 ? (
              <div className="no-players-message">
                <div className="waiting-icon">⏳</div>
                <div>Czekam na graczy...</div>
              </div>
            ) : (
              <div className="players-grid">
                {players.map(player => (
                  <div key={player.id} className="player-card">
                    <div className="player-avatar">{player.avatar}</div>
                    <div className="player-name">{player.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="lobby-settings-section">
          <div className="settings-box">
            <h3 className="settings-title">⚙️ Ustawienia</h3>

            <div className="setting-group">
              <label className="setting-label">Rundy:</label>
              <input
                type="number"
                className="setting-input"
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                min="1"
                max="10"
              />
            </div>

            <div className="setting-group">
              <label className="setting-label">Pytania/runda:</label>
              <input
                type="number"
                className="setting-input"
                value={questionsPerRound}
                onChange={(e) => setQuestionsPerRound(Number(e.target.value))}
                min="1"
                max="20"
              />
            </div>

            <div className="settings-summary">
              <div className="summary-item">
                <span className="summary-label">Łącznie pytań:</span>
                <span className="summary-value">{rounds * questionsPerRound}</span>
              </div>
              {gameSettings?.showQuestionCountOnStartScreen && (
                <div className="summary-item">
                  <span className="summary-label">W bazie:</span>
                  <span className="summary-value">{totalQuestionCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Start Button - Bottom */}
      <div className="lobby-start-section">
        <button
          className="start-game-button"
          onClick={handleStartGame}
          disabled={players.length === 0}
        >
          {players.length === 0 ? '⏳ Czekam na graczy...' : '🎮 Rozpocznij grę!'}
        </button>
      </div>
    </div>
  );
}

export default Lobby;