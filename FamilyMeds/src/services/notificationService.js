import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior for foreground delivery
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  /**
   * Request notification permissions from device OS
   */
  requestPermissions: async () => {
    try {
      if (Platform.OS === 'web') return true;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  },

  /**
   * Schedules a 30-Second Quick Demo Reminder for Hackathon Judges
   */
  scheduleDemoReminder30s: async (slotId = 'slot-morning', slotTitle = '09:00 AM — Morning Medicines') => {
    try {
      await NotificationService.requestPermissions();

      // Schedule notification in 30 seconds
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 ಮಾತ್ರೆ ಸಮಯ! (MEDICINE TIME - 30s DEMO)',
          body: 'ಅಮ್ಮಾ, ಬೆಳಗಿನ ಬಿಪಿ ಮತ್ತು ಸಕ್ಕರೆ ಕಾಯಿಲೆ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ (Tap to open full-screen alarm)',
          data: { slotId, isDemo: true },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          seconds: 30,
        },
      });

      return notificationId;
    } catch (e) {
      console.warn('scheduleDemoReminder30s error:', e);
      return null;
    }
  },

  /**
   * Schedules a daily recurring reminder for a specific medicine slot
   */
  scheduleDailySlotReminder: async (slot) => {
    try {
      await NotificationService.requestPermissions();

      // Parse time e.g. "09:00 AM" or "08:30 PM"
      const timeStr = slot.time || '09:00 AM';
      const parts = timeStr.split(' ');
      const [hStr, mStr] = parts[0].split(':');
      let hour = parseInt(hStr, 10);
      const minute = parseInt(mStr, 10);
      if (parts[1] === 'PM' && hour < 12) hour += 12;
      if (parts[1] === 'AM' && hour === 12) hour = 0;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 ಮಾತ್ರೆ ಸಮಯ! (${slot.time})`,
          body: `${slot.label}: Tap to confirm taking your tablets.`,
          data: { slotId: slot.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      return notificationId;
    } catch (e) {
      console.warn('scheduleDailySlotReminder error:', e);
      return null;
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  cancelAllReminders: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn('cancelAllReminders error:', e);
    }
  },
};
