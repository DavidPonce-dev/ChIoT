const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const DEFAULT_TIMEOUT = 10000;

interface FetchOptions extends RequestInit {
  token?: string;
  timeout?: number;
}

let authCallback: (() => void) | null = null;

export function setAuthCallback(callback: () => void) {
  authCallback = callback;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = 3,
  timeout = DEFAULT_TIMEOUT
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);
      
      if (response.status === 401 && attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
        continue;
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Error desconocido" }));
        if (response.status === 401) {
          authCallback?.();
        }
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries && !(err instanceof Error && err.name === "AbortError")) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
      }
    }
  }
  
  throw lastError || new Error("Request failed after retries");
}

export async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof options.headers === 'object' && options.headers !== null 
      ? options.headers as Record<string, string> 
      : {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetchWithRetry<T>(
    `${API_URL}${endpoint}`,
    { ...fetchOptions, headers, credentials: "include" },
    3,
    timeout
  );
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI<{ success: boolean; message?: string; error?: string; user?: { id: string; email: string }; token?: string }>("/api/auth/login", {
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
    logoutWithToken: (token: string) =>
      fetchAPI<{ success: boolean }>("/api/auth/logout", {
        method: "POST",
        token,
      }),
    me: () =>
      fetchAPI<{ user: { _id: string; email: string } }>("/api/auth/me"),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      fetchAPI<{ success: boolean; message?: string }>("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
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
