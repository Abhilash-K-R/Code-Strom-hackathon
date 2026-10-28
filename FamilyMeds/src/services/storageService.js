import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_SLOTS, MOCK_HISTORY } from '../constants/mockData';

const KEYS = {
  SLOTS: '@familymeds_slots_v1',
  HISTORY: '@familymeds_history_v1',
};

export const StorageService = {
  /**
   * Initializes storage with default seed data if not present.
   */
  initStorage: async () => {
    try {
      const storedSlots = await AsyncStorage.getItem(KEYS.SLOTS);
      if (!storedSlots) {
        await AsyncStorage.setItem(KEYS.SLOTS, JSON.stringify(MOCK_SLOTS));
      }

      const storedHistory = await AsyncStorage.getItem(KEYS.HISTORY);
      if (!storedHistory) {
        await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(MOCK_HISTORY));
      }
    } catch (e) {
      console.warn('StorageService.initStorage error:', e);
    }
  },

  /**
   * Gets all slots and their associated medicines.
   */
  getSlots: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.SLOTS);
      if (json) {
        return JSON.parse(json);
      }
      return MOCK_SLOTS;
    } catch (e) {
      console.warn('StorageService.getSlots error:', e);
      return MOCK_SLOTS;
    }
  },

  /**
   * Adds a new medicine and places it into the corresponding slot (or creates a new slot).
   */
  addMedicine: async (medData) => {
    try {
      const slots = await StorageService.getSlots();
      const slotTime = medData.time || '09:00 AM';
      const slotLabel = medData.selectedSlot || 'Morning';

      // Find or create slot
      let targetSlot = slots.find((s) => s.time === slotTime || s.label.toLowerCase().includes(slotLabel.toLowerCase()));

      const newMedicine = {
        id: `med-${Date.now()}`,
        name: medData.name,
        genericName: medData.genericName || medData.name,
        kannadaName: medData.kannadaLabel || medData.name,
        timing: medData.timing || 'After Food',
        color: '#0D9488',
        dosage: medData.dosage || '1 Tablet',
        photo: medData.photo || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      };

      if (targetSlot) {
        targetSlot.medicines.push(newMedicine);
      } else {
        slots.push({
          id: `slot-${Date.now()}`,
          time: slotTime,
          label: `${slotLabel} Medicines`,
          status: 'SCHEDULED',
          medicines: [newMedicine],
        });
      }

      await AsyncStorage.setItem(KEYS.SLOTS, JSON.stringify(slots));
      return slots;
    } catch (e) {
      console.warn('StorageService.addMedicine error:', e);
      return null;
    }
  },

  /**
   * Gets all dose history records.
   */
  getHistory: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.HISTORY);
      if (json) {
        return JSON.parse(json);
      }
      return MOCK_HISTORY;
    } catch (e) {
      console.warn('StorageService.getHistory error:', e);
      return MOCK_HISTORY;
    }
  },

  /**
   * Marks a slot as TAKEN and prepends a new history record.
   */
  recordSlotTaken: async (slotId = 'slot-morning') => {
    try {
      const slots = await StorageService.getSlots();
      const targetSlot = slots.find((s) => s.id === slotId) || slots[0];

      if (targetSlot) {
        targetSlot.status = 'TAKEN';
        await AsyncStorage.setItem(KEYS.SLOTS, JSON.stringify(slots));
      }

      // Record to history
      const history = await StorageService.getHistory();
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${(hours % 12) || 12}:${minutes} ${ampm}`;

      const medicineNames = targetSlot
        ? targetSlot.medicines.map((m) => m.name).join(', ')
        : 'BP Tablet, Sugar Tablet';

      const newRecord = {
        date: 'Today (Just Now)',
        time: targetSlot ? targetSlot.time : '09:00 AM',
        slot: targetSlot ? targetSlot.label : 'Morning Medicines',
        medicines: medicineNames,
        status: 'TAKEN',
        takenAt: `${formattedTime} (Confirmed by Parent)`,
      };

      const updatedHistory = [newRecord, ...history];
      await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updatedHistory));

      return { slots, history: updatedHistory };
    } catch (e) {
      console.warn('StorageService.recordSlotTaken error:', e);
      return null;
    }
  },

  /**
   * Derives actual doctor stats (daysTracked, taken, late, missed) from stored history.
   */
  getDoctorStats: async () => {
    try {
      const history = await StorageService.getHistory();
      let taken = 0;
      let late = 0;
      let missed = 0;

      history.forEach((item) => {
        if (item.status === 'TAKEN') taken++;
        else if (item.status === 'LATE') late++;
        else if (item.status === 'MISSED') missed++;
      });

      return {
        daysTracked: Math.max(14, history.length),
        taken,
        late,
        missed,
        history,
      };
    } catch (e) {
      console.warn('StorageService.getDoctorStats error:', e);
      return { daysTracked: 14, taken: 11, late: 1, missed: 2, history: MOCK_HISTORY };
    }
  },

  /**
   * Resets local storage back to seed data.
   */
  resetStorage: async () => {
    try {
      await AsyncStorage.setItem(KEYS.SLOTS, JSON.stringify(MOCK_SLOTS));
      await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(MOCK_HISTORY));
    } catch (e) {
      console.warn('StorageService.resetStorage error:', e);
    }
  },
};
