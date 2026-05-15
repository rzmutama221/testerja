'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Halaman Verifikasi Email
 *
 * Flow:
 * - User klik link dari email → /verify-email?token=xxxxx
 * - Halaman ini otomatis call API verify-email
 * - Tampilkan status: loading, sukses, atau gagal
 */
export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('Token verifikasi tidak ditemukan di URL.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch {
        setStatus('error');
        setMessage('Terjadi kesalahan. Silakan coba lagi.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md p-8 bg-dark-card border border-dark-border rounded-xl text-center">
        {/* Icon */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {(status === 'error' || status === 'no-token') && (
            <div className="w-16 h-16 mx-auto rounded-full bg-error/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-heading text-heading-3 text-white mb-2">
          {status === 'loading' && 'Memverifikasi...'}
          {status === 'success' && 'Email Terverifikasi!'}
          {status === 'error' && 'Verifikasi Gagal'}
          {status === 'no-token' && 'Token Tidak Valid'}
        </h1>

        {/* Message */}
        <p className="text-body-sm text-muted-foreground mb-6">{message}</p>

        {/* Action Button */}
        {status === 'success' && (
          <Link
            href="/login"
            className="inline-block w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors text-center"
          >
            Login Sekarang
          </Link>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-block w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors text-center"
            >
              Kembali ke Login
            </Link>
            <p className="text-body-xs text-muted-foreground">
              Butuh kirim ulang?{' '}
              <Link href="/login" className="text-primary hover:text-primary-hover">
                Login dan kirim ulang verifikasi
              </Link>
            </p>
          </div>
        )}

        {status === 'no-token' && (
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 border border-dark-border text-white hover:bg-dark rounded-lg transition-colors text-center"
          >
            Kembali ke Beranda
          </Link>
        )}
      </div>
    </main>
  );
}
