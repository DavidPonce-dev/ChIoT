export const DeviceTypes = {
  LED_STRIP: "LED_STRIP",
  THERMOSTAT: "thermostat",
  SMART_LOCK: "smart_lock",
  SENSOR: "sensor",
} as const;

export type DeviceType = (typeof DeviceTypes)[keyof typeof DeviceTypes];

export const LedStripModes = ["static", "rainbow", "fire", "wave", "candle"] as const;
export type LedStripMode = (typeof LedStripModes)[number];

export const ThermostatModes = ["off", "cool", "heat"] as const;
export type ThermostatMode = (typeof ThermostatModes)[number];

export interface BaseDevice {
  uuid: string;
  name: string;
  type: DeviceType;
  owner: string | null;
  state: {
    [key: string]: unknown;
  };
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
  type: typeof DeviceTypes.LED_STRIP;
  state: LedStripState;
}

export interface ThermostatDevice extends Omit<BaseDevice, "state"> {
  type: typeof DeviceTypes.THERMOSTAT;
  state: ThermostatState;
}

export interface SmartLockDevice extends Omit<BaseDevice, "state"> {
  type: typeof DeviceTypes.SMART_LOCK;
  state: SmartLockState;
}

export interface SensorDevice extends Omit<BaseDevice, "state"> {
  type: typeof DeviceTypes.SENSOR;
  state: SensorState;
}

export type AnyDevice = LedStripDevice | ThermostatDevice | SmartLockDevice | SensorDevice;
