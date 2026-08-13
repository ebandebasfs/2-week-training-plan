import { z } from 'zod';

export const createBookingSchema = z.object({
  slotId: z.string().uuid(),
  customerId: z.string().uuid(),
  notes: z.string().trim().min(1).optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
