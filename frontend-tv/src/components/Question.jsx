import React from 'react';

function Question({ currentQuestion, timer, players, realTimeAnswers, showCorrectAnswer }) {
  if (!currentQuestion) {
    return (
      <div className="tv-container">
        <div className="question-container">
          <div>Przygotowywanie pytania...</div>
          <div style={{marginTop: '1rem'}}>Graczy: {players.length}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tv-container">
      <div className="question-container">
        <div className="question-header">
          {currentQuestion.category && (
            <div className="question-category-left">
              📚 {currentQuestion.category}
            </div>
          )}
          <div className="timer-right">{timer}</div>
        </div>
        <div className="question-text">{currentQuestion.question}</div>
        
        {/* Visual question image */}
        {currentQuestion.image && (
          <div className="question-image">
            <img 
              src={currentQuestion.image} 
              alt="Pytanie wizualne" 
              style={{
                maxWidth: '400px',
                maxHeight: '300px',
                borderRadius: '8px',
                border: '2px solid #2c5530',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        
        <div className="answers-arena">
          {currentQuestion.answers.map((answer, index) => {
            const playersForThisAnswer = Array.from(realTimeAnswers.entries())
              .filter(([playerId, playerAnswer]) => playerAnswer.answer === index)
              .map(([playerId, playerAnswer]) => {
                const player = players.find(p => p.id === playerId);
                return {
                  playerId,
                  playerName: player?.name || 'Nieznany gracz',
                  playerAvatar: player?.avatar || '👤',
                  responseTime: playerAnswer.responseTime,
                  answer: playerAnswer.answer
                };
              });
            
            const isCorrect = showCorrectAnswer && index === currentQuestion.correct;

            return (
              <div
                key={index}
                className={`answer-column ${isCorrect ? 'correct' : ''}`}
              >
                {isCorrect && (
                  <div className="correct-answer-badge">
                    ✅ POPRAWNA ODPOWIEDŹ
                  </div>
                )}
                <div className="answer-header">
                  <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="answer-text">{answer}</span>
                </div>

                <div className="players-for-answer">
                  {playersForThisAnswer.map(playerData => (
                    <div
                      key={playerData.playerId}
                      className={`player-choice ${showCorrectAnswer ? (index === currentQuestion.correct ? 'correct-choice' : 'wrong-choice') : ''}`}
                    >
                      <div className="player-avatar">{playerData.playerAvatar}</div>
                      <div className="player-name">{playerData.playerName}</div>
                      {playerData.responseTime && (
                        <div className="response-time-display">
                          ⏱️ {(playerData.responseTime / 1000).toFixed(1)}s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation after showing correct answer */}
        {showCorrectAnswer && currentQuestion.explanation && (
          <div className="question-explanation">
            <div className="explanation-icon">💡</div>
            <div className="explanation-text">{currentQuestion.explanation}</div>
          </div>
        )}

        <div className="game-stats">
          <div>Odpowiedzi: {realTimeAnswers.size}/{players.length}</div>
          <div>Pozostało: {timer}s</div>
        </div>
      </div>
    </div>
  );
}

export default Question;