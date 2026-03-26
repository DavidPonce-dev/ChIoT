import { z } from 'zod';
import { DeviceTypes, LedStripModes, ThermostatModes } from '../../shared/types/devices';

export { DeviceTypes, LedStripModes, ThermostatModes };
export type { DeviceType, LedStripMode, ThermostatMode } from '../../shared/types/devices';

export const deviceTypesList = Object.values(DeviceTypes);

export const createDeviceSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo'),
  type: z.enum(deviceTypesList as [string, ...string[]], {
    error: `Tipo debe ser uno de: ${deviceTypesList.join(', ')}`,
  }),
});

export const uuidParamSchema = z.object({
  uuid: z.string().uuid('UUID inválido'),
});

export const claimDeviceSchema = z.object({
  uuid: z.string().uuid('UUID inválido'),
});

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
