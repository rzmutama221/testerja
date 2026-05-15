'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';

/**
 * Halaman Reset Password
 *
 * Flow:
 * - User klik link dari email → /reset-password?token=xxxxx
 * - User isi password baru + konfirmasi
 * - Submit ke POST /api/auth/reset-password
 * - Tampilkan sukses + link ke login
 */
export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Jika tidak ada token di URL
  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark px-4">
        <div className="w-full max-w-md p-8 bg-dark-card border border-dark-border rounded-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-heading text-heading-3 text-white mb-2">Token Tidak Valid</h1>
          <p className="text-body-sm text-muted-foreground mb-6">
            Link reset password tidak valid atau sudah kedaluwarsa.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors text-center"
          >
            Minta Link Baru
          </Link>
        </div>
      </main>
    );
  }

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...data }),
      });

      const result = await res.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  // Tampilan sukses
  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark px-4">
        <div className="w-full max-w-md p-8 bg-dark-card border border-dark-border rounded-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-heading-3 text-white mb-2">Password Berhasil Direset!</h1>
          <p className="text-body-sm text-muted-foreground mb-6">
            Password Anda telah berhasil diubah. Silakan login dengan password baru.
          </p>
          <Link
            href="/login"
            className="inline-block w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors text-center"
          >
            Login Sekarang
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md p-8 bg-dark-card border border-dark-border rounded-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="font-heading text-heading-4 text-white">
              <span className="text-primary">rzdk</span>store
            </span>
          </Link>
          <h1 className="font-heading text-heading-3 text-white mb-1">Reset Password</h1>
          <p className="text-body-sm text-muted-foreground">
            Buat password baru untuk akun Anda
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password Baru */}
          <div>
            <label htmlFor="password" className="block text-body-sm font-medium text-white mb-1.5">
              Password Baru
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
              Konfirmasi Password Baru
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Ketik ulang password baru"
              disabled={isLoading}
              {...register('confirmPassword')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-body-xs text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </span>
            ) : (
              'Simpan Password Baru'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          Ingat password?{' '}
          <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
