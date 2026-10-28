import { API_CONFIG } from './apiConfig';

/**
 * FamilyMeds API Service
 * Handles communication with the Node.js/Express backend.
 * Only covers:
 * - GET /medicines
 * - POST /medicines
 * - GET /history
 * - POST /history
 */
export const ApiService = {
  /**
   * Helper to perform fetch with timeout
   */
  requestWithTimeout: async (url, options = {}, timeoutMs = API_CONFIG.TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  /**
   * GET /medicines
   */
  getMedicines: async () => {
    try {
      const res = await ApiService.requestWithTimeout(`${API_CONFIG.BASE_URL}/medicines`, {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error(`GET /medicines returned status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.log('ApiService.getMedicines network note:', error.message);
      return null;
    }
  },

  /**
   * POST /medicines
   */
  addMedicine: async (medData) => {
    try {
      const res = await ApiService.requestWithTimeout(`${API_CONFIG.BASE_URL}/medicines`, {
        method: 'POST',
        body: JSON.stringify(medData),
      });
      if (!res.ok) {
        throw new Error(`POST /medicines returned status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.log('ApiService.addMedicine network note:', error.message);
      return null;
    }
  },

  /**
   * GET /history
   */
  getHistory: async () => {
    try {
      const res = await ApiService.requestWithTimeout(`${API_CONFIG.BASE_URL}/history`, {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error(`GET /history returned status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.log('ApiService.getHistory network note:', error.message);
      return null;
    }
  },

  /**
   * POST /history
   */
  recordHistory: async (historyData) => {
    try {
      const res = await ApiService.requestWithTimeout(`${API_CONFIG.BASE_URL}/history`, {
        method: 'POST',
        body: JSON.stringify(historyData),
      });
      if (!res.ok) {
        throw new Error(`POST /history returned status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.log('ApiService.recordHistory network note:', error.message);
      return null;
    }
  },
};
