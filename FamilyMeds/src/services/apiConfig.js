import AsyncStorage from '@react-native-async-storage/async-storage';

// FamilyMeds Multi-Tenant API Configuration
// Resolves hardcoded IP technical debt by supporting dynamic configuration & local override
export const API_CONFIG = {
  DEFAULT_URL: 'http://10.100.54.244:5000',
  BASE_URL: 'http://10.100.54.244:5000',
  TIMEOUT_MS: 4000,

  /**
   * Returns current active backend URL (stored override or default)
   */
  getBaseUrl: async () => {
    try {
      const stored = await AsyncStorage.getItem('@familymeds_custom_api_url');
      if (stored && stored.trim() !== '') {
        API_CONFIG.BASE_URL = stored.trim();
        return stored.trim();
      }
    } catch (e) {
      // ignore
    }
    return API_CONFIG.BASE_URL;
  },

  /**
   * Updates backend server URL
   */
  setBaseUrl: async (url) => {
    try {
      if (url && url.trim() !== '') {
        API_CONFIG.BASE_URL = url.trim();
        await AsyncStorage.setItem('@familymeds_custom_api_url', url.trim());
      }
    } catch (e) {
      console.warn('Failed to save custom API URL:', e);
    }
  },
};
