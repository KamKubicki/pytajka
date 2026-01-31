import React from 'react';

function Results({ resultsData }) {
  if (!resultsData) return null;

  const { correctAnswer, updatedPlayers, questionData } = resultsData;
  const correctAnswerText = questionData.answers[correctAnswer];

  return (
    <div className="tv-container">
      <div className="results-summary-container">
        <div className="summary-header">
          <div className="summary-title">📊 Podsumowanie Pytania</div>
          {questionData.category && (
            <div className="summary-category">{questionData.category}</div>
          )}
        </div>

        <div className="correct-answer-display">
          <div className="correct-answer-label">Poprawna odpowiedź:</div>
          <div className="correct-answer-text">
            <span className="answer-letter">{String.fromCharCode(65 + correctAnswer)}</span>
            <span className="answer-content">{correctAnswerText}</span>
          </div>
          {questionData.explanation && (
            <div className="answer-explanation">
              💡 {questionData.explanation}
            </div>
          )}
        </div>

        <div className="fastest-player">
          {(() => {
            const correctPlayers = updatedPlayers.filter(p => p.lastCorrect && p.lastResponseTime);
            if (correctPlayers.length > 0) {
              const fastest = correctPlayers.reduce((prev, current) => 
                (prev.lastResponseTime < current.lastResponseTime) ? prev : current
              );
              return (
                <div className="fastest-display">
                  <div className="fastest-title">⚡ Najszybsza poprawna odpowiedź:</div>
                  <div className="fastest-info">
                    <span className="fastest-avatar">{fastest.avatar}</span>
                    <span className="fastest-name">{fastest.name}</span>
                    <span className="fastest-time">{(fastest.lastResponseTime / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        <div className="players-results">
          <div className="players-grid-compact">
            {updatedPlayers
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
              <div key={player.id} className={`player-result-compact ${player.lastCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-rank-compact">#{index + 1}</div>
                <div className="player-info-compact">
                  <div className="player-avatar-compact">{player.avatar}</div>
                  <div className="player-name-compact">{player.name}</div>
                </div>
                <div className="scores-display">
                  <div className="total-score-large">{player.score}</div>
                  <div className="score-details">
                    <div className="points-earned-compact">
                      {player.lastPoints > 0 ? `+${player.lastPoints}` : '0'}
                      {player.lastTimeBonus > 0 && <span className="bonus-inline">⚡+{player.lastTimeBonus}</span>}
                    </div>
                  </div>
                </div>
                <div className="answer-mini">
                  {player.lastAnswer !== null ? (
                    <span className={`answer-indicator ${player.lastCorrect ? 'correct' : 'wrong'}`}>
                      {player.lastCorrect ? '✅' : '❌'} {String.fromCharCode(65 + player.lastAnswer)}
                    </span>
                  ) : (
                    <span className="answer-indicator no-answer">⏱️</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="next-question-info">
          <div className="summary-countdown">Za chwilę następne pytanie...</div>
        </div>
      </div>
    </div>
  );
}

export default Results;