import React, { useState } from 'react';

function Lobby({ sessionId, qrCode, joinUrl, localIP, players, gameSettings, totalQuestionCount, onStartGame }) {
  const [rounds, setRounds] = useState(gameSettings?.rounds || 5);
  const [questionsPerRound, setQuestionsPerRound] = useState(gameSettings?.questionsPerRound || 5);

  const handleStartGame = () => {
    onStartGame({ rounds, questionsPerRound });
  };

  return (
    <div className="tv-container lobby-container">
      <h1 className="game-title">❓ Pytajka</h1>
      
      <div className="lobby-layout">
        {/* Left side - QR Code and main info */}
        <div className="lobby-left">
          <div className="session-info">
            <div className="session-id">Kod gry: {sessionId}</div>
            <div className="join-instruction">Zeskanuj QR kod telefonem, aby dołączyć!</div>
            
            {qrCode && (
              <div className="qr-container">
                <img src={qrCode} alt="QR Code" />
              </div>
            )}
            
            {joinUrl && (
              <div className="join-url">
                Lub wejdź na: {joinUrl}
              </div>
            )}
            
            {localIP && (
              <div className="ip-info">
                IP sieciowy: {localIP}:3002
              </div>
            )}
          </div>

          <div className="players-count">
            <span className="players-icon">👥</span>
            <span className="players-text">Graczy: {players.length}</span>
          </div>
        </div>

        {/* Right side - Stats and Settings */}
        <div className="lobby-right">
          <div className="stats-section">
            <h3>📊 Statystyki</h3>
            {gameSettings?.showQuestionCountOnStartScreen && (
              <div className="stat-item">
                <span className="stat-label">Pytania w bazie:</span>
                <span className="stat-value">{totalQuestionCount}</span>
              </div>
            )}
            <div className="stat-item">
              <span className="stat-label">Łączne pytania:</span>
              <span className="stat-value">{rounds * questionsPerRound}</span>
            </div>
          </div>

          <div className="game-config">
            <h3>⚙️ Ustawienia gry</h3>
            <div className="config-item">
              <label>Rundy:</label>
              <input 
                type="number" 
                value={rounds} 
                onChange={(e) => setRounds(Number(e.target.value))}
                min="1"
                max="10"
              />
            </div>
            <div className="config-item">
              <label>Pytania na rundę:</label>
              <input 
                type="number" 
                value={questionsPerRound} 
                onChange={(e) => setQuestionsPerRound(Number(e.target.value))}
                min="1"
                max="20"
              />
            </div>
          </div>
        </div>
      </div>

      {players.length > 0 && (
        <div className="players-container">
          {players.map(player => (
            <div key={player.id} className="player-card">
              <div className="player-avatar">{player.avatar}</div>
              <div className="player-name">{player.name}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{paddingBottom: '2rem'}}>
        <button 
          className="start-button" 
          onClick={handleStartGame}
          disabled={players.length === 0}
        >
          {players.length === 0 ? 'Czekam na graczy...' : 'Rozpocznij grę!'}
        </button>
      </div>
    </div>
  );
}

export default Lobby;