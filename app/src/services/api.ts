import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';
import {API_CONFIG} from '../config/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {'Content-Type': 'application/json'},
});

apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    try {
      const {useAuthStore} = require('../store/auth');
      const token = useAuthStore.getState().token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const {useAuthStore} = require('../store/auth');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export interface AuthResponse {
  token: string;
  message?: string;
  id?: string;
}

export interface UserResponse {
  user: {
    _id: string;
    email: string;
  };
}

export interface Device {
  uuid: string;
  name: string;
  type: string;
  owner: string | null;
  state: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface LedStripDevice extends Device {
  type: 'led_strip';
  state: {
    brightness?: number;
    color?: string;
    mode?: string;
    speed?: number;
  };
}

export interface ThermostatDevice extends Device {
  type: 'thermostat';
  state: {
    temperature?: number;
    mode?: string;
  };
}

export interface SmartLockDevice extends Device {
  type: 'smart_lock';
  state: {
    locked?: boolean;
  };
}

export interface SensorDevice extends Device {
  type: 'sensor';
  state: {
    temperature?: number;
    humidity?: number;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {email, password},
    );
    return response.data;
  },
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      {email, password},
    );
    return response.data;
  },
  me: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(
      API_CONFIG.ENDPOINTS.AUTH.ME,
    );
    return response.data;
  },
};

export const pairingService = {
  generateCode: async (): Promise<{code: string; expiresAt: string}> => {
    const response = await apiClient.post<{code: string; expiresAt: string}>(
      API_CONFIG.ENDPOINTS.PAIRING.GENERATE_CODE,
    );
    return response.data;
  },
  verifyCode: async (
    code: string,
  ): Promise<{valid: boolean; reason?: string}> => {
    const response = await apiClient.get<{valid: boolean; reason?: string}>(
      API_CONFIG.ENDPOINTS.PAIRING.VERIFY_CODE(code),
    );
    return response.data;
  },
};

export const deviceService = {
  list: async (): Promise<Device[]> => {
    const response = await apiClient.get<Device[]>(
      API_CONFIG.ENDPOINTS.DEVICES.LIST,
    );
    return response.data;
  },
  ledStrips: {
    list: async (): Promise<LedStripDevice[]> => {
      const response = await apiClient.get<LedStripDevice[]>(
        API_CONFIG.ENDPOINTS.LEDS.LIST,
      );
      return response.data;
    },
    create: async (name: string): Promise<{uuid: string}> => {
      const response = await apiClient.post<{uuid: string}>(
        API_CONFIG.ENDPOINTS.LEDS.CREATE,
        {name},
      );
      return response.data;
    },
    update: async (
      uuid: string,
      updates: Record<string, unknown>,
    ): Promise<LedStripDevice> => {
      const response = await apiClient.put<LedStripDevice>(
        `${API_CONFIG.ENDPOINTS.LEDS.LIST}/${uuid}`,
        updates,
      );
      return response.data;
    },
    delete: async (uuid: string): Promise<void> => {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.LEDS.LIST}/${uuid}`);
    },
  },
  thermostats: {
    list: async (): Promise<ThermostatDevice[]> => {
      const response = await apiClient.get<ThermostatDevice[]>(
        API_CONFIG.ENDPOINTS.THERMOSTATS.LIST,
      );
      return response.data;
    },
    create: async (name: string): Promise<{uuid: string}> => {
      const response = await apiClient.post<{uuid: string}>(
        API_CONFIG.ENDPOINTS.THERMOSTATS.CREATE,
        {name},
      );
      return response.data;
    },
    setTemp: async (
      uuid: string,
      temperature: number,
      mode?: string,
    ): Promise<{success: boolean}> => {
      const response = await apiClient.post<{success: boolean}>(
        API_CONFIG.ENDPOINTS.THERMOSTATS.SET_TEMP(uuid),
        {temperature, mode},
      );
      return response.data;
    },
    setMode: async (
      uuid: string,
      mode: string,
    ): Promise<{success: boolean}> => {
      const response = await apiClient.post<{success: boolean}>(
        API_CONFIG.ENDPOINTS.THERMOSTATS.MODE(uuid),
        {mode},
      );
      return response.data;
    },
    delete: async (uuid: string): Promise<void> => {
      await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.THERMOSTATS.LIST}/${uuid}`,
      );
    },
  },
  locks: {
    list: async (): Promise<SmartLockDevice[]> => {
      const response = await apiClient.get<SmartLockDevice[]>(
        API_CONFIG.ENDPOINTS.LOCKS.LIST,
      );
      return response.data;
    },
    create: async (name: string): Promise<{uuid: string}> => {
      const response = await apiClient.post<{uuid: string}>(
        API_CONFIG.ENDPOINTS.LOCKS.CREATE,
        {name},
      );
      return response.data;
    },
    lock: async (uuid: string): Promise<{success: boolean}> => {
      const response = await apiClient.post<{success: boolean}>(
        API_CONFIG.ENDPOINTS.LOCKS.LOCK(uuid),
      );
      return response.data;
    },
    unlock: async (uuid: string): Promise<{success: boolean}> => {
      const response = await apiClient.post<{success: boolean}>(
        API_CONFIG.ENDPOINTS.LOCKS.UNLOCK(uuid),
      );
      return response.data;
    },
    delete: async (uuid: string): Promise<void> => {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.LOCKS.LIST}/${uuid}`);
    },
  },
  sensors: {
    list: async (): Promise<SensorDevice[]> => {
      const response = await apiClient.get<SensorDevice[]>(
        API_CONFIG.ENDPOINTS.SENSORS.LIST,
      );
      return response.data;
    },
    create: async (name: string): Promise<{uuid: string}> => {
      const response = await apiClient.post<{uuid: string}>(
        API_CONFIG.ENDPOINTS.SENSORS.CREATE,
        {name},
      );
      return response.data;
    },
    delete: async (uuid: string): Promise<void> => {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.SENSORS.LIST}/${uuid}`);
    },
  },
};

export {apiClient as api};
