'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  fullName: string;
  username: string;
  email: string;
  whatsapp: string;
  emailVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  orderCount: number;
  guaranteeClaimsCount: number;
}

interface CustomersResponse {
  customers: Customer[];
  total: number;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl p-5 animate-pulse" style={{ backgroundColor: '#2c2c2c' }}>
      <div className="h-5 w-40 rounded mb-3" style={{ backgroundColor: '#3f3f46' }} />
      <div className="h-3 w-32 rounded mb-2" style={{ backgroundColor: '#3f3f46' }} />
      <div className="h-3 w-48 rounded mb-2" style={{ backgroundColor: '#3f3f46' }} />
      <div className="h-3 w-28 rounded mb-4" style={{ backgroundColor: '#3f3f46' }} />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded" style={{ backgroundColor: '#3f3f46' }} />
        <div className="h-6 w-16 rounded" style={{ backgroundColor: '#3f3f46' }} />
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Action feedback
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{ userId: string; action: 'suspend' | 'activate'; name: string } | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat data customer');
      const json: CustomersResponse = await res.json();
      setCustomers(json.customers);
      setTotal(json.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleAction = async (userId: string, action: 'suspend' | 'activate') => {
    setActionLoading(userId);
    setActionFeedback(null);
    setConfirmDialog(null);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `Gagal ${action === 'suspend' ? 'suspend' : 'aktivasi'} customer`);
      }
      setActionFeedback({
        type: 'success',
        message: `Customer berhasil di-${action === 'suspend' ? 'suspend' : 'aktivasi'}!`,
      });
      // Refresh data
      await fetchCustomers();
    } catch (err: unknown) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#171717' }}>
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-heading text-heading-2 text-white">
            Manajemen Customer
          </h1>
          {!loading && (
            <span
              className="text-body-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#3f3f46', color: '#71717a' }}
            >
              {total} customer
            </span>
          )}
        </div>
        <p className="text-body-sm" style={{ color: '#71717a' }}>
          Kelola data dan akun pelanggan
        </p>
      </div>

      {/* ─── Search Bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama, username, email, atau WhatsApp..."
          className="flex-1 rounded-lg px-4 py-2.5 text-body-sm text-white border-none outline-none placeholder:text-[#71717a]"
          style={{ backgroundColor: '#2c2c2c' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <button
          onClick={handleSearch}
          className="rounded-lg px-5 py-2.5 text-body-sm font-medium text-white transition-opacity"
          style={{ backgroundColor: '#01a35a' }}
        >
          Cari
        </button>
      </div>

      {/* ─── Action Feedback ──────────────────────────────────────────────── */}
      {actionFeedback && (
        <div
          className="rounded-xl p-4 mb-4 text-body-sm flex items-center justify-between"
          style={{
            backgroundColor: '#2c2c2c',
            color: actionFeedback.type === 'success' ? '#01a35a' : '#ef4444',
          }}
        >
          <span>
            {actionFeedback.type === 'success' ? '✓' : '✗'} {actionFeedback.message}
          </span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-body-xs opacity-60 hover:opacity-100"
            style={{ color: '#71717a' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Error State ──────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl p-4 mb-6 text-body-sm"
          style={{ backgroundColor: '#2c2c2c', color: '#ef4444' }}
        >
          {error}
          <button
            onClick={fetchCustomers}
            className="ml-3 underline"
            style={{ color: '#01a35a' }}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ─── Loading Skeletons ────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ─── Empty State ──────────────────────────────────────────────────── */}
      {!loading && !error && customers.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-body-sm" style={{ color: '#71717a' }}>
            {search ? `Tidak ditemukan customer dengan pencarian "${search}"` : 'Belum ada customer terdaftar'}
          </p>
        </div>
      )}

      {/* ─── Customer Cards ───────────────────────────────────────────────── */}
      {!loading && customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl p-5"
              style={{ backgroundColor: '#2c2c2c' }}
            >
              {/* Name + Status */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-heading text-heading-4 text-white">
                    {customer.fullName}
                  </h3>
                  <p className="text-body-xs" style={{ color: '#71717a' }}>
                    @{customer.username}
                  </p>
                </div>
                <span
                  className="text-body-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: customer.status === 'ACTIVE' ? 'rgba(1, 163, 90, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: customer.status === 'ACTIVE' ? '#01a35a' : '#ef4444',
                  }}
                >
                  {customer.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-body-xs text-white">{customer.email}</span>
                  {customer.emailVerified ? (
                    <span className="text-body-xs" style={{ color: '#01a35a' }} title="Email Verified">✓</span>
                  ) : (
                    <span className="text-body-xs" style={{ color: '#ef4444' }} title="Email Not Verified">✗</span>
                  )}
                </div>
                <p className="text-body-xs" style={{ color: '#71717a' }}>
                  WA: {customer.whatsapp}
                </p>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-body-xs" style={{ color: '#71717a' }}>
                <span>Bergabung: {formatDate(customer.createdAt)}</span>
                <span>{customer.orderCount} order</span>
                <span>{customer.guaranteeClaimsCount} klaim garansi</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {customer.status === 'ACTIVE' ? (
                  <button
                    onClick={() => setConfirmDialog({ userId: customer.id, action: 'suspend', name: customer.fullName })}
                    disabled={actionLoading === customer.id}
                    className="rounded-lg px-4 py-2 text-body-xs font-medium transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
                  >
                    {actionLoading === customer.id ? 'Memproses...' : 'Suspend'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(customer.id, 'activate')}
                    disabled={actionLoading === customer.id}
                    className="rounded-lg px-4 py-2 text-body-xs font-medium transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: 'rgba(1, 163, 90, 0.15)', color: '#01a35a' }}
                  >
                    {actionLoading === customer.id ? 'Memproses...' : 'Activate'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Confirm Dialog (Suspend) ─────────────────────────────────────── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setConfirmDialog(null)}
          />
          {/* Dialog */}
          <div
            className="relative rounded-xl p-6 w-full max-w-md"
            style={{ backgroundColor: '#2c2c2c' }}
          >
            <h3 className="font-heading text-heading-4 text-white mb-2">
              Konfirmasi Suspend
            </h3>
            <p className="text-body-sm mb-6" style={{ color: '#71717a' }}>
              Apakah Anda yakin ingin men-suspend akun <strong className="text-white">{confirmDialog.name}</strong>?
              Customer tidak akan bisa login selama akun di-suspend.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="rounded-lg px-4 py-2 text-body-sm font-medium text-white transition-opacity"
                style={{ backgroundColor: '#3f3f46' }}
              >
                Batal
              </button>
              <button
                onClick={() => handleAction(confirmDialog.userId, confirmDialog.action)}
                className="rounded-lg px-4 py-2 text-body-sm font-medium text-white transition-opacity"
                style={{ backgroundColor: '#ef4444' }}
              >
                Ya, Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
