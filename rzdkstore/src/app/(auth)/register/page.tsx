'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';

/**
 * Halaman Register
 *
 * Features:
 * - Form: Nama Lengkap, Username, Email, No. WhatsApp, Password, Konfirmasi Password
 * - Validasi real-time (Zod via React Hook Form)
 * - Submit ke POST /api/auth/register
 * - Setelah sukses: tampilkan pesan cek email verifikasi
 */
export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setSuccess(true);
      } else {
        // Set field-level errors jika ada
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            setFieldError(field as keyof RegisterInput, {
              message: (messages as string[])[0],
            });
          });
        }
        setError(result.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  // Tampilan sukses — pesan cek email
  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark px-4">
        <div className="w-full max-w-md p-8 bg-dark-card border border-dark-border rounded-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-heading text-heading-3 text-white mb-2">Cek Email Anda!</h1>
          <p className="text-body-sm text-muted-foreground mb-6">
            Kami telah mengirim link verifikasi ke email Anda. Klik link tersebut untuk mengaktifkan akun.
          </p>
          <p className="text-body-xs text-muted-foreground mb-6">
            Tidak menerima email? Cek folder spam Anda, atau tunggu beberapa menit.
          </p>
          <Link
            href="/login"
            className="inline-block w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors text-center"
          >
            Kembali ke Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-4 py-8">
      <div className="w-full max-w-md p-8 bg-dark-card border border-dark-border rounded-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="font-heading text-heading-4 text-white">
              <span className="text-primary">rzdk</span>store
            </span>
          </Link>
          <h1 className="font-heading text-heading-3 text-white mb-1">Daftar Akun</h1>
          <p className="text-body-sm text-muted-foreground">
            Buat akun baru untuk mulai berbelanja
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label htmlFor="fullName" className="block text-body-sm font-medium text-white mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Masukkan nama lengkap"
              disabled={isLoading}
              {...register('fullName')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.fullName && (
              <p className="mt-1 text-body-xs text-error">{errors.fullName.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-body-sm font-medium text-white mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Huruf, angka, underscore"
              disabled={isLoading}
              {...register('username')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.username && (
              <p className="mt-1 text-body-xs text-error">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-body-sm font-medium text-white mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="contoh@email.com"
              disabled={isLoading}
              {...register('email')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.email && (
              <p className="mt-1 text-body-xs text-error">{errors.email.message}</p>
            )}
          </div>

          {/* No. WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-body-sm font-medium text-white mb-1.5">
              No. WhatsApp
            </label>
            <input
              id="whatsapp"
              type="tel"
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
              disabled={isLoading}
              {...register('whatsapp')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.whatsapp && (
              <p className="mt-1 text-body-xs text-error">{errors.whatsapp.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-body-sm font-medium text-white mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 karakter, 1 huruf besar, 1 angka"
              disabled={isLoading}
              {...register('password')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.password && (
              <p className="mt-1 text-body-xs text-error">{errors.password.message}</p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-body-sm font-medium text-white mb-1.5">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Ketik ulang password"
              disabled={isLoading}
              {...register('confirmPassword')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-body-xs text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mendaftarkan...
              </span>
            ) : (
              'Daftar Akun'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
