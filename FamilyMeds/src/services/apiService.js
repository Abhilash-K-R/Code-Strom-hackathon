import { API_CONFIG } from './apiConfig';
import { AuthService } from './authService';

/**
 * FamilyMeds Multi-Tenant API Service
 * Handles communication with the Node.js/Express backend.
 * Automatically injects JWT Bearer token for strict family-level data scoping.
 */
export const ApiService = {
  /**
   * Helper to perform fetch with timeout and dynamic token injection
   */
  requestWithTimeout: async (endpoint, options = {}, timeoutMs = API_CONFIG.TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const baseUrl = await API_CONFIG.getBaseUrl();
      const token = await AuthService.getToken();

      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  /**
   * GET /medicines (Family-Scoped)
   */
  getMedicines: async () => {
    try {
      const res = await ApiService.requestWithTimeout('/medicines', {
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
   * POST /medicines (Family-Scoped)
   */
  addMedicine: async (medData) => {
    try {
      const res = await ApiService.requestWithTimeout('/medicines', {
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
   * GET /history (Family-Scoped)
   */
  getHistory: async () => {
    try {
      const res = await ApiService.requestWithTimeout('/history', {
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
   * POST /history (Family-Scoped)
   */
  recordHistory: async (historyData) => {
    try {
      const res = await ApiService.requestWithTimeout('/history', {
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

  /**
   * GET /families/live-status (Real-Time Live Sync Endpoint)
   */
  getLiveStatus: async () => {
    try {
      const res = await ApiService.requestWithTimeout('/families/live-status', {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error(`GET /families/live-status returned status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.log('ApiService.getLiveStatus network note:', error.message);
      return null;
    }
  },

  /**
   * POST /users/push-token (Registers device push token)
   */
  updatePushToken: async (pushToken) => {
    try {
      const res = await ApiService.requestWithTimeout('/users/push-token', {
        method: 'POST',
        body: JSON.stringify({ pushToken }),
      });
      return res.ok;
    } catch (error) {
      console.log('ApiService.updatePushToken error:', error.message);
      return false;
    }
  },
};
