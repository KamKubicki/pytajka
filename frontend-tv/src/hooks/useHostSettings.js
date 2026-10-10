import { useCallback, useState } from 'react';
import { HUMOR_LEVELS } from '../hostLines';

const STORAGE_KEY = 'pytajka.host.v1';
export const HOST_FREQUENCIES = ['rare', 'normal', 'often'];
export const DEFAULT_HOST_SETTINGS = { enabled: true, frequency: 'normal', voice: true, humor: 'cheeky' };

const sanitize = (raw) => {
  const s = raw && typeof raw === 'object' ? raw : {};
  return {
    enabled: typeof s.enabled === 'boolean' ? s.enabled : DEFAULT_HOST_SETTINGS.enabled,
    frequency: HOST_FREQUENCIES.includes(s.frequency) ? s.frequency : DEFAULT_HOST_SETTINGS.frequency,
    voice: typeof s.voice === 'boolean' ? s.voice : DEFAULT_HOST_SETTINGS.voice,
    humor: HUMOR_LEVELS.includes(s.humor) ? s.humor : DEFAULT_HOST_SETTINGS.humor
  };
};

const load = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return sanitize(raw ? JSON.parse(raw) : null);
  } catch (e) {
    return { ...DEFAULT_HOST_SETTINGS };
  }
};

/** Host (Prof. Pytajek) preferences, remembered in localStorage when available. */
function useHostSettings() {
  const [settings, setSettings] = useState(load);

  const update = useCallback((patch) => {
    setSettings(prev => {
      const next = sanitize({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) });
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { /* storage optional */ }
      return next;
    });
  }, []);

  return [settings, update];
}

export default useHostSettings;
