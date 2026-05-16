'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PAYMENT_UPLOADED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerWhatsapp: string;
  productName: string;
  variantName: string;
  price: number;
  status: OrderStatus;
  paymentProof?: string | null;
  createdAt: string;
  note?: string | null;
}

type ActionType =
  | 'approve'
  | 'reject'
  | 'verify_payment'
  | 'reject_payment'
  | 'fulfill_manual';

interface ActionState {
  orderId: string;
  type: ActionType;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const statusLabels: Record<OrderStatus, string> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  PAYMENT_UPLOADED: 'Bukti Dikirim',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const statusColors: Record<OrderStatus, string> = {
  PENDING_REVIEW: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PAYMENT_UPLOADED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PROCESSING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  CANCELLED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const ALL_STATUSES: OrderStatus[] = [
  'PENDING_REVIEW',
  'APPROVED',
  'PAYMENT_UPLOADED',
  'PROCESSING',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminTransaksiPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [activeAction, setActiveAction] = useState<ActionState | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Action form state
  const [adminNote, setAdminNote] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [fulfillContent, setFulfillContent] = useState<string>('');

  // ─── Fetch Orders ────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders ?? data ?? []);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Gagal memuat data transaksi' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Clear feedback after 4s ─────────────────────────────────────────────

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // ─── Handle Action Submit ────────────────────────────────────────────────

  const handleAction = async () => {
    if (!activeAction) return;

    const { orderId, type } = activeAction;

    // Validation
    if (type === 'reject' && !rejectReason.trim()) {
      setFeedback({ type: 'error', message: 'Alasan penolakan wajib diisi' });
      return;
    }
    if (type === 'reject_payment' && !rejectReason.trim()) {
      setFeedback({
        type: 'error',
        message: 'Alasan penolakan bukti wajib diisi',
      });
      return;
    }
    if (type === 'fulfill_manual' && !fulfillContent.trim()) {
      setFeedback({
        type: 'error',
        message: 'Konten pengiriman wajib diisi',
      });
      return;
    }

    setActionLoading(true);
    try {
      let body: Record<string, string> = { action: type };

      if (type === 'approve' && adminNote.trim()) {
        body.note = adminNote.trim();
      }
      if (type === 'reject') {
        body.reason = rejectReason.trim();
      }
      if (type === 'reject_payment') {
        body.reason = rejectReason.trim();
      }
      if (type === 'fulfill_manual') {
        body.content = fulfillContent.trim();
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Aksi gagal dilakukan');
      }

      setFeedback({ type: 'success', message: 'Aksi berhasil dilakukan!' });
      setActiveAction(null);
      resetFormState();
      await fetchOrders();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan';
      setFeedback({ type: 'error', message });
    } finally {
      setActionLoading(false);
    }
  };

  const resetFormState = () => {
    setAdminNote('');
    setRejectReason('');
    setFulfillContent('');
  };

  const openAction = (orderId: string, type: ActionType) => {
    resetFormState();
    setActiveAction({ orderId, type });
  };

  const closeAction = () => {
    setActiveAction(null);
    resetFormState();
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-heading-2 text-white mb-1">
          Manajemen Transaksi
        </h1>
        <p className="text-body-sm text-muted-foreground">
          Kelola dan pantau semua transaksi pelanggan
        </p>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg border text-body-sm ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#2c2c2c] border border-[#3f3f46] rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          {/* Status Filter */}
          <div className="flex-shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#171717] border border-[#3f3f46] text-white text-body-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#01a35a] transition-colors"
            >
              <option value="ALL">Semua Status</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari order ID atau nama customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#171717] border border-[#3f3f46] text-white text-body-sm rounded-lg px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:border-[#01a35a] transition-colors"
            />
          </div>

          {/* Count */}
          <div className="flex-shrink-0 text-body-xs text-muted-foreground">
            {loading ? '...' : `${orders.length} transaksi`}
          </div>
        </div>
      </div>

      {/* Order List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#01a35a] border-t-transparent rounded-full animate-spin" />
            <p className="text-body-sm text-muted-foreground">
              Memuat transaksi...
            </p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-body-sm text-muted-foreground">
            Tidak ada transaksi ditemukan
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#2c2c2c] border border-[#3f3f46] rounded-xl p-5 transition-colors hover:border-[#01a35a]/30"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono text-body-sm text-white font-medium">
                    {order.orderId}
                  </p>
                  <p className="text-body-xs text-muted-foreground mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-body-xs font-medium border ${statusColors[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-body-xs text-muted-foreground">Customer</p>
                  <p className="text-body-sm text-white">{order.customerName}</p>
                  <p className="text-body-xs text-muted-foreground">
                    WA: {order.customerWhatsapp}
                  </p>
                </div>
                <div>
                  <p className="text-body-xs text-muted-foreground">Produk</p>
                  <p className="text-body-sm text-white">{order.productName}</p>
                  <p className="text-body-xs text-muted-foreground">
                    Varian: {order.variantName}
                  </p>
                </div>
                <div>
                  <p className="text-body-xs text-muted-foreground">Harga</p>
                  <p className="text-body-sm text-white font-medium">
                    {formatRupiah(order.price)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {order.status === 'PENDING_REVIEW' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#3f3f46]">
                  <button
                    onClick={() => openAction(order.id, 'approve')}
                    className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-lg text-body-xs font-medium transition-colors"
                  >
                    ACC ✅
                  </button>
                  <button
                    onClick={() => openAction(order.id, 'reject')}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-body-xs font-medium transition-colors"
                  >
                    Reject ❌
                  </button>
                </div>
              )}

              {order.status === 'PAYMENT_UPLOADED' && (
                <div className="mt-3 pt-3 border-t border-[#3f3f46]">
                  {order.paymentProof && (
                    <div className="mb-3">
                      <p className="text-body-xs text-muted-foreground mb-1">
                        Bukti Pembayaran:
                      </p>
                      <img
                        src={order.paymentProof}
                        alt="Bukti Pembayaran"
                        className="max-w-xs rounded-lg border border-[#3f3f46]"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openAction(order.id, 'verify_payment')}
                      className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-lg text-body-xs font-medium transition-colors"
                    >
                      Verifikasi ✅
                    </button>
                    <button
                      onClick={() => openAction(order.id, 'reject_payment')}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-body-xs font-medium transition-colors"
                    >
                      Tolak Bukti
                    </button>
                  </div>
                </div>
              )}

              {order.status === 'PROCESSING' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#3f3f46]">
                  <button
                    onClick={() => openAction(order.id, 'fulfill_manual')}
                    className="px-3 py-1.5 bg-[#01a35a]/20 hover:bg-[#01a35a]/30 text-[#01a35a] border border-[#01a35a]/30 rounded-lg text-body-xs font-medium transition-colors"
                  >
                    Kirim Produk
                  </button>
                </div>
              )}

              {/* Inline Action Panel */}
              {activeAction?.orderId === order.id && (
                <div className="mt-4 pt-4 border-t border-[#3f3f46]">
                  <div className="bg-[#171717] border border-[#3f3f46] rounded-lg p-4">
                    {/* Approve Action */}
                    {activeAction.type === 'approve' && (
                      <div>
                        <h4 className="font-heading text-heading-4 text-white mb-2">
                          Approve Order
                        </h4>
                        <p className="text-body-xs text-muted-foreground mb-3">
                          Konfirmasi untuk menyetujui order ini. Customer akan
                          menerima notifikasi untuk melakukan pembayaran.
                        </p>
                        <textarea
                          placeholder="Catatan admin (opsional)..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          rows={2}
                          className="w-full bg-[#2c2c2c] border border-[#3f3f46] text-white text-body-sm rounded-lg px-3 py-2 mb-3 placeholder:text-muted-foreground focus:outline-none focus:border-[#01a35a] transition-colors resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-[#01a35a] hover:bg-[#01a35a]/80 text-white rounded-lg text-body-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading ? 'Memproses...' : 'Konfirmasi Approve'}
                          </button>
                          <button
                            onClick={closeAction}
                            className="px-4 py-2 bg-[#3f3f46] hover:bg-[#3f3f46]/80 text-white rounded-lg text-body-xs font-medium transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reject Action */}
                    {activeAction.type === 'reject' && (
                      <div>
                        <h4 className="font-heading text-heading-4 text-white mb-2">
                          Reject Order
                        </h4>
                        <p className="text-body-xs text-muted-foreground mb-3">
                          Berikan alasan penolakan order ini.
                        </p>
                        <textarea
                          placeholder="Alasan penolakan (wajib)..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                          className="w-full bg-[#2c2c2c] border border-[#3f3f46] text-white text-body-sm rounded-lg px-3 py-2 mb-3 placeholder:text-muted-foreground focus:outline-none focus:border-red-500 transition-colors resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-600/80 text-white rounded-lg text-body-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading ? 'Memproses...' : 'Konfirmasi Reject'}
                          </button>
                          <button
                            onClick={closeAction}
                            className="px-4 py-2 bg-[#3f3f46] hover:bg-[#3f3f46]/80 text-white rounded-lg text-body-xs font-medium transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Verify Payment Action */}
                    {activeAction.type === 'verify_payment' && (
                      <div>
                        <h4 className="font-heading text-heading-4 text-white mb-2">
                          Verifikasi Pembayaran
                        </h4>
                        {order.paymentProof && (
                          <div className="mb-3">
                            <p className="text-body-xs text-muted-foreground mb-1">
                              Bukti Pembayaran:
                            </p>
                            <img
                              src={order.paymentProof}
                              alt="Bukti Pembayaran"
                              className="max-w-sm rounded-lg border border-[#3f3f46]"
                            />
                          </div>
                        )}
                        <p className="text-body-xs text-muted-foreground mb-3">
                          Konfirmasi bahwa pembayaran sudah valid. Order akan
                          masuk ke status Processing.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-[#01a35a] hover:bg-[#01a35a]/80 text-white rounded-lg text-body-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading
                              ? 'Memproses...'
                              : 'Verifikasi Pembayaran'}
                          </button>
                          <button
                            onClick={closeAction}
                            className="px-4 py-2 bg-[#3f3f46] hover:bg-[#3f3f46]/80 text-white rounded-lg text-body-xs font-medium transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reject Payment Action */}
                    {activeAction.type === 'reject_payment' && (
                      <div>
                        <h4 className="font-heading text-heading-4 text-white mb-2">
                          Tolak Bukti Pembayaran
                        </h4>
                        {order.paymentProof && (
                          <div className="mb-3">
                            <p className="text-body-xs text-muted-foreground mb-1">
                              Bukti Pembayaran:
                            </p>
                            <img
                              src={order.paymentProof}
                              alt="Bukti Pembayaran"
                              className="max-w-sm rounded-lg border border-[#3f3f46]"
                            />
                          </div>
                        )}
                        <p className="text-body-xs text-muted-foreground mb-3">
                          Berikan alasan penolakan bukti pembayaran.
                        </p>
                        <textarea
                          placeholder="Alasan penolakan bukti (wajib)..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                          className="w-full bg-[#2c2c2c] border border-[#3f3f46] text-white text-body-sm rounded-lg px-3 py-2 mb-3 placeholder:text-muted-foreground focus:outline-none focus:border-red-500 transition-colors resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-600/80 text-white rounded-lg text-body-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading ? 'Memproses...' : 'Tolak Bukti'}
                          </button>
                          <button
                            onClick={closeAction}
                            className="px-4 py-2 bg-[#3f3f46] hover:bg-[#3f3f46]/80 text-white rounded-lg text-body-xs font-medium transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Fulfill Manual Action */}
                    {activeAction.type === 'fulfill_manual' && (
                      <div>
                        <h4 className="font-heading text-heading-4 text-white mb-2">
                          Kirim Produk ke Customer
                        </h4>
                        <p className="text-body-xs text-muted-foreground mb-3">
                          Masukkan info akun atau instruksi yang akan dikirim ke
                          customer.
                        </p>
                        <textarea
                          placeholder="Info akun / instruksi untuk customer (wajib)..."
                          value={fulfillContent}
                          onChange={(e) => setFulfillContent(e.target.value)}
                          rows={5}
                          className="w-full bg-[#2c2c2c] border border-[#3f3f46] text-white text-body-sm rounded-lg px-3 py-2 mb-3 placeholder:text-muted-foreground focus:outline-none focus:border-[#01a35a] transition-colors resize-none font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-[#01a35a] hover:bg-[#01a35a]/80 text-white rounded-lg text-body-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading
                              ? 'Memproses...'
                              : 'Kirim ke Customer'}
                          </button>
                          <button
                            onClick={closeAction}
                            className="px-4 py-2 bg-[#3f3f46] hover:bg-[#3f3f46]/80 text-white rounded-lg text-body-xs font-medium transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
