// Sabotage cards + minigame registry.
//
// Every file in src/minigames/*.jsx is picked up automatically. A minigame
// module exports `meta = { type, name, icon, hint }` and a default component
// `({ answers, onComplete, playSound }) => …`. The glob resolves to {} when the
// folder is empty or missing, so the build never depends on any minigame.

const modules = import.meta.glob('../minigames/*.jsx', { eager: true });

// Card catalogue (shared contract) – also used when a minigame file is missing.
// `acc` = accusative form for sentences like "Ola rzuca na Ciebie Mgłę!".
export const CARD_INFO = {
  fog: { name: 'Mgła', acc: 'Mgłę', icon: '🌫️' },
  bubbles: { name: 'Bąbelki', acc: 'Bąbelki', icon: '🫧' },
  math: { name: 'Szybka matma', acc: 'Szybką matmę', icon: '🧮' },
  mash: { name: 'Klikacz', acc: 'Klikacza', icon: '👆' },
  sequence: { name: 'Kolejność', acc: 'Kolejność', icon: '🔢' },
  catch: { name: 'Uciekinier', acc: 'Uciekiniera', icon: '🏃' }
};

const FALLBACK_TYPE = 'mash';

const registry = {};
for (const [path, mod] of Object.entries(modules)) {
  const meta = mod?.meta;
  const Component = mod?.default;
  if (!meta?.type || !Component) {
    console.warn(`[sabotage] Pomijam ${path} – brak "meta.type" albo domyślnego eksportu`);
    continue;
  }
  registry[meta.type] = { meta, Component };
}

// Minigame for a card type: exact match, otherwise the `mash` fallback,
// otherwise null (= no obstacle at all).
export function getMinigame(type) {
  return registry[type] || registry[FALLBACK_TYPE] || null;
}

// Display info for a card type (works even without the minigame file)
export function cardInfo(type) {
  const c = CARD_INFO[type];
  const m = registry[type]?.meta;
  const name = c?.name || m?.name || String(type || 'Karta');
  return {
    type,
    name,
    acc: c?.acc || name,
    icon: c?.icon || m?.icon || '🃏',
    hint: m?.hint || ''
  };
}
