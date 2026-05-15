'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';

/**
 * Halaman Login
 *
 * Features:
 * - Form: username + password
 * - Validasi Zod via React Hook Form
 * - Error: username tidak ditemukan, password salah, email belum verified
 * - Jika email belum verified: tampilkan tombol kirim ulang
 * - Redirect setelah login berdasarkan role (via middleware)
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setError('');
    setShowResendVerification(false);

    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setError('Email Anda belum terverifikasi. Cek inbox/spam email Anda.');
          setShowResendVerification(true);
        } else {
          setError(result.error);
        }
      } else {
        // Login berhasil — redirect
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!resendEmail) {
      setError('Masukkan email Anda di bawah untuk kirim ulang verifikasi.');
      return;
    }

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setResendSuccess(data.message);
        setError('');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Gagal mengirim ulang. Coba lagi.');
    }
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
          <h1 className="font-heading text-heading-3 text-white mb-1">Login</h1>
          <p className="text-body-sm text-muted-foreground">
            Masuk ke akun Anda untuk mulai berbelanja
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {resendSuccess && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-body-sm text-primary">{resendSuccess}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-body-sm font-medium text-white mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Masukkan username"
              disabled={isLoading}
              {...register('username')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.username && (
              <p className="mt-1 text-body-xs text-error">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-body-sm font-medium text-white">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-body-xs text-primary hover:text-primary-hover transition-colors"
              >
                Lupa Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan password"
              disabled={isLoading}
              {...register('password')}
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.password && (
              <p className="mt-1 text-body-xs text-error">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
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
                Memproses...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Resend Verification */}
        {showResendVerification && (
          <div className="mt-4 p-4 bg-dark border border-dark-border rounded-lg">
            <p className="text-body-xs text-muted-foreground mb-2">
              Kirim ulang email verifikasi:
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Email Anda"
                className="flex-1 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white text-body-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleResendVerification}
                className="px-3 py-2 bg-primary hover:bg-primary-hover text-white text-body-xs font-medium rounded-lg transition-colors"
              >
                Kirim
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
