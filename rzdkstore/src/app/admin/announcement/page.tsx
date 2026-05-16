'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'MAINTENANCE' | 'PROMO';
  target: 'ALL' | 'SPECIFIC_PRODUCT' | 'SPECIFIC_CATEGORY';
  publishedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementForm {
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'MAINTENANCE' | 'PROMO';
  target: 'ALL' | 'SPECIFIC_PRODUCT' | 'SPECIFIC_CATEGORY';
  publishedAt: string;
  expiresAt: string;
  isActive: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_BADGE_COLORS: Record<string, string> = {
  INFO: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  WARNING: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
  MAINTENANCE: 'bg-red-600/20 text-red-400 border-red-500/30',
  PROMO: 'bg-green-600/20 text-green-400 border-green-500/30',
};

const TARGET_LABELS: Record<string, string> = {
  ALL: 'Semua',
  SPECIFIC_PRODUCT: 'Produk Tertentu',
  SPECIFIC_CATEGORY: 'Kategori Tertentu',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminAnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultForm: AnnouncementForm = {
    title: '',
    content: '',
    type: 'INFO',
    target: 'ALL',
    publishedAt: getTodayISO(),
    expiresAt: '',
    isActive: true,
  };

  const [form, setForm] = useState<AnnouncementForm>(defaultForm);

  // ─── Fetch ───────────────────────────────────────────────────────────────

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      if (!res.ok) throw new Error('Gagal memuat announcements');
      const data = await res.json();
      setAnnouncements(data.data ?? data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat announcements';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ─── Auto-dismiss feedback ──────────────────────────────────────────────

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const handleOpenEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target: announcement.target,
      publishedAt: announcement.publishedAt ? announcement.publishedAt.split('T')[0] : getTodayISO(),
      expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : '',
      isActive: announcement.isActive,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setFeedback({ type: 'error', message: 'Title dan Content wajib diisi' });
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        target: form.target,
        publishedAt: new Date(form.publishedAt).toISOString(),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/announcements/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/admin/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal menyimpan announcement');
      }

      setFeedback({ type: 'success', message: editingId ? 'Announcement berhasil diupdate' : 'Announcement berhasil dipublish' });
      handleCancel();
      await fetchAnnouncements();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !announcement.isActive }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status');
      setFeedback({ type: 'success', message: `Announcement ${!announcement.isActive ? 'diaktifkan' : 'dinonaktifkan'}` });
      await fetchAnnouncements();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengubah status';
      setFeedback({ type: 'error', message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus announcement ini?')) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus announcement');
      setFeedback({ type: 'success', message: 'Announcement berhasil dihapus' });
      await fetchAnnouncements();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus';
      setFeedback({ type: 'error', message });
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border text-body-sm font-medium shadow-lg transition-all ${
            feedback.type === 'success'
              ? 'bg-green-900/80 border-green-600/50 text-green-300'
              : 'bg-red-900/80 border-red-600/50 text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-heading-2 text-white">Manajemen Announcement</h1>
          <p className="text-body-sm text-[#71717a] mt-1">
            Buat dan kelola pengumuman untuk pelanggan
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-lg bg-[#01a35a] hover:bg-[#01a35a]/80 text-white text-body-sm font-medium transition-colors"
        >
          Buat Announcement
        </button>
      </div>

      {/* Create/Edit Form Panel */}
      {showForm && (
        <div className="rounded-xl border border-[#3f3f46] bg-[#2c2c2c] p-6 space-y-5">
          <h2 className="font-heading text-heading-3 text-white">
            {editingId ? 'Edit Announcement' : 'Buat Announcement Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-body-sm text-[#71717a] mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Judul announcement"
                className="w-full px-3 py-2 rounded-lg bg-[#171717] border border-[#3f3f46] text-white text-body-sm placeholder:text-[#71717a] focus:outline-none focus:border-[#01a35a] transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-body-sm text-[#71717a] mb-1">Content *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={4}
                placeholder="Isi announcement..."
                className="w-full px-3 py-2 rounded-lg bg-[#171717] border border-[#3f3f46] text-white text-body-sm placeholder:text-[#71717a] focus:outline-none focus:border-[#01a35a] transition-colors resize-y"
              />
            </div>

            {/* Type Select */}
            <div>
              <label className="block text-body-sm text-[#71717a] mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AnnouncementForm['type'] })}
                className="w-full px-3 py-2 rounded-lg bg-[#171717] border border-[#3f3f46] text-white text-body-sm focus:outline-none focus:border-[#01a35a] transition-colors"
              >
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="PROMO">PROMO</option>
              </select>
            </div>

            {/* Target Radio */}
            <div>
              <label className="block text-body-sm text-[#71717a] mb-2">Target</label>
              <div className="flex flex-wrap gap-4">
                {(['ALL', 'SPECIFIC_PRODUCT', 'SPECIFIC_CATEGORY'] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value={t}
                      checked={form.target === t}
                      onChange={() => setForm({ ...form, target: t })}
                      className="w-4 h-4 accent-[#01a35a]"
                    />
                    <span className="text-body-sm text-white">{TARGET_LABELS[t]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm text-[#71717a] mb-1">Published At</label>
                <input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#171717] border border-[#3f3f46] text-white text-body-sm focus:outline-none focus:border-[#01a35a] transition-colors"
                />
              </div>
              <div>
                <label className="block text-body-sm text-[#71717a] mb-1">Expires At (opsional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#171717] border border-[#3f3f46] text-white text-body-sm focus:outline-none focus:border-[#01a35a] transition-colors"
                />
              </div>
            </div>

            {/* isActive Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#01a35a] rounded"
              />
              <label htmlFor="isActive" className="text-body-sm text-white cursor-pointer">
                Aktif (langsung ditampilkan)
              </label>
            </div>

            {/* Note */}
            <p className="text-body-xs text-[#71717a] italic">
              Announcement akan langsung dikirim sebagai notifikasi ke customer target
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-[#01a35a] hover:bg-[#01a35a]/80 text-white text-body-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Menyimpan...' : 'Publish Announcement'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-[#3f3f46] text-[#71717a] hover:text-white text-body-sm transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#01a35a] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-body-sm text-[#71717a]">Memuat announcements...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && announcements.length === 0 && (
        <div className="text-center py-16 rounded-xl border border-[#3f3f46] bg-[#2c2c2c]">
          <div className="text-4xl mb-3">📢</div>
          <h3 className="font-heading text-heading-4 text-white mb-1">Belum ada announcement</h3>
          <p className="text-body-sm text-[#71717a]">
            Buat announcement pertama untuk menginformasikan pelanggan Anda
          </p>
        </div>
      )}

      {/* Announcements List */}
      {!loading && announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#3f3f46] bg-[#2c2c2c] p-5 space-y-3 hover:border-[#01a35a]/30 transition-colors"
            >
              {/* Top Row: Title + Badges */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-heading-4 text-white font-bold">{item.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-body-xs font-medium border ${TYPE_BADGE_COLORS[item.type]}`}
                  >
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-body-xs font-medium border border-[#3f3f46] bg-[#171717] text-[#71717a]">
                    {TARGET_LABELS[item.target]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {item.isActive ? (
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                  )}
                  <span className="text-body-xs text-[#71717a]">
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {/* Content (truncated 3 lines) */}
              <p className="text-body-sm text-[#71717a] line-clamp-3 whitespace-pre-line">
                {item.content}
              </p>

              {/* Dates */}
              <div className="flex flex-wrap items-center gap-4 text-body-xs text-[#71717a]">
                <span>📅 Published: {formatDate(item.publishedAt)}</span>
                {item.expiresAt && <span>⏳ Expires: {formatDate(item.expiresAt)}</span>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1 border-t border-[#3f3f46]">
                {/* Toggle Active */}
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`px-3 py-1.5 rounded-lg text-body-xs font-medium transition-colors border ${
                    item.isActive
                      ? 'border-yellow-500/30 bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600/20'
                      : 'border-green-500/30 bg-green-600/10 text-green-400 hover:bg-green-600/20'
                  }`}
                >
                  {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1.5 rounded-lg text-body-xs font-medium border border-[#3f3f46] text-[#71717a] hover:text-white hover:border-[#01a35a]/50 transition-colors"
                >
                  Edit
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 rounded-lg text-body-xs font-medium border border-red-500/30 bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
