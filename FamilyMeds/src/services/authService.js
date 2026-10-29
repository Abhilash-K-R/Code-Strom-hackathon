import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './apiConfig';

const KEYS = {
  TOKEN: '@familymeds_jwt_token',
  USER: '@familymeds_auth_user',
  FAMILY: '@familymeds_auth_family',
};

export const AuthService = {
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch (e) {
      return null;
    }
  },

  getUser: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      return null;
    }
  },

  getFamily: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.FAMILY);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      return null;
    }
  },

  register: async ({ name, email, password, role }) => {
    const baseUrl = await API_CONFIG.getBaseUrl();
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    if (data.token) {
      await AsyncStorage.setItem(KEYS.TOKEN, data.token);
    }
    if (data.user) {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(data.user));
    }
    await AsyncStorage.removeItem(KEYS.FAMILY);

    return data;
  },

  login: async ({ email, password }) => {
    const baseUrl = await API_CONFIG.getBaseUrl();
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password');
    }

    if (data.token) {
      await AsyncStorage.setItem(KEYS.TOKEN, data.token);
    }
    if (data.user) {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(data.user));
    }
    if (data.family) {
      await AsyncStorage.setItem(KEYS.FAMILY, JSON.stringify(data.family));
    } else {
      await AsyncStorage.removeItem(KEYS.FAMILY);
    }

    return data;
  },

  createFamily: async (familyName) => {
    const token = await AuthService.getToken();
    const baseUrl = await API_CONFIG.getBaseUrl();

    const res = await fetch(`${baseUrl}/families/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ familyName }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create family');
    }

    if (data.family) {
      await AsyncStorage.setItem(KEYS.FAMILY, JSON.stringify(data.family));
    }

    return data;
  },

  joinFamily: async (familyCode) => {
    const token = await AuthService.getToken();
    const baseUrl = await API_CONFIG.getBaseUrl();

    const res = await fetch(`${baseUrl}/families/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ familyCode }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to join family');
    }

    if (data.family) {
      await AsyncStorage.setItem(KEYS.FAMILY, JSON.stringify(data.family));
    }

    return data;
  },

  getFamilyDetails: async () => {
    const token = await AuthService.getToken();
    const baseUrl = await API_CONFIG.getBaseUrl();

    const res = await fetch(`${baseUrl}/families/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load family');
    }

    if (data.family) {
      await AsyncStorage.setItem(KEYS.FAMILY, JSON.stringify(data.family));
    }

    return data;
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER, KEYS.FAMILY]);
    } catch (e) {
      console.warn('Logout error:', e);
    }
  },
};
