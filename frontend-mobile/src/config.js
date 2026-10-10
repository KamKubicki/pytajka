// Backend URL: VITE_BACKEND_URL wins, otherwise same host as the page on port 3001
const getBackendURL = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  const currentHost = window.location.hostname;
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:3001`;
  }
  return 'http://localhost:3001';
};

export const SOCKET_URL = getBackendURL();

export const AVATARS = ['🧑', '👩', '👨', '🧒', '👦', '👧', '🧓', '👴', '👵', '🤵', '👰', '🤖'];

// Fixed answer colours shared with the TV screen
export const ANSWER_COLORS = ['#E63946', '#2A9DF4', '#F4B400', '#2EC27E'];
export const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];

// Fallback colours for category tiles when the backend sends none
export const CATEGORY_FALLBACK_COLORS = ['#8B5CF6', '#06B6D4', '#F97316'];

export const letterFor = (index) =>
  ANSWER_LETTERS[index] ?? String.fromCharCode(65 + (Number(index) || 0));

export const isImageAvatar = (avatar) =>
  typeof avatar === 'string' && /^(data:image\/|https?:\/\/|blob:)/.test(avatar);
