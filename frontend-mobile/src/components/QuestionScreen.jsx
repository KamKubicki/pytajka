import React from 'react';
import PlayerHeader from './PlayerHeader';
import TimerBar from './TimerBar';
import { ANSWER_COLORS, letterFor } from '../config';

const questionSizeClass = (text = '') => {
  const len = text.length;
  if (len > 160) return 'q-text--xs';
  if (len > 100) return 'q-text--sm';
  if (len > 55) return 'q-text--md';
  return 'q-text--lg';
};

export default function QuestionScreen({
  player,
  question,
  meta,
  phase, // 'playing' | 'answered' | 'results'
  selectedAnswer,
  lastResult,
  timer,
  onAnswer
}) {
  const answers = Array.isArray(question?.answers) ? question.answers : [];
  const longest = answers.reduce((m, a) => Math.max(m, String(a ?? '').length), 0);
  const layout = longest <= 16 ? 'answers--grid' : 'answers--list';
  const answerSize = longest > 60 ? 'answers--small' : '';

  const category = meta?.roundCategory;
  const categoryName = category?.name || question?.category;
  const categoryColor = category?.color || 'var(--accent)';

  const qNum = meta?.questionInRound ?? meta?.questionNumber;
  const qTotal = meta?.questionInRound != null ? meta?.questionsPerRound : meta?.totalQuestions;

  const revealed = phase === 'results' && lastResult && lastResult.correctAnswer != null;
  const locked = phase !== 'playing' || timer <= 0;
  const timeUp = phase === 'playing' && timer <= 0;

  let status = null;
  if (phase === 'answered') {
    status = (
      <div className="status status--wait">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        Wysłano {letterFor(selectedAnswer)} · czekamy na innych…
      </div>
    );
  } else if (timeUp) {
    status = <div className="status status--bad">⏰ Czas minął</div>;
  } else if (revealed) {
    status = lastResult.correct ? (
      <div className="status status--good">✔ Dobrze! +{lastResult.pointsEarned} pkt</div>
    ) : (
      <div className="status status--bad">
        {selectedAnswer == null ? 'Brak odpowiedzi' : '✘ Pudło'} · poprawna: {letterFor(lastResult.correctAnswer)}
      </div>
    );
  }

  return (
    <div className="screen screen--fixed question" style={{ '--cat': categoryColor }}>
      <PlayerHeader player={player} />

      <div className="q-meta">
        {categoryName && (
          <span className="chip chip--cat">
            {category?.icon && <span aria-hidden="true">{category.icon}</span>}
            <span className="chip__text">{categoryName}</span>
          </span>
        )}
        {qNum != null && (
          <span className="chip">
            Pytanie {qNum}{qTotal ? `/${qTotal}` : ''}
          </span>
        )}
      </div>

      <TimerBar left={timer} total={meta?.timeLimit || 15} />

      <div className="q-body">
        <h2 className={`q-text ${questionSizeClass(question?.question)}`}>{question?.question}</h2>
        {question?.image && (
          <div className="q-image">
            <img src={question.image} alt="Ilustracja do pytania" />
          </div>
        )}
      </div>

      <div className={`answers ${layout} ${answerSize}`}>
        {answers.map((answer, index) => {
          const classes = ['answer'];
          let color = ANSWER_COLORS[index % ANSWER_COLORS.length];
          if (revealed && index === lastResult.correctAnswer) color = 'var(--good)';
          else if (revealed && selectedAnswer === index) color = 'var(--bad)';
          if (selectedAnswer === index) classes.push('is-selected');
          if (selectedAnswer != null && selectedAnswer !== index && !revealed) classes.push('is-dimmed');
          if (revealed) {
            if (index === lastResult.correctAnswer) classes.push('is-correct');
            else if (selectedAnswer === index) classes.push('is-wrong');
            else classes.push('is-dimmed');
          }
          if (timeUp) classes.push('is-dimmed');
          return (
            <button
              key={index}
              type="button"
              className={classes.join(' ')}
              style={{ '--ans': color }}
              onClick={() => onAnswer(index)}
              disabled={locked}
              aria-pressed={selectedAnswer === index}
            >
              <span className="answer__letter">{letterFor(index)}</span>
              <span className="answer__text">{answer}</span>
              {revealed && index === lastResult.correctAnswer && <span className="answer__mark" aria-label="poprawna">✔</span>}
              {revealed && selectedAnswer === index && index !== lastResult.correctAnswer && <span className="answer__mark" aria-label="błędna">✘</span>}
            </button>
          );
        })}
      </div>

      <div className="q-status" aria-live="polite">{status}</div>
    </div>
  );
}
