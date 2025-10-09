import React from 'react';

function Break({ breakTimer, questionNumber, totalQuestions }) {
  return (
    <div className="tv-container">
      <div className="question-container">
        <div className="prepare-title">⏸️ Przerwa</div>
        <div className="prepare-text">Czas na oddech!</div>
        <div className="prepare-timer">{breakTimer}</div>
        <div className="prepare-subtitle">Za chwilę następne pytanie {questionNumber}/{totalQuestions}...</div>
      </div>
    </div>
  );
}

export default Break;