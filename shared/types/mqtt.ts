export const MQTT_ACTIONS = {
  LED_STRIP: {
    SET_COLOR: "set_color",
    SET_BRIGHTNESS: "set_brightness",
    SET_MODE: "set_mode",
    SET_SPEED: "set_speed",
    TURN_ON: "turn_on",
    TURN_OFF: "turn_off",
  },
  THERMOSTAT: {
    SET_TEMPERATURE: "set_temperature",
    SET_MODE: "set_mode",
    TURN_ON: "turn_on",
    TURN_OFF: "turn_off",
  },
  SENSOR: {
    REQUEST_READING: "request_reading",
  },
  SMART_LOCK: {
    LOCK: "lock",
    UNLOCK: "unlock",
  },
} as const;

export type MQTTAction = string;

export interface MQTTCommand {
  uuid: string;
  action: MQTTAction;
  payload?: Record<string, unknown>;
  timestamp?: string;
}

export interface MQTTStateUpdate {
  uuid: string;
  state: Record<string, unknown>;
  timestamp?: string;
}
