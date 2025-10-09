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
          <div className="results-title">Wyniki graczy:</div>
          <div className="players-grid">
            {updatedPlayers
              .sort((a, b) => (b.lastPoints || 0) - (a.lastPoints || 0))
              .map((player, index) => (
              <div key={player.id} className={`player-result ${player.lastCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-rank">#{index + 1}</div>
                <div className="player-info-result">
                  <div className="player-avatar-result">{player.avatar}</div>
                  <div className="player-name-result">{player.name}</div>
                </div>
                <div className="player-answer-result">
                  {player.lastAnswer !== null ? (
                    <>
                      <div className="answer-chosen">
                        Odpowiedź: <strong>{String.fromCharCode(65 + player.lastAnswer)}</strong>
                      </div>
                      <div className={`answer-status ${player.lastCorrect ? 'correct' : 'wrong'}`}>
                        {player.lastCorrect ? '✅ Poprawna' : '❌ Błędna'}
                      </div>
                    </>
                  ) : (
                    <div className="no-answer">⏱️ Brak odpowiedzi</div>
                  )}
                </div>
                <div className="points-earned">
                  <div className="points-main">+{player.lastPoints || 0} pkt</div>
                  {player.lastTimeBonus > 0 && (
                    <div className="time-bonus">⚡ +{player.lastTimeBonus} za czas</div>
                  )}
                  {player.lastResponseTime && (
                    <div className="response-time">
                      ⏱️ {(player.lastResponseTime / 1000).toFixed(1)}s
                    </div>
                  )}
                </div>
                <div className="total-score">
                  Łącznie: <strong>{player.score} pkt</strong>
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