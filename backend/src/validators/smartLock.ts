import { z } from 'zod';

export const createSmartLockSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
});

export type CreateSmartLockInput = z.infer<typeof createSmartLockSchema>;
