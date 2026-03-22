import { z } from 'zod';
import { LedStripModes } from './device';

export const ledStripModes = LedStripModes;

export const createLedStripSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo'),
  brightness: z.number().min(0).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser formato hex')
    .optional(),
  mode: z.enum(LedStripModes).optional(),
  speed: z.number().min(1).max(255).optional(),
});

export const updateLedStripSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    brightness: z.number().min(0).max(100).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
    mode: z.enum(LedStripModes).optional(),
    speed: z.number().min(1).max(255).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo a actualizar',
  });

export type CreateLedStripInput = z.infer<typeof createLedStripSchema>;
export type UpdateLedStripInput = z.infer<typeof updateLedStripSchema>;
