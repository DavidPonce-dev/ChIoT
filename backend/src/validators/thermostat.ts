import { z } from "zod";
import { ThermostatModes } from "./device";

export const createThermostatSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  temperature: z.number().min(0).max(50).optional(),
  mode: z.enum(ThermostatModes).optional(),
});

export const setTemperatureSchema = z.object({
  temperature: z.number().min(0, "Mín 0°C").max(50, "Máx 50°C"),
  mode: z.enum(ThermostatModes).optional(),
});

export const setThermostatModeSchema = z.object({
  mode: z.enum(ThermostatModes, { error: "Mode debe ser: off, cool, heat" }),
});

export type CreateThermostatInput = z.infer<typeof createThermostatSchema>;
export type SetTemperatureInput = z.infer<typeof setTemperatureSchema>;
