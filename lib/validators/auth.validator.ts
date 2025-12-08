import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email('Invalid email format')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
