import React from 'react';

function RoundSummary({ round, players }) {
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const topThree = sortedPlayers.slice(0, 3);

  return (
    <div className="tv-container">
      <div className="round-summary-container">
        <div className="round-summary-header">
          <h1 className="round-summary-title">🎯 Podsumowanie Rundy {round}</h1>
          <p className="round-summary-subtitle">Ranking po rundzie</p>
        </div>

        {/* Top 3 Podium */}
        <div className="round-podium">
          {topThree.length >= 2 && (
            <div className="podium-place second">
              <div className="podium-rank">🥈</div>
              <div className="podium-avatar">{topThree[1].avatar}</div>
              <div className="podium-name">{topThree[1].name}</div>
              <div className="podium-score">{topThree[1].score} pkt</div>
            </div>
          )}

          {topThree.length >= 1 && (
            <div className="podium-place first">
              <div className="podium-rank">🥇</div>
              <div className="podium-avatar">{topThree[0].avatar}</div>
              <div className="podium-name">{topThree[0].name}</div>
              <div className="podium-score">{topThree[0].score} pkt</div>
            </div>
          )}

          {topThree.length >= 3 && (
            <div className="podium-place third">
              <div className="podium-rank">🥉</div>
              <div className="podium-avatar">{topThree[2].avatar}</div>
              <div className="podium-name">{topThree[2].name}</div>
              <div className="podium-score">{topThree[2].score} pkt</div>
            </div>
          )}
        </div>

        {/* Full Rankings */}
        {sortedPlayers.length > 3 && (
          <div className="round-full-rankings">
            <h3 className="rankings-title">Pełny ranking:</h3>
            <div className="rankings-grid">
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className={`ranking-item ${index < 3 ? 'top-three' : ''}`}>
                  <div className="ranking-position">#{index + 1}</div>
                  <div className="ranking-avatar">{player.avatar}</div>
                  <div className="ranking-name">{player.name}</div>
                  <div className="ranking-score">{player.score} pkt</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="round-summary-footer">
          <div className="continue-message">🎮 Za chwilę następna runda...</div>
        </div>
      </div>
    </div>
  );
}

export default RoundSummary;
