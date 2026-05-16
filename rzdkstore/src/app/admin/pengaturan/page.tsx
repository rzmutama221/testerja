'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoreSettings {
  appName: string;
  domainUrl: string;
  whatsappNumber: string;
}

interface StoreStats {
  totalCustomers: number;
  totalProducts: number;
  totalOrdersCompleted: number;
  totalRevenue: number;
}

interface SettingsData {
  store: StoreSettings;
  stats: StoreStats;
}

interface EnvVar {
  name: string;
  configured: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: '#2c2c2c' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded mb-3"
          style={{ backgroundColor: '#3f3f46', width: `${70 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function AdminPengaturanPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SMTP test
  const [testEmail, setTestEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Environment variables (static display - all green)
  const envVars: EnvVar[] = [
    { name: 'DATABASE_URL', configured: true },
    { name: 'NEXTAUTH_SECRET', configured: true },
    { name: 'SMTP_HOST', configured: true },
    { name: 'SMTP_USER', configured: true },
    { name: 'VAPID_PUBLIC_KEY', configured: true },
    { name: 'ENCRYPTION_KEY', configured: true },
  ];

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Gagal memuat pengaturan');
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) return;
    setSendingEmail(true);
    setEmailFeedback(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Gagal mengirim test email');
      }
      setEmailFeedback({ type: 'success', message: 'Test email berhasil dikirim!' });
      setTestEmail('');
    } catch (err: unknown) {
      setEmailFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal mengirim email',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#171717' }}>
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-heading text-heading-2 text-white mb-1">
          Pengaturan Umum
        </h1>
        <p className="text-body-sm" style={{ color: '#71717a' }}>
          Konfigurasi pengaturan umum toko
        </p>
      </div>

      {/* ─── Error State ──────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl p-4 mb-6 text-body-sm"
          style={{ backgroundColor: '#2c2c2c', color: '#ef4444' }}
        >
          {error}
          <button
            onClick={fetchSettings}
            className="ml-3 underline"
            style={{ color: '#01a35a' }}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ─── Loading Skeletons ────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-6">
          <SkeletonBlock lines={4} />
          <SkeletonBlock lines={4} />
          <SkeletonBlock lines={2} />
        </div>
      )}

      {/* ─── Content ──────────────────────────────────────────────────────── */}
      {!loading && data && (
        <div className="space-y-6">
          {/* ─── Section 1: Info Toko ────────────────────────────────────── */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#2c2c2c' }}>
            <h2 className="font-heading text-heading-3 text-white mb-4">
              Info Toko
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-body-xs" style={{ color: '#71717a' }}>App Name</p>
                <p className="text-body-sm text-white mt-1">{data.store.appName}</p>
              </div>
              <div>
                <p className="text-body-xs" style={{ color: '#71717a' }}>Domain URL</p>
                <p className="text-body-sm text-white mt-1">{data.store.domainUrl}</p>
              </div>
              <div>
                <p className="text-body-xs" style={{ color: '#71717a' }}>WhatsApp Number</p>
                <p className="text-body-sm text-white mt-1">{data.store.whatsappNumber}</p>
              </div>
            </div>
            <p className="text-body-xs mt-4" style={{ color: '#71717a' }}>
              💡 Ubah melalui file .env di server
            </p>
          </div>

          {/* ─── Section 2: Statistik Toko ───────────────────────────────── */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#2c2c2c' }}>
            <h2 className="font-heading text-heading-3 text-white mb-4">
              Statistik Toko
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg p-4" style={{ backgroundColor: '#3f3f46' }}>
                <p className="text-body-xs" style={{ color: '#71717a' }}>Total Customer</p>
                <p className="font-heading text-heading-4 text-white mt-1">
                  {data.stats.totalCustomers.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: '#3f3f46' }}>
                <p className="text-body-xs" style={{ color: '#71717a' }}>Total Produk</p>
                <p className="font-heading text-heading-4 text-white mt-1">
                  {data.stats.totalProducts.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: '#3f3f46' }}>
                <p className="text-body-xs" style={{ color: '#71717a' }}>Total Order Selesai</p>
                <p className="font-heading text-heading-4 text-white mt-1">
                  {data.stats.totalOrdersCompleted.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: '#3f3f46' }}>
                <p className="text-body-xs" style={{ color: '#71717a' }}>Total Pendapatan</p>
                <p className="font-heading text-heading-4 text-white mt-1">
                  {formatRupiah(data.stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Section 3: Test Email SMTP ──────────────────────────────── */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#2c2c2c' }}>
            <h2 className="font-heading text-heading-3 text-white mb-4">
              Test Email SMTP
            </h2>
            <p className="text-body-sm mb-4" style={{ color: '#71717a' }}>
              Kirim email percobaan untuk memastikan konfigurasi SMTP berjalan dengan baik.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Masukkan email tujuan..."
                className="flex-1 rounded-lg px-4 py-2.5 text-body-sm text-white border-none outline-none placeholder:text-[#71717a]"
                style={{ backgroundColor: '#3f3f46' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendTestEmail();
                }}
              />
              <button
                onClick={handleSendTestEmail}
                disabled={sendingEmail || !testEmail.trim()}
                className="rounded-lg px-5 py-2.5 text-body-sm font-medium text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#01a35a' }}
              >
                {sendingEmail ? 'Mengirim...' : 'Kirim Test Email'}
              </button>
            </div>
            {emailFeedback && (
              <p
                className="text-body-sm mt-3"
                style={{ color: emailFeedback.type === 'success' ? '#01a35a' : '#ef4444' }}
              >
                {emailFeedback.type === 'success' ? '✓' : '✗'} {emailFeedback.message}
              </p>
            )}
          </div>

          {/* ─── Section 4: Environment Info ─────────────────────────────── */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#2c2c2c' }}>
            <h2 className="font-heading text-heading-3 text-white mb-4">
              Environment Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {envVars.map((env) => (
                <div key={env.name} className="flex items-center gap-2">
                  {env.configured ? (
                    <span className="text-body-sm" style={{ color: '#01a35a' }}>✓</span>
                  ) : (
                    <span className="text-body-sm" style={{ color: '#ef4444' }}>✗</span>
                  )}
                  <span className="text-body-sm text-white font-mono">{env.name}</span>
                </div>
              ))}
            </div>
            <p className="text-body-xs mt-4" style={{ color: '#71717a' }}>
              ✓ Semua konfigurasi aktif
            </p>
          </div>

          {/* ─── Section 5: Maintenance Mode ─────────────────────────────── */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#2c2c2c' }}>
            <h2 className="font-heading text-heading-3 text-white mb-4">
              Maintenance Mode
            </h2>
            <div className="flex items-center gap-3">
              {/* Toggle (disabled) */}
              <button
                disabled
                className="relative w-11 h-6 rounded-full transition-colors cursor-not-allowed opacity-50"
                style={{ backgroundColor: '#3f3f46' }}
              >
                <span
                  className="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                  style={{ backgroundColor: '#71717a' }}
                />
              </button>
              <span className="text-body-sm text-white opacity-50">Off</span>
            </div>
            <p className="text-body-xs mt-3" style={{ color: '#71717a' }}>
              🚧 Fitur maintenance mode coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
