export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080',
  
  TIMEOUT: 10000,
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      ME: '/api/auth/me',
    },
    DEVICES: {
      LIST: '/api/devices',
      REGISTER: '/api/devices/register',
      CLAIM: '/api/devices/claim',
    },
    LEDS: {
      LIST: '/api/leds',
      CREATE: '/api/leds',
    },
    THERMOSTATS: {
      LIST: '/api/thermostats',
      CREATE: '/api/thermostats',
      SET_TEMP: (uuid: string) => `/api/thermostats/${uuid}/setTemp`,
      MODE: (uuid: string) => `/api/thermostats/${uuid}/mode`,
    },
    LOCKS: {
      LIST: '/api/locks',
      CREATE: '/api/locks',
      LOCK: (uuid: string) => `/api/locks/${uuid}/lock`,
      UNLOCK: (uuid: string) => `/api/locks/${uuid}/unlock`,
    },
    SENSORS: {
      LIST: '/api/sensors',
      CREATE: '/api/sensors',
    },
    PAIRING: {
      GENERATE_CODE: '/api/pairing/generate-code',
      VERIFY_CODE: (code: string) => `/api/pairing/verify-code/${code}`,
    },
    HEALTH: '/health',
  },
};

export const DEVICE_TYPES = {
  LED_STRIP: 'LED_STRIP',
  THERMOSTAT: 'thermostat',
  SMART_LOCK: 'smart_lock',
  SENSOR: 'sensor',
} as const;

export type DeviceType = typeof DEVICE_TYPES[keyof typeof DEVICE_TYPES];

export const LED_STRIP_MODES = ['static', 'rainbow', 'fire', 'wave', 'candle'] as const;
export type LedStripMode = typeof LED_STRIP_MODES[number];

export const THERMOSTAT_MODES = ['off', 'cool', 'heat'] as const;
export type ThermostatMode = typeof THERMOSTAT_MODES[number];
