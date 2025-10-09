import React from 'react';

function Preparing({ questionNumber, totalQuestions, prepareTimer }) {
  return (
    <div className="tv-container">
      <div className="question-container">
        <div className="prepare-title">🎯 Pytanie {questionNumber}/{totalQuestions}</div>
        <div className="prepare-text">Przygotujcie się!</div>
        <div className="prepare-timer">{prepareTimer}</div>
        <div className="prepare-subtitle">Za chwilę pojawi się pytanie...</div>
      </div>
    </div>
  );
}

export default Preparing;