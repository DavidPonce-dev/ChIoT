import { z } from "zod";

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

export const deviceTypesList = Object.values(DeviceTypes);

export const createDeviceSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100, "Nombre muy largo"),
  type: z.enum(deviceTypesList as [string, ...string[]], {
    error: `Tipo debe ser uno de: ${deviceTypesList.join(", ")}`,
  }),
});

export const uuidParamSchema = z.object({
  uuid: z.string().uuid("UUID inválido"),
});

export const claimDeviceSchema = z.object({
  uuid: z.string().uuid("UUID inválido"),
});

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
