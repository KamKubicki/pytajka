import { useCallback, useRef } from 'react';

// Create simple beep sounds using Web Audio API
const createAudioContext = () => {
  return new (window.AudioContext || window.webkitAudioContext)();
};

const useSounds = () => {
  const audioContextRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency = 800, duration = 100, volume = 0.1) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, [getAudioContext]);

  const playCountdownTick = useCallback(() => {
    playBeep(600, 100, 0.15);
  }, [playBeep]);

  const playCountdownFinalTick = useCallback(() => {
    playBeep(800, 200, 0.2);
  }, [playBeep]);

  const playCorrectAnswer = useCallback(() => {
    // Happy ascending notes
    playBeep(523, 150, 0.15); // C
    setTimeout(() => playBeep(659, 150, 0.15), 100); // E
    setTimeout(() => playBeep(784, 300, 0.15), 200); // G
  }, [playBeep]);

  const playWrongAnswer = useCallback(() => {
    // Sad descending notes
    playBeep(400, 200, 0.15);
    setTimeout(() => playBeep(350, 300, 0.15), 150);
  }, [playBeep]);

  const playQuestionStart = useCallback(() => {
    // Ascending alert
    playBeep(440, 100, 0.12);
    setTimeout(() => playBeep(554, 100, 0.12), 80);
    setTimeout(() => playBeep(659, 150, 0.12), 160);
  }, [playBeep]);

  const playSeriesEnd = useCallback(() => {
    // Triumphant fanfare
    playBeep(523, 150, 0.15); // C
    setTimeout(() => playBeep(659, 150, 0.15), 100); // E
    setTimeout(() => playBeep(784, 150, 0.15), 200); // G
    setTimeout(() => playBeep(1047, 400, 0.15), 300); // High C
  }, [playBeep]);

  const playGameEnd = useCallback(() => {
    // Victory fanfare
    playBeep(523, 200, 0.15); // C
    setTimeout(() => playBeep(659, 200, 0.15), 150); // E
    setTimeout(() => playBeep(784, 200, 0.15), 300); // G
    setTimeout(() => playBeep(1047, 200, 0.15), 450); // High C
    setTimeout(() => playBeep(1319, 600, 0.15), 600); // High E
  }, [playBeep]);

  return {
    playCountdownTick,
    playCountdownFinalTick,
    playCorrectAnswer,
    playWrongAnswer,
    playQuestionStart,
    playSeriesEnd,
    playGameEnd
  };
};

export default useSounds;