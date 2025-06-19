
import { useEffect, useRef } from 'react';

interface NotificationSoundsProps {
  soundType: 'default' | 'bell' | 'chime' | 'alert';
  isPlaying: boolean;
  onStop: () => void;
}

const NotificationSounds = ({ soundType, isPlaying, onStop }: NotificationSoundsProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Gerar sons diferentes usando Web Audio API
  const createNotificationSound = (type: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurar frequências diferentes para cada tipo de som
    switch (type) {
      case 'bell':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
        break;
      case 'chime':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
        break;
      case 'alert':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
        break;
      default: // default
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
    }

    oscillator.type = 'sine';
    
    // Envelope para suavizar o som
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying) {
      const playSound = async () => {
        try {
          await createNotificationSound(soundType);
        } catch (error) {
          console.error('Erro ao tocar som:', error);
        }
      };

      // Tocar imediatamente
      playSound();

      // Repetir a cada 2 segundos
      intervalId = setInterval(playSound, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, soundType]);

  return null; // Componente sem UI visual
};

export default NotificationSounds;
