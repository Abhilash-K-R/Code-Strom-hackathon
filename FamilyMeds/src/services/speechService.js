import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export const SpeechService = {
  speakKannada: (text, fallbackEnglish = '') => {
    try {
      Speech.stop(); // Stop any currently playing audio
      
      const options = {
        language: 'kn-IN', // Kannada (India)
        pitch: 1.0,
        rate: 0.85, // Slower, clearer cadence for elderly ears
        onError: (e) => {
          console.log('Kannada TTS not found, falling back to English TTS:', e);
          if (fallbackEnglish) {
            Speech.speak(fallbackEnglish, { language: 'en-IN', rate: 0.85 });
          }
        },
      };

      Speech.speak(text, options);
    } catch (err) {
      console.warn('Speech error:', err);
    }
  },

  stop: () => {
    try {
      Speech.stop();
    } catch (e) {
      // ignore
    }
  },
};
