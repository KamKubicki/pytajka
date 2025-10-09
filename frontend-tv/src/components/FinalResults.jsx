import React from 'react';

function FinalResults({ players, onResetGame }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  return (
    <div className="tv-container">
      <div className="final-results">
        <h1 className="game-title">🏆 Koniec gry!</h1>
        
        <div className="podium">
          {sortedPlayers.slice(0, 3).map((player, index) => (
            <div key={player.id} className={`podium-place ${['second', 'first', 'third'][index]}`}>
              <div className="player-avatar" style={{fontSize: '3rem'}}>{player.avatar}</div>
              <div className="player-name">{player.name}</div>
              <div className="player-score">{player.score} pkt</div>
              <div style={{fontSize: '2rem'}}>{['🥈', '🥇', '🥉'][index]}</div>
            </div>
          ))}
        </div>

        <button className="start-button" onClick={onResetGame}>
          Nowa gra
        </button>
      </div>
    </div>
  );
}

export default FinalResults;