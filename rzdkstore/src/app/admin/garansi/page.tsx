'use client';

import { useState, useEffect, useCallback } from 'react';

interface GuaranteeUser {
  id: string;
  fullName: string;
  username: string;
  whatsapp: string | null;
  email: string;
}

interface GuaranteeOrder {
  id: string;
  completedAt: string | null;
  expiredAt: string | null;
  finalPrice: number;
  variant: {
    name: string;
    guaranteeDays: number | null;
    durationDays: number;
    product: {
      name: string;
      category: { icon: string; name: string };
    };
  };
}

interface GuaranteeClaim {
  id: string;
  orderId: string;
  userId: string;
  description: string;
  attachmentUrl: string | null;
  status: 'OPEN' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  adminNote: string | null;
  guaranteeValidUntil: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: GuaranteeUser;
  order: GuaranteeOrder;
}

type ActionType = 'approve' | 'reject' | 'resolve';

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-yellow-600 text-yellow-100' },
  IN_REVIEW: { label: 'In Review', color: 'bg-blue-600 text-blue-100' },
  APPROVED: { label: 'Approved', color: 'bg-blue-600 text-blue-100' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-600 text-green-100' },
  REJECTED: { label: 'Rejected', color: 'bg-red-600 text-red-100' },
};

const statusFilters = ['Semua', 'OPEN', 'APPROVED', 'RESOLVED', 'REJECTED'] as const;

export default function AdminGaransiPage() {
  const [claims, setClaims] = useState<GuaranteeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const [actionStates, setActionStates] = useState<Record<string, { action: ActionType; adminNote: string; newExpiredAt: string }>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeFilter !== 'Semua' ? `?status=${activeFilter}` : '';
      const res = await fetch(`/api/admin/guarantees${params}`);
      const json = await res.json();
      if (json.success) {
        setClaims(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const openActionForm = (claimId: string, action: ActionType) => {
    setActionStates((prev) => ({
      ...prev,
      [claimId]: { action, adminNote: '', newExpiredAt: '' },
    }));
    setFeedback(null);
  };

  const closeActionForm = (claimId: string) => {
    setActionStates((prev) => {
      const next = { ...prev };
      delete next[claimId];
      return next;
    });
  };

  const handleAction = async (claimId: string) => {
    const state = actionStates[claimId];
    if (!state) return;

    // Validate reject requires note
    if (state.action === 'reject' && !state.adminNote.trim()) {
      setFeedback({ id: claimId, type: 'error', message: 'Alasan penolakan wajib diisi' });
      return;
    }

    setProcessingId(claimId);
    setFeedback(null);

    try {
      const body: Record<string, string> = {
        guaranteeId: claimId,
        action: state.action,
      };
      if (state.adminNote.trim()) body.adminNote = state.adminNote.trim();
      if (state.action === 'resolve' && state.newExpiredAt) body.newExpiredAt = state.newExpiredAt;

      const res = await fetch('/api/admin/guarantees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        setFeedback({ id: claimId, type: 'success', message: json.message || 'Berhasil!' });
        closeActionForm(claimId);
        fetchClaims();
      } else {
        setFeedback({ id: claimId, type: 'error', message: json.message || 'Gagal memproses' });
      }
    } catch (err) {
      setFeedback({ id: claimId, type: 'error', message: 'Terjadi kesalahan jaringan' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-heading-2 text-white mb-2">Manajemen Garansi</h1>
      <p className="text-body-sm text-muted-foreground mb-6">
        Kelola dan proses klaim garansi dari pelanggan
      </p>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-[#01a35a] text-white'
                : 'bg-[#2c2c2c] text-muted-foreground hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#2c2c2c] rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-[#3f3f46] rounded w-1/3 mb-3" />
              <div className="h-3 bg-[#3f3f46] rounded w-2/3 mb-2" />
              <div className="h-3 bg-[#3f3f46] rounded w-1/2 mb-2" />
              <div className="h-20 bg-[#3f3f46] rounded mb-2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && claims.length === 0 && (
        <div className="bg-[#2c2c2c] rounded-xl p-6 text-center py-12">
          <div className="text-3xl mb-3">📋</div>
          <p className="text-body-sm text-muted-foreground">
            Tidak ada klaim garansi{activeFilter !== 'Semua' ? ` dengan status ${activeFilter}` : ''}.
          </p>
        </div>
      )}

      {/* Claims List */}
      {!loading && claims.length > 0 && (
        <div className="space-y-4">
          {claims.map((claim) => {
            const statusInfo = statusConfig[claim.status] || statusConfig.OPEN;
            const actionState = actionStates[claim.id];
            const claimFeedback = feedback?.id === claim.id ? feedback : null;

            return (
              <div key={claim.id} className="bg-[#2c2c2c] rounded-xl p-6 border border-[#3f3f46]">
                {/* Header with Status */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-heading-4 text-white">
                      {claim.order.variant.product.category.icon} {claim.order.variant.product.name}
                    </h3>
                    <p className="text-body-sm text-muted-foreground mt-0.5">
                      Varian: {claim.order.variant.name} • Order #{claim.orderId}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-body-xs font-medium shrink-0 ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-[#171717] rounded-lg p-3 mb-4 border border-[#3f3f46]">
                  <p className="text-body-xs text-muted-foreground mb-1 font-medium">Pelanggan:</p>
                  <p className="text-body-sm text-white">{claim.user.fullName}</p>
                  {claim.user.whatsapp && (
                    <p className="text-body-xs text-muted-foreground">WA: {claim.user.whatsapp}</p>
                  )}
                  <p className="text-body-xs text-muted-foreground">{claim.user.email}</p>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-body-xs text-muted-foreground font-medium mb-1">Deskripsi Masalah:</p>
                  <p className="text-body-sm text-white whitespace-pre-wrap">{claim.description}</p>
                </div>

                {/* Attachment */}
                {claim.attachmentUrl && (
                  <div className="mb-4">
                    <p className="text-body-xs text-muted-foreground font-medium mb-2">Screenshot:</p>
                    <img
                      src={claim.attachmentUrl}
                      alt="Lampiran klaim garansi"
                      className="max-w-xs rounded-lg border border-[#3f3f46]"
                    />
                  </div>
                )}

                {/* Admin Note (if exists) */}
                {claim.adminNote && (
                  <div className="bg-[#171717] rounded-lg p-3 mb-4 border border-[#3f3f46]">
                    <p className="text-body-xs text-muted-foreground mb-1 font-medium">Catatan Admin:</p>
                    <p className="text-body-sm text-white">{claim.adminNote}</p>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-body-xs text-muted-foreground mb-4">
                  <span>
                    Garansi s/d: {new Date(claim.guaranteeValidUntil).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <span>
                    Diajukan: {new Date(claim.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Feedback Message */}
                {claimFeedback && (
                  <div className={`rounded-lg p-3 mb-4 ${
                    claimFeedback.type === 'success'
                      ? 'bg-green-900/30 border border-green-600/50'
                      : 'bg-red-900/30 border border-red-600/50'
                  }`}>
                    <p className={`text-body-sm ${
                      claimFeedback.type === 'success' ? 'text-green-300' : 'text-red-300'
                    }`}>{claimFeedback.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {!actionState && (
                  <div className="flex flex-wrap gap-2">
                    {claim.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => openActionForm(claim.id, 'approve')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-body-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openActionForm(claim.id, 'reject')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-body-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {claim.status === 'APPROVED' && (
                      <button
                        onClick={() => openActionForm(claim.id, 'resolve')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-body-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Selesaikan (Resolve)
                      </button>
                    )}
                  </div>
                )}

                {/* Inline Action Form */}
                {actionState && (
                  <div className="bg-[#171717] rounded-lg p-4 border border-[#3f3f46] mt-3">
                    <h4 className="font-heading text-heading-4 text-white mb-3">
                      {actionState.action === 'approve' && 'Approve Klaim'}
                      {actionState.action === 'reject' && 'Tolak Klaim'}
                      {actionState.action === 'resolve' && 'Selesaikan Klaim'}
                    </h4>

                    {/* Admin Note */}
                    <div className="mb-3">
                      <label className="block text-body-xs text-muted-foreground mb-1">
                        Catatan Admin {actionState.action === 'reject' ? '(wajib)' : '(opsional)'}
                      </label>
                      <textarea
                        value={actionState.adminNote}
                        onChange={(e) =>
                          setActionStates((prev) => ({
                            ...prev,
                            [claim.id]: { ...prev[claim.id], adminNote: e.target.value },
                          }))
                        }
                        placeholder={
                          actionState.action === 'reject'
                            ? 'Jelaskan alasan penolakan...'
                            : 'Catatan tambahan (opsional)...'
                        }
                        rows={3}
                        className="w-full bg-[#2c2c2c] border border-[#3f3f46] rounded-lg px-3 py-2 text-white text-body-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#01a35a] transition-colors resize-none"
                      />
                    </div>

                    {/* Extend Expired Date (only for resolve) */}
                    {actionState.action === 'resolve' && (
                      <div className="mb-3">
                        <label className="block text-body-xs text-muted-foreground mb-1">
                          Perpanjang Expired Sampai (opsional)
                        </label>
                        <input
                          type="date"
                          value={actionState.newExpiredAt}
                          onChange={(e) =>
                            setActionStates((prev) => ({
                              ...prev,
                              [claim.id]: { ...prev[claim.id], newExpiredAt: e.target.value },
                            }))
                          }
                          className="w-full bg-[#2c2c2c] border border-[#3f3f46] rounded-lg px-3 py-2 text-white text-body-sm focus:outline-none focus:border-[#01a35a] transition-colors"
                        />
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(claim.id)}
                        disabled={processingId === claim.id}
                        className={`px-4 py-2 rounded-lg text-body-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          actionState.action === 'reject'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {processingId === claim.id
                          ? 'Memproses...'
                          : actionState.action === 'approve'
                          ? 'Konfirmasi Approve'
                          : actionState.action === 'reject'
                          ? 'Konfirmasi Tolak'
                          : 'Konfirmasi Selesai'}
                      </button>
                      <button
                        onClick={() => closeActionForm(claim.id)}
                        disabled={processingId === claim.id}
                        className="px-4 py-2 bg-[#3f3f46] text-white rounded-lg text-body-sm font-medium hover:bg-[#3f3f46]/80 transition-colors disabled:opacity-50"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
