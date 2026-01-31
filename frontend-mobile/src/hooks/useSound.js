import { useRef, useCallback } from 'react';

// Custom hook for playing sounds in the game
const useSound = () => {
  const audioContextRef = useRef(null);
  const soundsRef = useRef({});

  // Initialize Audio Context (lazy initialization)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Generate sound using Web Audio API (no external files needed!)
  const generateSound = useCallback((type) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'correct':
        // Happy ascending notes
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
        break;

      case 'incorrect':
        // Sad descending notes
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime); // G4
        oscillator.frequency.setValueAtTime(300, ctx.currentTime + 0.15); // D4
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;

      case 'tick':
        // Short tick sound for timer
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;

      case 'time-up':
        // Alarm sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;

      case 'round-end':
        // Fanfare
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        oscillator.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.45); // C6
        gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.8);
        break;

      case 'game-start':
        // Exciting start sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        oscillator.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
        oscillator.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3); // C5
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);
        break;

      case 'answer-submit':
        // Quick confirmation beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;

      default:
        oscillator.stop();
        break;
    }
  }, [getAudioContext]);

  // Play sound function
  const playSound = useCallback((type) => {
    try {
      generateSound(type);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [generateSound]);

  return { playSound };
};

export default useSound;
