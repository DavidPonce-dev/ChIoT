import { z } from 'zod';

export const createSensorSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
});

export type CreateSensorInput = z.infer<typeof createSensorSchema>;
