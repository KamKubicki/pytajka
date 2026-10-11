import React, { useEffect, useState } from 'react';
import Avatar from './Avatar';
import { cardInfo } from '../sabotage/registry';

const pid = (p) => p?.id ?? p?.playerId;

// Bottom dock with the cards in hand (vote / waiting / ranking screens)
export function SabotageDock({ cards, onPick }) {
  if (!cards?.length) return null;
  return (
    <div className="sab-dock" role="region" aria-label="Karty sabotażu">
      <div className="sab-dock__label">
        <span aria-hidden="true">😈</span> Sabotaż
      </div>
      <div className="sab-dock__cards">
        {cards.map((type, i) => {
          const info = cardInfo(type);
          return (
            <button
              key={`${type}-${i}`}
              type="button"
              className="sab-card"
              onClick={() => onPick(type)}
              aria-label={`Karta ${info.name} – wybierz ofiarę`}
            >
              <span className="sab-card__icon" aria-hidden="true">{info.icon}</span>
              <span className="sab-card__name">{info.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Compact button for the question screen top bar (doesn't cover answers)
export function SabotageButton({ cards, onOpen }) {
  if (!cards?.length) return null;
  return (
    <button
      type="button"
      className="sab-mini"
      onClick={onOpen}
      aria-label={`Sabotaż – karty: ${cards.length}`}
    >
      <span aria-hidden="true">😈</span>
      <span className="sab-mini__count">{cards.length}</span>
    </button>
  );
}

// Bottom sheet: pick a card (if not chosen yet) -> pick a victim -> "Rzuć!"
export function SabotageSheet({ cards, initialType, players, meId, pending, onThrow, onClose }) {
  const [type, setType] = useState(initialType ?? null);
  const [target, setTarget] = useState(null);

  const uniqueCards = Array.from(new Set(cards || []));

  // Card used/replaced meanwhile -> back to card choice
  useEffect(() => {
    if (type && !cards?.includes(type)) setType(uniqueCards.length === 1 ? uniqueCards[0] : null);
    else if (!type && uniqueCards.length === 1) setType(uniqueCards[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, type]);

  const victims = (players || [])
    .filter(p => pid(p) != null && pid(p) !== meId)
    .map(p => ({ ...p, id: pid(p), online: p.connected !== false }))
    .sort((a, b) => Number(b.online) - Number(a.online));

  // Victim left the game / disconnected -> clear the selection
  const onlineIds = victims.filter(v => v.online).map(v => v.id);
  const onlineKey = onlineIds.join('\u0000');
  useEffect(() => {
    if (target && !onlineIds.includes(target)) setTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, onlineKey]);

  const info = type ? cardInfo(type) : null;
  const targetName = victims.find(v => v.id === target)?.name;

  return (
    <div className="sab-sheet" role="dialog" aria-modal="true" aria-label="Sabotaż" onClick={onClose}>
      <div className="sab-sheet__box" onClick={(e) => e.stopPropagation()}>
        <div className="sab-sheet__head">
          <h3>😈 Sabotaż</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zamknij">✕</button>
        </div>

        <div className="sab-sheet__section">
          <div className="sab-sheet__step">1. Karta</div>
          <div className="sab-sheet__cards">
            {uniqueCards.map((t) => {
              const ci = cardInfo(t);
              const count = cards.filter(c => c === t).length;
              return (
                <button
                  key={t}
                  type="button"
                  className={`sab-card ${type === t ? 'is-active' : ''}`}
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                >
                  <span className="sab-card__icon" aria-hidden="true">{ci.icon}</span>
                  <span className="sab-card__name">{ci.name}</span>
                  {count > 1 && <span className="sab-card__count">×{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sab-sheet__section sab-sheet__section--grow">
          <div className="sab-sheet__step">2. Ofiara</div>
          {victims.length === 0 ? (
            <p className="subtitle">Nie ma jeszcze nikogo do sabotowania</p>
          ) : (
            <ul className="sab-victims">
              {victims.map(v => (
                <li key={v.id}>
                  <button
                    type="button"
                    className={`sab-victim ${target === v.id ? 'is-active' : ''}`}
                    onClick={() => setTarget(v.id)}
                    disabled={!v.online}
                    aria-pressed={target === v.id}
                  >
                    <Avatar avatar={v.avatar} size="xs" />
                    <span className="sab-victim__name">{v.name}</span>
                    {!v.online && <span className="sab-victim__off">rozłączony</span>}
                    {target === v.id && <span className="sab-victim__mark" aria-hidden="true">🎯</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          className="btn btn--sab btn--block"
          disabled={!info || !target || pending}
          onClick={() => onThrow(type, target)}
        >
          {pending ? 'Rzucam…' : info && targetName ? (
            <span className="sab-throw">
              <span>Rzuć!</span>
              <span className="sab-throw__sub">{info.icon} {info.name} → {targetName}</span>
            </span>
          ) : 'Rzuć!'}
        </button>
      </div>
    </div>
  );
}
