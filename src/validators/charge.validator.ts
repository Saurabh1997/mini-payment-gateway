import { z } from 'zod';

export const chargeRequestSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount cannot exceed $1,000,000'),
  currency: z.string().length(3, 'Currency must be 3 characters').toUpperCase(),
  source: z.string().min(1, 'Source is required'),
  email: z.string().email('Invalid email format')
});

export type ChargeRequestSchema = z.infer<typeof chargeRequestSchema>;

export const validateChargeRequest = (data: unknown) => {
  return chargeRequestSchema.safeParse(data);
};

export const createValidationError = (errors: z.ZodError) => {
  return {
    error: 'Validation failed',
    details: errors.issues.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
};