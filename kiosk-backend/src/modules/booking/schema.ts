import { z } from 'zod';

export const bookUnitSchema = z.object({
  unitId: z
    .number({ message: 'Valid unitId is required' })
    .int('unitId must be an integer')
    .positive('Valid unitId is required'),
  customerName: z
    .string({ message: 'Customer name is required' })
    .trim()
    .min(2, 'Customer name must be at least 2 characters long'),
  phone: z
    .string({ message: 'Phone number is required' })
    .trim()
    .refine((val) => val.replace(/[^\d]/g, '').length >= 7, {
      message: 'Phone number must contain at least 7 digits',
    }),
  sessionId: z.string().optional().default('default'),
});

export type BookUnitInput = z.infer<typeof bookUnitSchema>;
