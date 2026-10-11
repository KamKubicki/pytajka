import React, { useLayoutEffect, useRef, useState } from 'react';
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

// Grace period after the answers become available (question start, or the
// last sabotage obstacle cleared). Taps that were already "in flight" – the
// finishing tap of a minigame, frantic tapping on the vote / results screen –
// must not pick an answer by accident.
export const ANSWER_ARM_MS = 400;

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// Is the pointer still on the element (pointerup after sliding away = cancel)?
// A little slack: the pressed button is shifted by its :active transform.
const INSIDE_SLACK_PX = 12;
const isInside = (el, e) => {
  if (!el || typeof e.clientX !== 'number') return false;
  const r = el.getBoundingClientRect();
  const k = INSIDE_SLACK_PX;
  return e.clientX >= r.left - k && e.clientX <= r.right + k && e.clientY >= r.top - k && e.clientY <= r.bottom + k;
};

export default function QuestionScreen({
  player,
  question,
  meta,
  phase, // 'playing' | 'answered' | 'results'
  selectedAnswer,
  lastResult,
  timer,
  onAnswer,
  obstructed = false, // sabotage minigame in progress
  headerExtra = null
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
  const locked = phase !== 'playing' || timer <= 0 || obstructed;
  const timeUp = phase === 'playing' && timer <= 0;

  // --- ghost-tap protection -------------------------------------------------
  // `armed` turns true ANSWER_ARM_MS after the answers get unlocked (for every
  // question and after every obstacle). An answer is accepted only from a
  // gesture whose pointerdown started on that very button after arming and
  // whose pointerup ends on it. Browser-generated clicks are ignored; only a
  // keyboard / assistive-tech click (detail === 0) on the focused button works.
  const [armed, setArmed] = useState(false);
  const armedAtRef = useRef(Infinity); // time the current unlock became tappable
  const pressRef = useRef(null); // { index, pointerId } of a valid pointerdown
  const questionKey = question?.id ?? question?.question;

  // Layout effect: the reset happens before the browser paints / dispatches
  // the next input event, so a new question is never tappable for a frame.
  useLayoutEffect(() => {
    setArmed(false);
    armedAtRef.current = Infinity;
    pressRef.current = null;
    if (locked) return undefined;
    const t = setTimeout(() => {
      armedAtRef.current = now();
      setArmed(true);
    }, ANSWER_ARM_MS);
    return () => clearTimeout(t);
  }, [locked, questionKey]);

  const ready = !locked && armed;
  // armedAtRef is Infinity until the grace period is over
  const isArmed = () => !locked && now() >= armedAtRef.current;

  const onPointerDown = (index) => (e) => {
    if (!e.isPrimary) return; // extra fingers / palm never touch the ongoing press
    pressRef.current = null;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // must start after arming – also rejects an event that was queued before
    // (e.timeStamp shares the performance.now() clock)
    if (!isArmed() || e.timeStamp < armedAtRef.current) return;
    pressRef.current = { index, pointerId: e.pointerId };
  };

  const onPointerUp = (index) => (e) => {
    const press = pressRef.current;
    if (!press || press.pointerId !== e.pointerId) return;
    pressRef.current = null;
    if (press.index !== index || !isArmed() || !isInside(e.currentTarget, e)) return;
    onAnswer(index);
  };

  const onPointerCancel = (e) => {
    if (pressRef.current?.pointerId === e.pointerId) pressRef.current = null;
  };

  const onClick = (index) => (e) => {
    // pointer-generated clicks (detail >= 1) are handled by pointerup above
    if (e.detail !== 0 || !isArmed()) return;
    if (typeof document !== 'undefined' && document.activeElement !== e.currentTarget) return;
    onAnswer(index);
  };

  let status = null;
  if (phase === 'answered') {
    status = (
      <div className="status status--wait">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        Wysłano {letterFor(selectedAnswer)} · czekamy na innych…
      </div>
    );
  } else if (obstructed && !timeUp) {
    status = <div className="status status--wait">🔒 Najpierw pokonaj przeszkodę</div>;
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
      <PlayerHeader player={player}>{headerExtra}</PlayerHeader>

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

      <div className={`answers ${layout} ${answerSize}${!locked && !armed ? ' is-arming' : ''}${ready ? ' is-armed' : ''}`}>
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
              onPointerDown={onPointerDown(index)}
              onPointerUp={onPointerUp(index)}
              onPointerCancel={onPointerCancel}
              onClick={onClick(index)}
              onContextMenu={(e) => e.preventDefault()}
              disabled={locked}
              aria-disabled={!ready}
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
