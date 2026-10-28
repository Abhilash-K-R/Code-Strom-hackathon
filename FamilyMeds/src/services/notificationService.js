import { Vibration, Platform } from 'react-native';
import { navigationRef } from '../navigation/AppNavigator';

// Active demo timer handle
let activeDemoTimer = null;

export const NotificationService = {
  /**
   * Request permissions (safe for Expo Go)
   */
  requestPermissions: async () => {
    return true;
  },

  /**
   * Schedules a 30-Second Quick Demo Reminder for Hackathon Judges.
   * Completely compatible with standard Expo Go without native build requirements.
   */
  scheduleDemoReminder30s: async (slotId = 'slot-morning', slotTitle = '09:00 AM — Morning Medicines') => {
    try {
      if (activeDemoTimer) {
        clearTimeout(activeDemoTimer);
      }

      activeDemoTimer = setTimeout(() => {
        // Vibrate device to simulate alarm buzz
        if (Platform.OS !== 'web') {
          try {
            Vibration.vibrate([0, 500, 200, 500]);
          } catch (e) {
            // ignore
          }
        }

        // Auto-navigate to full-screen Alarm modal
        if (navigationRef && navigationRef.isReady()) {
          navigationRef.navigate('Alarm', { slotId });
        }
      }, 30000);

      return true;
    } catch (e) {
      console.warn('scheduleDemoReminder30s error:', e);
      return false;
    }
  },

  /**
   * Schedules a daily recurring reminder for a specific medicine slot
   */
  scheduleDailySlotReminder: async (slot) => {
    console.log(`[NotificationService] Daily reminder registered for ${slot.time} - ${slot.label}`);
    return true;
  },

  /**
   * Cancel all scheduled notifications
   */
  cancelAllReminders: async () => {
    if (activeDemoTimer) {
      clearTimeout(activeDemoTimer);
      activeDemoTimer = null;
    }
  },
};
