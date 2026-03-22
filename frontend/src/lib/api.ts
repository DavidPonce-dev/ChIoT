const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI<{ success: boolean; message?: string; error?: string; user?: { id: string; email: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string) =>
      fetchAPI<{ success: boolean; message?: string; error?: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      fetchAPI<{ success: boolean }>("/api/auth/logout", {
        method: "POST",
      }),
    me: () =>
      fetchAPI<{ user: { _id: string; email: string } }>("/api/auth/me"),
  },
  ledStrips: {
    list: () => fetchAPI<LedStripDevice[]>("/api/leds"),
    create: (data: { name: string; brightness?: number; color?: string; mode?: LedStripMode; speed?: number }) =>
      fetchAPI<LedStripDevice>("/api/leds", { method: "POST", body: JSON.stringify(data) }),
    update: (uuid: string, data: Partial<LedStripState>) =>
      fetchAPI<LedStripDevice>(`/api/leds/${uuid}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (uuid: string) =>
      fetchAPI<{ message: string }>(`/api/leds/${uuid}`, { method: "DELETE" }),
  },
  thermostats: {
    list: () => fetchAPI<ThermostatDevice[]>("/api/thermostats"),
    create: (data: { name: string; temperature?: number; mode?: ThermostatMode }) =>
      fetchAPI<ThermostatDevice>("/api/thermostats", { method: "POST", body: JSON.stringify(data) }),
    setTemp: (uuid: string, temp: number, mode?: ThermostatMode) =>
      fetchAPI<{ success: boolean; state: ThermostatState }>(`/api/thermostats/${uuid}/setTemp`, {
        method: "POST",
        body: JSON.stringify({ temperature: temp, mode }),
      }),
    setMode: (uuid: string, mode: ThermostatMode) =>
      fetchAPI<{ success: boolean }>(`/api/thermostats/${uuid}/mode`, {
        method: "POST",
        body: JSON.stringify({ mode }),
      }),
    delete: (uuid: string) =>
      fetchAPI<{ message: string }>(`/api/thermostats/${uuid}`, { method: "DELETE" }),
  },
  locks: {
    list: () => fetchAPI<SmartLockDevice[]>("/api/locks"),
    create: (name: string) =>
      fetchAPI<SmartLockDevice>("/api/locks", { method: "POST", body: JSON.stringify({ name }) }),
    lock: (uuid: string) =>
      fetchAPI<{ success: boolean }>(`/api/locks/${uuid}/lock`, { method: "POST" }),
    unlock: (uuid: string) =>
      fetchAPI<{ success: boolean }>(`/api/locks/${uuid}/unlock`, { method: "POST" }),
    delete: (uuid: string) =>
      fetchAPI<{ message: string }>(`/api/locks/${uuid}`, { method: "DELETE" }),
  },
  sensors: {
    list: () => fetchAPI<SensorDevice[]>("/api/sensors"),
    create: (name: string) =>
      fetchAPI<SensorDevice>("/api/sensors", { method: "POST", body: JSON.stringify({ name }) }),
    delete: (uuid: string) =>
      fetchAPI<{ message: string }>(`/api/sensors/${uuid}`, { method: "DELETE" }),
  },
};

export const DeviceTypes = {
  LED_STRIP: "LED_STRIP",
  THERMOSTAT: "thermostat",
  SMART_LOCK: "smart_lock",
  SENSOR: "sensor",
} as const;

export type DeviceType = "LED_STRIP" | "thermostat" | "smart_lock" | "sensor";

export const LedStripModes = ["static", "rainbow", "fire", "wave", "candle"] as const;
export type LedStripMode = "static" | "rainbow" | "fire" | "wave" | "candle";

export const ThermostatModes = ["off", "cool", "heat"] as const;
export type ThermostatMode = "off" | "cool" | "heat";

export interface BaseDevice {
  uuid: string;
  name: string;
  type: DeviceType;
  owner: string | null;
  state: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface LedStripState {
  power?: boolean;
  brightness?: number;
  color?: string;
  mode?: LedStripMode;
  speed?: number;
}

export interface ThermostatState {
  temperature?: number;
  mode?: ThermostatMode;
}

export interface SmartLockState {
  locked?: boolean;
}

export interface SensorState {
  temperature?: number;
  humidity?: number;
}

export interface LedStripDevice extends Omit<BaseDevice, "state"> {
  type: "LED_STRIP";
  state: LedStripState;
}

export interface ThermostatDevice extends Omit<BaseDevice, "state"> {
  type: "thermostat";
  state: ThermostatState;
}

export interface SmartLockDevice extends Omit<BaseDevice, "state"> {
  type: "smart_lock";
  state: SmartLockState;
}

export interface SensorDevice extends Omit<BaseDevice, "state"> {
  type: "sensor";
  state: SensorState;
}
