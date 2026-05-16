'use client';

import { useEffect, useRef, useState } from 'react';

interface PaymentSettings {
  qrisEnabled: boolean;
  qrisImagePath: string;
  gatewayEnabled: boolean;
  gatewayProvider: string;
  gatewayApiKey: string;
  gatewaySecretKey: string;
  activeMethod: 'QRIS_ONLY' | 'GATEWAY_ONLY' | 'BOTH';
  paymentTimeoutHours: number;
}

const defaultSettings: PaymentSettings = {
  qrisEnabled: false,
  qrisImagePath: '',
  gatewayEnabled: false,
  gatewayProvider: '',
  gatewayApiKey: '',
  gatewaySecretKey: '',
  activeMethod: 'QRIS_ONLY',
  paymentTimeoutHours: 24,
};

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payment-settings');
      if (!res.ok) throw new Error('Gagal memuat pengaturan');
      const data = await res.json();
      setSettings({ ...defaultSettings, ...data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat pengaturan';
      setToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Gagal menyimpan pengaturan');
      setToast({ type: 'success', message: 'Pengaturan berhasil disimpan!' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan';
      setToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadQris(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Gagal upload QRIS');
      const data = await res.json();
      setSettings((prev) => ({ ...prev, qrisImagePath: data.qrisImagePath || prev.qrisImagePath }));
      setImageTimestamp(Date.now());
      setToast({ type: 'success', message: 'QRIS berhasil diupload!' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal upload QRIS';
      setToast({ type: 'error', message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-body-sm text-muted-foreground">Memuat pengaturan...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-body-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-[#01a35a] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-heading-2 text-white mb-2">Pengaturan Payment</h1>
        <p className="text-body-sm text-[#71717a]">
          Konfigurasi metode pembayaran QRIS dan payment gateway
        </p>
      </div>

      {/* Section 1: QRIS Statis */}
      <section className="bg-[#2c2c2c] rounded-xl p-6 mb-6 border border-[#3f3f46]">
        <h2 className="font-heading text-heading-3 text-white mb-4">QRIS Statis</h2>

        {/* Toggle QRIS Aktif */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.qrisEnabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, qrisEnabled: e.target.checked }))}
            disabled={saving}
            className="w-5 h-5 rounded border-[#3f3f46] bg-[#171717] text-[#01a35a] focus:ring-[#01a35a] focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-body-sm text-white">QRIS Aktif</span>
        </label>

        {/* QRIS Image Preview */}
        <div className="mb-5">
          <p className="text-body-xs text-[#71717a] mb-2">Preview QRIS saat ini:</p>
          {settings.qrisImagePath ? (
            <div className="border border-[#3f3f46] rounded-lg overflow-hidden inline-block bg-white p-2">
              <img
                src={`${settings.qrisImagePath}?t=${imageTimestamp}`}
                alt="QRIS Code"
                className="max-w-[240px] max-h-[240px] object-contain"
              />
            </div>
          ) : (
            <div className="w-[240px] h-[240px] border border-dashed border-[#3f3f46] rounded-lg flex items-center justify-center bg-[#171717]">
              <span className="text-body-xs text-[#71717a]">Belum ada QRIS</span>
            </div>
          )}
        </div>

        {/* Upload QRIS */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadQris}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || saving}
            className="px-4 py-2 bg-[#01a35a] hover:bg-[#019150] text-white text-body-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Mengupload...' : 'Upload QRIS Baru'}
          </button>
        </div>

        <p className="text-body-xs text-[#71717a]">
          Gambar ini akan ditampilkan ke customer saat pembayaran
        </p>
      </section>

      {/* Section 2: Payment Gateway */}
      <section className="bg-[#2c2c2c] rounded-xl p-6 mb-6 border border-[#3f3f46]">
        <h2 className="font-heading text-heading-3 text-white mb-4">Payment Gateway (Opsional)</h2>

        {/* Toggle Gateway Aktif */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.gatewayEnabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, gatewayEnabled: e.target.checked }))}
            disabled={saving}
            className="w-5 h-5 rounded border-[#3f3f46] bg-[#171717] text-[#01a35a] focus:ring-[#01a35a] focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-body-sm text-white">Gateway Aktif</span>
        </label>

        {/* Provider */}
        <div className="mb-4">
          <label className="block text-body-xs text-[#71717a] mb-1.5">Provider</label>
          <input
            type="text"
            value={settings.gatewayProvider}
            onChange={(e) => setSettings((prev) => ({ ...prev, gatewayProvider: e.target.value }))}
            placeholder='Contoh: "Midtrans", "Xendit"'
            disabled={saving}
            className="w-full px-4 py-2.5 bg-[#171717] border border-[#3f3f46] rounded-lg text-body-sm text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#01a35a] transition-colors disabled:opacity-50"
          />
        </div>

        {/* API Key */}
        <div className="mb-4">
          <label className="block text-body-xs text-[#71717a] mb-1.5">API Key</label>
          <input
            type="password"
            value={settings.gatewayApiKey}
            onChange={(e) => setSettings((prev) => ({ ...prev, gatewayApiKey: e.target.value }))}
            placeholder="Masukkan API Key"
            disabled={saving}
            className="w-full px-4 py-2.5 bg-[#171717] border border-[#3f3f46] rounded-lg text-body-sm text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#01a35a] transition-colors disabled:opacity-50"
          />
        </div>

        {/* Secret Key */}
        <div className="mb-4">
          <label className="block text-body-xs text-[#71717a] mb-1.5">Secret Key</label>
          <input
            type="password"
            value={settings.gatewaySecretKey}
            onChange={(e) => setSettings((prev) => ({ ...prev, gatewaySecretKey: e.target.value }))}
            placeholder="Masukkan Secret Key"
            disabled={saving}
            className="w-full px-4 py-2.5 bg-[#171717] border border-[#3f3f46] rounded-lg text-body-sm text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#01a35a] transition-colors disabled:opacity-50"
          />
        </div>

        <p className="text-body-xs text-[#71717a]">
          Jika gateway error, switch ke QRIS manual tanpa perlu sentuh kode
        </p>
      </section>

      {/* Section 3: Metode Aktif */}
      <section className="bg-[#2c2c2c] rounded-xl p-6 mb-6 border border-[#3f3f46]">
        <h2 className="font-heading text-heading-3 text-white mb-4">Metode Aktif</h2>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-[#3f3f46] hover:border-[#01a35a] transition-colors">
            <input
              type="radio"
              name="activeMethod"
              value="QRIS_ONLY"
              checked={settings.activeMethod === 'QRIS_ONLY'}
              onChange={() => setSettings((prev) => ({ ...prev, activeMethod: 'QRIS_ONLY' }))}
              disabled={saving}
              className="mt-0.5 w-4 h-4 text-[#01a35a] bg-[#171717] border-[#3f3f46] focus:ring-[#01a35a] focus:ring-offset-0"
            />
            <div>
              <span className="text-body-sm text-white font-medium block">QRIS Only</span>
              <span className="text-body-xs text-[#71717a]">
                Hanya tampilkan QRIS statis ke customer
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-[#3f3f46] hover:border-[#01a35a] transition-colors">
            <input
              type="radio"
              name="activeMethod"
              value="GATEWAY_ONLY"
              checked={settings.activeMethod === 'GATEWAY_ONLY'}
              onChange={() => setSettings((prev) => ({ ...prev, activeMethod: 'GATEWAY_ONLY' }))}
              disabled={saving}
              className="mt-0.5 w-4 h-4 text-[#01a35a] bg-[#171717] border-[#3f3f46] focus:ring-[#01a35a] focus:ring-offset-0"
            />
            <div>
              <span className="text-body-sm text-white font-medium block">Gateway Only</span>
              <span className="text-body-xs text-[#71717a]">
                Hanya gunakan payment gateway (verifikasi otomatis)
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-[#3f3f46] hover:border-[#01a35a] transition-colors">
            <input
              type="radio"
              name="activeMethod"
              value="BOTH"
              checked={settings.activeMethod === 'BOTH'}
              onChange={() => setSettings((prev) => ({ ...prev, activeMethod: 'BOTH' }))}
              disabled={saving}
              className="mt-0.5 w-4 h-4 text-[#01a35a] bg-[#171717] border-[#3f3f46] focus:ring-[#01a35a] focus:ring-offset-0"
            />
            <div>
              <span className="text-body-sm text-white font-medium block">Both</span>
              <span className="text-body-xs text-[#71717a]">
                Customer bisa pilih antara QRIS manual atau gateway
              </span>
            </div>
          </label>
        </div>
      </section>

      {/* Section 4: Batas Waktu Pembayaran */}
      <section className="bg-[#2c2c2c] rounded-xl p-6 mb-8 border border-[#3f3f46]">
        <h2 className="font-heading text-heading-3 text-white mb-4">Batas Waktu Pembayaran</h2>

        <div className="mb-3">
          <label className="block text-body-xs text-[#71717a] mb-1.5">
            Timeout (jam)
          </label>
          <input
            type="number"
            min={1}
            value={settings.paymentTimeoutHours}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                paymentTimeoutHours: parseInt(e.target.value) || 24,
              }))
            }
            disabled={saving}
            className="w-32 px-4 py-2.5 bg-[#171717] border border-[#3f3f46] rounded-lg text-body-sm text-white focus:outline-none focus:border-[#01a35a] transition-colors disabled:opacity-50"
          />
        </div>

        <p className="text-body-xs text-[#71717a]">
          Jika customer tidak upload bukti dalam X jam, order otomatis dibatalkan
        </p>
      </section>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || uploading}
        className="w-full py-3 bg-[#01a35a] hover:bg-[#019150] text-white text-body-sm font-heading font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </div>
  );
}
