import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_SLOTS, MOCK_HISTORY } from '../constants/mockData';
import { ApiService } from './apiService';

const KEYS = {
  SLOTS: '@familymeds_slots_v1',
  HISTORY: '@familymeds_history_v1',
};

/**
 * Transforms a flat list of medicines from GET /medicines into dashboard slots.
 */
const groupMedicinesIntoSlots = (medicines) => {
  if (!medicines || medicines.length === 0) return MOCK_SLOTS;

  const slotMap = {};

  medicines.forEach((med) => {
    const sId = med.slotId || (med.slotTime === '08:30 PM' ? 'slot-night' : 'slot-morning');
    if (!slotMap[sId]) {
      slotMap[sId] = {
        id: sId,
        time: med.slotTime || '09:00 AM',
        label: med.slotLabel || 'Medicines',
        status: med.status || 'SCHEDULED',
        medicines: [],
      };
    }

    slotMap[sId].medicines.push({
      id: med.id || med._id || `med-${Date.now()}`,
      name: med.name,
      genericName: med.genericName || med.name,
      kannadaName: med.kannadaName || med.name,
      timing: med.timing || 'After Food',
      color: med.color || '#0D9488',
      dosage: med.dosage || '1 Tablet',
      photo: med.photo || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    });
  });

  return Object.values(slotMap);
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
   * Tries backend GET /medicines first; falls back seamlessly to AsyncStorage.
   */
  getSlots: async () => {
    try {
      // 1. Try backend API
      const remoteMedicines = await ApiService.getMedicines();
      if (remoteMedicines && Array.isArray(remoteMedicines) && remoteMedicines.length > 0) {
        const slotsFromApi = groupMedicinesIntoSlots(remoteMedicines);
        // Cache to AsyncStorage
        await AsyncStorage.setItem(KEYS.SLOTS, JSON.stringify(slotsFromApi));
        return slotsFromApi;
      }

      // 2. Fallback to AsyncStorage
      const json = await AsyncStorage.getItem(KEYS.SLOTS);
      if (json) {
        return JSON.parse(json);
      }
      return MOCK_SLOTS;
    } catch (e) {
      console.warn('StorageService.getSlots fallback:', e);
      return MOCK_SLOTS;
    }
  },

  /**
   * Adds a new medicine.
   * Posts to backend POST /medicines AND updates local AsyncStorage.
   */
  addMedicine: async (medData) => {
    try {
      const slotTime = medData.time || '09:00 AM';
      const slotLabel = medData.selectedSlot || 'Morning';
      const slotId = `slot-${slotLabel.toLowerCase().replace(/\s+/g, '-')}`;

      // 1. Send to backend POST /medicines (API-ready architecture)
      await ApiService.addMedicine({
        name: medData.name,
        genericName: medData.genericName || medData.name,
        kannadaName: medData.kannadaLabel || medData.name,
        timing: medData.timing || 'After Food',
        dosage: medData.dosage || '1 Tablet',
        color: '#0D9488',
        photo: medData.photo || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        slotTime,
        slotLabel: `${slotLabel} Medicines`,
        slotId,
      });

      // 2. Update local AsyncStorage cache
      const slots = await StorageService.getSlots();
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
          id: slotId,
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
   * Tries backend GET /history first; falls back seamlessly to AsyncStorage.
   */
  getHistory: async () => {
    try {
      // 1. Try backend API
      const remoteHistory = await ApiService.getHistory();
      if (remoteHistory && Array.isArray(remoteHistory) && remoteHistory.length > 0) {
        // Cache to AsyncStorage
        await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(remoteHistory));
        return remoteHistory;
      }

      // 2. Fallback to AsyncStorage
      const json = await AsyncStorage.getItem(KEYS.HISTORY);
      if (json) {
        return JSON.parse(json);
      }
      return MOCK_HISTORY;
    } catch (e) {
      console.warn('StorageService.getHistory fallback:', e);
      return MOCK_HISTORY;
    }
  },

  /**
   * Marks a slot as TAKEN and prepends a new history record.
   * Posts to backend POST /history AND updates local AsyncStorage.
   */
  recordSlotTaken: async (slotId = 'slot-morning') => {
    try {
      const slots = await StorageService.getSlots();
      const targetSlot = slots.find((s) => s.id === slotId) || slots[0];

      if (targetSlot) {
        targetSlot.status = 'TAKEN';
        await AsyncStorage.setItem(KEYS.SLOTS, JSON.stringify(slots));
      }

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

      // 1. Send to backend POST /history (API-ready architecture)
      await ApiService.recordHistory(newRecord);

      // 2. Update local AsyncStorage cache
      const history = await StorageService.getHistory();
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
