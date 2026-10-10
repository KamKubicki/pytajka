import React from 'react';
import PlayerStrip from './PlayerStrip';

const LETTERS = ['A', 'B', 'C', 'D'];

const questionSizeClass = (text = '') => {
  const len = text.length;
  if (len > 200) return 'q-xxlong';
  if (len > 130) return 'q-xlong';
  if (len > 70) return 'q-long';
  return '';
};

const answersSizeClass = (answers = []) => {
  const max = answers.reduce((m, a) => Math.max(m, String(a ?? '').length), 0);
  if (max > 70) return 'ans-xlong';
  if (max > 35) return 'ans-long';
  return '';
};

function TimerRing({ timer, timeLimit, stopped }) {
  const fraction = Math.max(0, Math.min(1, timer / (timeLimit || 15)));
  const urgent = !stopped && timer <= 3;
  return (
    <div className={`timer-ring ${urgent ? 'urgent' : ''} ${stopped ? 'stopped' : ''}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="timer-track" cx="50" cy="50" r="44" />
        <circle
          className="timer-fill"
          cx="50" cy="50" r="44"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - fraction * 100}
        />
      </svg>
      <span className="timer-value">{stopped ? '⏹' : timer}</span>
    </div>
  );
}

function Question({ question, meta = {}, timer, players = [], answeredIds, answerCount, showCorrectAnswer }) {
  if (!question) {
    return (
      <main className="screen screen-center">
        <div className="loading-pulse">Przygotowuję pytanie…</div>
      </main>
    );
  }

  const answers = question.answers || [];
  const category = meta.roundCategory;
  const timeLimit = meta.timeLimit || 15;
  const answeredSize = answeredIds?.size ?? 0;
  const answered = Math.max(answeredSize, answerCount?.total || 0);
  const connected = players.filter(p => p.connected !== false);
  const total = answerCount?.players || connected.length;
  const hasCorrect = showCorrectAnswer && Number.isInteger(question.correct);
  const hitIds = showCorrectAnswer ? players.filter(p => p.lastCorrect).map(p => p.id) : null;
  const hitPlayers = showCorrectAnswer ? players.filter(p => p.lastCorrect) : [];

  const roundLabel = meta.round && meta.totalRounds ? `Runda ${meta.round}/${meta.totalRounds}` : null;
  const qLabel = meta.questionInRound && meta.questionsPerRound
    ? `Pytanie ${meta.questionInRound}/${meta.questionsPerRound}`
    : meta.questionNumber && meta.totalQuestions
      ? `Pytanie ${meta.questionNumber}/${meta.totalQuestions}`
      : null;

  return (
    <main
      className={`screen question-screen ${question.image ? 'has-image' : ''} ${showCorrectAnswer ? 'is-revealed' : ''}`}
      style={category?.color ? { '--cat-color': category.color } : undefined}
    >
      <header className="q-header">
        <div className="q-category">
          {category?.icon && <span className="q-category-icon">{category.icon}</span>}
          <span className="q-category-name">{category?.name || question.category || 'Pytanie'}</span>
        </div>
        <div className="q-progress">
          {[roundLabel, qLabel].filter(Boolean).join(' · ')}
        </div>
        <TimerRing timer={timer} timeLimit={timeLimit} stopped={showCorrectAnswer} />
      </header>

      <section className="q-body">
        <h1 className={`q-text ${questionSizeClass(question.question)}`}>{question.question}</h1>
        {question.image && (
          <div className="q-image">
            <img src={question.image} alt="Ilustracja do pytania" />
          </div>
        )}
      </section>

      <section className={`answers-grid ${answersSizeClass(answers)}`}>
        {answers.map((answer, index) => {
          const isCorrect = hasCorrect && index === question.correct;
          const isDim = hasCorrect && !isCorrect;
          return (
            <div
              key={index}
              className={`answer-card ans-${index} ${isCorrect ? 'is-correct' : ''} ${isDim ? 'is-dim' : ''}`}
            >
              <span className="answer-letter">{LETTERS[index]}</span>
              <span className="answer-text">{answer}</span>
              {isCorrect && <span className="answer-check">✓</span>}
            </div>
          );
        })}
      </section>

      <footer className="q-footer">
        {showCorrectAnswer ? (
          <div className="answer-status">
            <div className={`answer-counter ${hitPlayers.length ? 'is-hit' : 'is-miss'}`}>
              <span className="counter-label">Trafili</span>
              <span className="counter-value">{hitPlayers.length}<small>/{connected.length || players.length}</small></span>
            </div>
            <div className="reveal-main">
              {question.explanation && (
                <div className="reveal-explanation">💡 {question.explanation}</div>
              )}
              <PlayerStrip players={players} highlightIds={hitIds} dimOthers />
            </div>
          </div>
        ) : (
          <div className="answer-status">
            <div className="answer-counter">
              <span className="counter-label">Odpowiedzi</span>
              <span className="counter-value">{answered}<small>/{total}</small></span>
            </div>
            <PlayerStrip players={players} doneIds={answeredIds} />
          </div>
        )}
      </footer>
    </main>
  );
}

export default Question;
