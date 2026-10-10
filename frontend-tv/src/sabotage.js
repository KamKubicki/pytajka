/**
 * Karty sabotażu – metadane typów i pomocnicze funkcje dla ekranu TV.
 * Typy (kontrakt z backendem): fog, bubbles, math, mash, sequence, catch.
 * Nieznany typ dostaje ogólną ikonę, więc nowa karta z backendu nie wysypie ekranu.
 */

export const SABOTAGE_TYPES = {
  fog: { icon: '🌫️', name: 'Mgła', acc: 'Mgłę' },
  bubbles: { icon: '🫧', name: 'Bąbelki', acc: 'Bąbelki' },
  math: { icon: '🧮', name: 'Szybka matma', acc: 'Szybką matmę' },
  mash: { icon: '👆', name: 'Klikacz', acc: 'Klikacza' },
  sequence: { icon: '🔢', name: 'Kolejność', acc: 'Kolejność' },
  catch: { icon: '🏃', name: 'Uciekinier', acc: 'Uciekiniera' }
};

const FALLBACK = { icon: '💣', name: 'Sabotaż', acc: 'sabotaż' };

export const sabotageMeta = (type) => SABOTAGE_TYPES[type] || FALLBACK;

/** Normalised `sabotage-used` payload or null when it is unusable. */
export function normalizeSabotage(data) {
  if (!data || typeof data !== 'object') return null;
  const targetPlayerId = data.targetPlayerId ?? null;
  const targetName = data.targetName ? String(data.targetName) : '';
  if (!targetPlayerId && !targetName) return null;
  return {
    fromPlayerId: data.fromPlayerId ?? null,
    fromName: data.fromName ? String(data.fromName) : 'Ktoś',
    targetPlayerId,
    targetName: targetName || 'ktoś',
    type: typeof data.type === 'string' ? data.type : 'unknown'
  };
}

/** [{ targetPlayerId, type, fromName }] -> Map(targetPlayerId -> [{ type, fromName }]) */
export function sabotageByTarget(list) {
  const map = new Map();
  (Array.isArray(list) ? list : []).forEach(s => {
    if (!s || s.targetPlayerId == null) return;
    const arr = map.get(s.targetPlayerId) || [];
    arr.push({ type: s.type, fromName: s.fromName });
    map.set(s.targetPlayerId, arr);
  });
  return map;
}

/** Sabotages from `question-ended.updatedPlayers[].sabotagedBy`, or null when the backend sent none. */
export function sabotageFromPlayers(players) {
  if (!Array.isArray(players)) return null;
  let hasField = false;
  const out = [];
  players.forEach(p => {
    if (!p || !Array.isArray(p.sabotagedBy)) return;
    hasField = true;
    p.sabotagedBy.forEach(s => {
      if (!s) return;
      out.push({ targetPlayerId: p.id, type: s.type || 'unknown', fromName: s.fromName ? String(s.fromName) : 'Ktoś' });
    });
  });
  return hasField ? out : null;
}
