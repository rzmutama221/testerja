import { z } from 'zod';

/**
 * Validation schemas untuk auth forms.
 * Digunakan di frontend (React Hook Form) dan backend (API routes).
 */

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    username: z
      .string()
      .min(3, 'Username minimal 3 karakter')
      .max(30, 'Username maksimal 30 karakter')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username hanya boleh mengandung huruf, angka, dan underscore'
      ),
    email: z.string().email('Format email tidak valid'),
    whatsapp: z
      .string()
      .min(10, 'Nomor WhatsApp minimal 10 digit')
      .max(15, 'Nomor WhatsApp maksimal 15 digit')
      .regex(/^[0-9]+$/, 'Nomor WhatsApp hanya boleh angka'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
