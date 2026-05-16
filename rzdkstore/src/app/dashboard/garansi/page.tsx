'use client';

import { useState, useEffect, useCallback } from 'react';

interface OrderVariant {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  guaranteeDays: number | null;
  product: {
    id: string;
    name: string;
    logoUrl: string;
    fulfillType: string;
    category: { name: string; icon: string };
  };
}

interface EligibleOrder {
  id: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
  variant: OrderVariant;
  guaranteeValidUntil: Date;
}

interface GuaranteeClaim {
  id: string;
  orderId: string;
  description: string;
  attachmentUrl: string | null;
  status: 'OPEN' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  adminNote: string | null;
  guaranteeValidUntil: string;
  createdAt: string;
  order: {
    id: string;
    completedAt: string | null;
    expiredAt: string | null;
    variant: {
      name: string;
      guaranteeDays: number | null;
      durationDays: number;
      product: { name: string; category: { icon: string } };
    };
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-yellow-600 text-yellow-100' },
  IN_REVIEW: { label: 'In Review', color: 'bg-blue-600 text-blue-100' },
  APPROVED: { label: 'Approved', color: 'bg-blue-600 text-blue-100' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-600 text-green-100' },
  REJECTED: { label: 'Rejected', color: 'bg-red-600 text-red-100' },
};

export default function GaransiPage() {
  const [activeTab, setActiveTab] = useState<'buat' | 'riwayat'>('buat');

  return (
    <div>
      <h1 className="font-heading text-heading-2 text-white mb-2">Klaim Garansi</h1>
      <p className="text-body-sm text-muted-foreground mb-6">
        Ajukan dan pantau status klaim garansi Anda
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('buat')}
          className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
            activeTab === 'buat'
              ? 'bg-[#01a35a] text-white'
              : 'bg-[#2c2c2c] text-muted-foreground hover:text-white'
          }`}
        >
          Buat Klaim
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
            activeTab === 'riwayat'
              ? 'bg-[#01a35a] text-white'
              : 'bg-[#2c2c2c] text-muted-foreground hover:text-white'
          }`}
        >
          Riwayat Klaim
        </button>
      </div>

      {activeTab === 'buat' && <BuatKlaimTab />}
      {activeTab === 'riwayat' && <RiwayatKlaimTab />}
    </div>
  );
}

function BuatKlaimTab() {
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchEligibleOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?status=COMPLETED');
      const json = await res.json();
      if (json.success && json.data) {
        const now = new Date();
        const filtered: EligibleOrder[] = [];

        for (const order of json.data) {
          const guaranteeDays = order.variant.guaranteeDays ?? order.variant.durationDays;
          if (guaranteeDays === 0) continue;

          const completedAt = new Date(order.completedAt || order.createdAt);
          const validUntil = new Date(completedAt);
          validUntil.setDate(validUntil.getDate() + guaranteeDays);

          if (now < validUntil) {
            filtered.push({ ...order, guaranteeValidUntil: validUntil });
          }
        }

        setEligibleOrders(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEligibleOrders();
  }, [fetchEligibleOrders]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selected.type)) {
      setError('Format file harus JPG, PNG, atau WebP');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }
    setFile(selected);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedOrderId) {
      setError('Pilih order terlebih dahulu');
      return;
    }
    if (description.length < 10) {
      setError('Deskripsi masalah minimal 10 karakter');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', selectedOrderId);
      formData.append('description', description);
      if (file) formData.append('file', file);

      const res = await fetch('/api/guarantees', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setSuccess(true);
        setSelectedOrderId('');
        setDescription('');
        setFile(null);
        fetchEligibleOrders();
      } else {
        setError(json.message || 'Gagal mengajukan klaim');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#2c2c2c] rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-[#3f3f46] rounded w-1/3 mb-4" />
        <div className="h-10 bg-[#3f3f46] rounded mb-4" />
        <div className="h-24 bg-[#3f3f46] rounded mb-4" />
        <div className="h-10 bg-[#3f3f46] rounded w-1/4" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-[#2c2c2c] rounded-xl p-6 border border-green-600/30">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="font-heading text-heading-3 text-white mb-2">
            Klaim berhasil diajukan
          </h3>
          <p className="text-body-sm text-muted-foreground mb-6">
            Tim kami akan meninjau klaim Anda. Pantau statusnya di tab Riwayat Klaim.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-4 py-2 bg-[#01a35a] text-white rounded-lg text-body-sm hover:bg-[#01a35a]/90 transition-colors"
          >
            Ajukan Klaim Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2c2c2c] rounded-xl p-6">
      <h2 className="font-heading text-heading-4 text-white mb-4">Formulir Klaim Garansi</h2>

      {eligibleOrders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">📦</div>
          <p className="text-body-sm text-muted-foreground">
            Tidak ada order yang eligible untuk klaim garansi saat ini.
          </p>
          <p className="text-body-xs text-muted-foreground mt-1">
            Hanya order COMPLETED dengan masa garansi aktif yang bisa diklaim.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Selector */}
          <div>
            <label className="block text-body-sm text-white mb-2">Pilih Order</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full bg-[#171717] border border-[#3f3f46] rounded-lg px-4 py-2.5 text-white text-body-sm focus:outline-none focus:border-[#01a35a] transition-colors"
            >
              <option value="">— Pilih order —</option>
              {eligibleOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.variant.product.name} — {order.variant.name} (#{order.id})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-body-sm text-white mb-2">Deskripsi Masalah</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan masalah yang Anda alami (min. 10 karakter)..."
              rows={4}
              className="w-full bg-[#171717] border border-[#3f3f46] rounded-lg px-4 py-2.5 text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#01a35a] transition-colors resize-none"
            />
            <p className="text-body-xs text-muted-foreground mt-1">
              {description.length}/10 karakter minimum
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-body-sm text-white mb-2">
              Screenshot (opsional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full bg-[#171717] border border-[#3f3f46] rounded-lg px-4 py-2.5 text-white text-body-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#3f3f46] file:text-white file:text-body-xs file:cursor-pointer focus:outline-none"
            />
            <p className="text-body-xs text-muted-foreground mt-1">
              Format: JPG, PNG, WebP. Maks 5MB
            </p>
            {file && (
              <p className="text-body-xs text-[#01a35a] mt-1">
                File terpilih: {file.name}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3">
              <p className="text-body-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#01a35a] text-white rounded-lg text-body-sm font-medium hover:bg-[#01a35a]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Mengirim...' : 'Ajukan Klaim Garansi'}
          </button>
        </form>
      )}
    </div>
  );
}

function RiwayatKlaimTab() {
  const [claims, setClaims] = useState<GuaranteeClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await fetch('/api/guarantees');
        const json = await res.json();
        if (json.success) {
          setClaims(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch claims:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#2c2c2c] rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-[#3f3f46] rounded w-2/3 mb-3" />
            <div className="h-3 bg-[#3f3f46] rounded w-1/2 mb-2" />
            <div className="h-3 bg-[#3f3f46] rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="bg-[#2c2c2c] rounded-xl p-6 text-center py-12">
        <div className="text-3xl mb-3">📋</div>
        <p className="text-body-sm text-muted-foreground">
          Belum ada riwayat klaim garansi.
        </p>
        <p className="text-body-xs text-muted-foreground mt-1">
          Klaim yang Anda ajukan akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => {
        const statusInfo = statusConfig[claim.status] || statusConfig.OPEN;
        return (
          <div key={claim.id} className="bg-[#2c2c2c] rounded-xl p-5 border border-[#3f3f46]">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-body-sm text-white font-medium">
                  {claim.order.variant.product.name} — {claim.order.variant.name}
                </p>
                <p className="text-body-xs text-muted-foreground mt-0.5">
                  Order #{claim.orderId}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-body-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Description */}
            <p className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
              {claim.description}
            </p>

            {/* Admin Note */}
            {claim.adminNote && (
              <div className="bg-[#171717] rounded-lg p-3 mb-3 border border-[#3f3f46]">
                <p className="text-body-xs text-muted-foreground mb-1 font-medium">Catatan Admin:</p>
                <p className="text-body-sm text-white">{claim.adminNote}</p>
              </div>
            )}

            {/* Attachment Thumbnail */}
            {claim.attachmentUrl && (
              <div className="mb-3">
                <img
                  src={claim.attachmentUrl}
                  alt="Lampiran klaim"
                  className="w-20 h-20 object-cover rounded-lg border border-[#3f3f46]"
                />
              </div>
            )}

            {/* Footer */}
            <p className="text-body-xs text-muted-foreground">
              Diajukan: {new Date(claim.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
