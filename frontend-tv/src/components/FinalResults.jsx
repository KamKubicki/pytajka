import React from 'react';

function FinalResults({ players, onResetGame }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Correctly map podium positions
  const podiumOrder = [
    { player: sortedPlayers[1], class: 'second', medal: '🥈', position: 2 },  // 2nd place on left
    { player: sortedPlayers[0], class: 'first', medal: '🥇', position: 1 },    // 1st place in center (highest)
    { player: sortedPlayers[2], class: 'third', medal: '🥉', position: 3 }     // 3rd place on right
  ].filter(item => item.player); // Filter out undefined players

  return (
    <div className="tv-container">
      <div className="final-results">
        <h1 className="game-title">🏆 Koniec gry!</h1>

        <div className="podium">
          {podiumOrder.map((item, idx) => (
            <div key={item.player.id} className={`podium-place ${item.class}`}>
              <div className="podium-medal">{item.medal}</div>
              <div className="player-avatar" style={{fontSize: '3rem'}}>{item.player.avatar}</div>
              <div className="player-name">{item.player.name}</div>
              <div className="player-score">{item.player.score} pkt</div>
            </div>
          ))}
        </div>

        {sortedPlayers.length > 3 && (
          <div className="other-players">
            <h3 className="other-players-title">Pozostali gracze:</h3>
            <div className="other-players-list">
              {sortedPlayers.slice(3).map((player, index) => (
                <div key={player.id} className="other-player-item">
                  <span className="other-rank">#{index + 4}</span>
                  <span className="other-avatar">{player.avatar}</span>
                  <span className="other-name">{player.name}</span>
                  <span className="other-score">{player.score} pkt</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="start-button" onClick={onResetGame}>
          Nowa gra
        </button>
      </div>
    </div>
  );
}

export default FinalResults;