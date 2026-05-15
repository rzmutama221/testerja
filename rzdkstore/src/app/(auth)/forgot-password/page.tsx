'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth';

/**
 * Halaman Lupa Password
 *
 * Flow:
 * - User isi email
 * - Submit ke POST /api/auth/forgot-password
 * - Tampilkan pesan sukses (cek email)
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-heading text-heading-3 text-white mb-2">Cek Email Anda</h1>
          <p className="text-body-sm text-muted-foreground mb-6">
            Jika email terdaftar, kami telah mengirim link untuk reset password. Cek inbox dan folder spam Anda.
          </p>
          <p className="text-body-xs text-muted-foreground mb-6">
            Link akan expired dalam 1 jam.
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
    <main className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md p-8 bg-dark-card border border-dark-border rounded-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="font-heading text-heading-4 text-white">
              <span className="text-primary">rzdk</span>store
            </span>
          </Link>
          <h1 className="font-heading text-heading-3 text-white mb-1">Lupa Password</h1>
          <p className="text-body-sm text-muted-foreground">
            Masukkan email Anda untuk menerima link reset password
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
          <div>
            <label htmlFor="email" className="block text-body-sm font-medium text-white mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Masukkan email terdaftar"
              disabled={isLoading}
              {...register('email')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.email && (
              <p className="mt-1 text-body-xs text-error">{errors.email.message}</p>
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
                Mengirim...
              </span>
            ) : (
              'Kirim Link Reset'
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
