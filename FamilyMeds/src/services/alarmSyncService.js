import { NotificationService } from '../services/notificationService';
import { StorageService } from '../services/storageService';

/**
 * Syncs all saved medicines and slots directly into the Android AlarmManager
 * Runs on app startup, background resume, and after adding a new medicine
 */
export const AlarmSyncService = {
  syncAllAlarms: async () => {
    try {
      const slots = await StorageService.getSlots();
      if (!slots || slots.length === 0) return false;

      for (const slot of slots) {
        if (slot.status !== 'TAKEN') {
          await NotificationService.scheduleDailySlotReminder(slot);
        }
      }
      return true;
    } catch (e) {
      console.warn('AlarmSyncService.syncAllAlarms error:', e);
      return false;
    }
  },
};

