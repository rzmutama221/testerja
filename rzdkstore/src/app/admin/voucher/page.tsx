'use client';

import { useEffect, useState, useCallback } from 'react';

// Types
interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount: number | null;
  minPurchase: number;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  target: 'ALL' | 'SPECIFIC_PRODUCT' | 'SPECIFIC_CATEGORY';
  isActive: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE' | 'SCHEDULED' | 'USED_UP';
}

interface VoucherForm {
  code: string;
  autoGenerate: boolean;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount: number | null;
  minPurchase: number;
  usageLimit: number | null;
  validFrom: string;
  validUntil: string;
  target: 'ALL' | 'SPECIFIC_PRODUCT' | 'SPECIFIC_CATEGORY';
  isActive: boolean;
}

const defaultForm: VoucherForm = {
  code: '',
  autoGenerate: false,
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  maxDiscount: null,
  minPurchase: 0,
  usageLimit: null,
  validFrom: '',
  validUntil: '',
  target: 'ALL',
  isActive: true,
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'bg-green-500/10 text-green-400 border border-green-500/20';
    case 'EXPIRED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'INACTIVE': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    case 'SCHEDULED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'USED_UP': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'Aktif';
    case 'EXPIRED': return 'Expired';
    case 'INACTIVE': return 'Nonaktif';
    case 'SCHEDULED': return 'Terjadwal';
    case 'USED_UP': return 'Habis';
    default: return status;
  }
}

function getTargetLabel(target: string): string {
  switch (target) {
    case 'ALL': return 'Semua Produk';
    case 'SPECIFIC_PRODUCT': return 'Produk Tertentu';
    case 'SPECIFIC_CATEGORY': return 'Kategori Tertentu';
    default: return target;
  }
}

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VoucherForm>(defaultForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vouchers');
      const data = await res.json();
      if (data.success) {
        setVouchers(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Summary stats
  const totalVouchers = vouchers.length;
  const activeVouchers = vouchers.filter((v) => v.status === 'ACTIVE').length;
  const expiredVouchers = vouchers.filter((v) => v.status === 'EXPIRED').length;
  const totalDiscount = vouchers.reduce((sum, v) => {
    if (v.discountType === 'FIXED') {
      return sum + v.usedCount * v.discountValue;
    }
    // For PERCENTAGE, approximate using maxDiscount if available
    if (v.maxDiscount) {
      return sum + v.usedCount * v.maxDiscount;
    }
    return sum + v.usedCount * v.discountValue * 100; // rough approximation
  }, 0);

  // Form handlers
  function openAddForm() {
    setForm(defaultForm);
    setEditingId(null);
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  }

  function openEditForm(voucher: Voucher) {
    setForm({
      code: voucher.code,
      autoGenerate: false,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxDiscount: voucher.maxDiscount,
      minPurchase: voucher.minPurchase,
      usageLimit: voucher.usageLimit,
      validFrom: voucher.validFrom ? voucher.validFrom.slice(0, 10) : '',
      validUntil: voucher.validUntil ? voucher.validUntil.slice(0, 10) : '',
      target: voucher.target,
      isActive: voucher.isActive,
    });
    setEditingId(voucher.id);
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/admin/vouchers/${editingId}` : '/api/admin/vouchers';

    const body = {
      ...form,
      usageLimit: form.usageLimit || null,
      maxDiscount: form.discountType === 'PERCENTAGE' ? form.maxDiscount : null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setFormSuccess(editingId ? 'Voucher berhasil diupdate!' : 'Voucher berhasil ditambahkan!');
        setShowForm(false);
        setEditingId(null);
        setForm(defaultForm);
        fetchVouchers();
      } else {
        setFormError(data.message || 'Terjadi kesalahan');
      }
    } catch {
      setFormError('Gagal menghubungi server');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(voucher: Voucher) {
    try {
      const res = await fetch(`/api/admin/vouchers/${voucher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !voucher.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchVouchers();
      } else {
        alert(data.message || 'Gagal mengubah status');
      }
    } catch {
      alert('Gagal menghubungi server');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus voucher ini?')) return;
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchVouchers();
      } else {
        alert(data.message || 'Gagal menghapus voucher');
      }
    } catch {
      alert('Gagal menghubungi server');
    }
  }

  // Loading state
  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-heading-2 text-white mb-6">Manajemen Voucher</h1>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-dark-card border border-dark-border rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-heading-2 text-white">Manajemen Voucher</h1>
          <p className="text-body-sm text-muted-foreground mt-1">Buat dan kelola voucher diskon untuk pelanggan</p>
        </div>
        <button
          onClick={openAddForm}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-body-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          + Tambah Voucher
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground">Total Voucher</p>
          <p className="font-heading text-heading-3 text-white mt-1">{totalVouchers}</p>
        </div>
        <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground">Aktif</p>
          <p className="font-heading text-heading-3 text-green-400 mt-1">{activeVouchers}</p>
        </div>
        <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground">Expired</p>
          <p className="font-heading text-heading-3 text-red-400 mt-1">{expiredVouchers}</p>
        </div>
        <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground">Total Diskon Diberikan</p>
          <p className="font-heading text-heading-4 text-white mt-1">{formatRupiah(totalDiscount)}</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {formSuccess && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-body-sm text-green-400">
          {formSuccess}
        </div>
      )}

      {/* Add/Edit Form (Inline Panel) */}
      {showForm && (
        <div className="mb-6 p-6 bg-dark-card border border-dark-border rounded-xl">
          <h3 className="font-heading text-heading-4 text-white mb-4">
            {editingId ? 'Edit Voucher' : 'Tambah Voucher Baru'}
          </h3>
          {formError && <p className="text-body-xs text-red-400 mb-3">{formError}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code + Auto Generate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-xs text-muted-foreground mb-1">Kode Voucher</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. DISKON20"
                  disabled={form.autoGenerate}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-white text-body-sm font-mono focus:border-[#01a35a] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.autoGenerate}
                    onChange={(e) => setForm({ ...form, autoGenerate: e.target.checked, code: '' })}
                    className="w-4 h-4 rounded border-[#3f3f46] accent-[#01a35a]"
                  />
                  <span className="text-body-sm text-muted-foreground">Auto Generate Kode</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-1">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi voucher..."
                rows={2}
                className="w-full px-3 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-white text-body-sm focus:border-[#01a35a] focus:outline-none resize-none"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-2">Tipe Diskon</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    value="PERCENTAGE"
                    checked={form.discountType === 'PERCENTAGE'}
                    onChange={() => setForm({ ...form, discountType: 'PERCENTAGE' })}
                    className="accent-[#01a35a]"
                  />
                  <span className="text-body-sm text-white">Persentase (%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    value="FIXED"
                    checked={form.discountType === 'FIXED'}
                    onChange={() => setForm({ ...form, discountType: 'FIXED' })}
                    className="accent-[#01a35a]"
                  />
                  <span className="text-body-sm text-white">Nominal Tetap (Rp)</span>
                </label>
              </div>
            </div>

            {/* Discount Value + Max Discount + Min Purchase */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-body-xs text-muted-foreground mb-1">
                  Nilai Diskon {form.discountType === 'PERCENTAGE' ? '(%)' : '(Rp)'}
                </label>
                <input
                  type="number"
                  value={form.discountValue || ''}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                  placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 5000'}
                  min={0}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-white text-body-sm focus:border-[#01a35a] focus:outline-none"
                />
              </div>
              {form.discountType === 'PERCENTAGE' && (
                <div>
                  <label className="block text-body-xs text-muted-foreground mb-1">Maks. Diskon (Rp)</label>
                  <input
                    type="number"
                    value={form.maxDiscount ?? ''}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? Number(e.target.value) : null })}
                    placeholder="e.g. 50000"
                    min={0}
                    className="w-full px-3 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-white text-body-sm focus:border-[#01a35a] focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-body-xs text-muted-foreground mb-1">Min. Pembelian (Rp)</label>
                <input
                  type="number"
                  value={form.minPurchase || ''}
                  onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                  placeholder="e.g. 50000"
                  min={0}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-white text-body-sm focus:border-[#01a35a] focus:outline-none"
                />
              </div>
            </div>

            {/* Usage Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-xs text-muted-foreground mb-1">Batas Penggunaan (kosong = unlimited)</label>
                <input
                  type="number"
                  value={form.usageLimit ?? ''}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 100"
                  min={0}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-white text-body-sm focus:border-[#01a35a] focus:outline-none"
                />
              </div>
            </div>

            {/* Valid From / Until */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-xs text-muted-foreground mb-1">Berlaku Dari</label>
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-white text-body-sm focus:border-[#01a35a] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-body-xs text-muted-foreground mb-1">Berlaku Sampai</label>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-white text-body-sm focus:border-[#01a35a] focus:outline-none"
                />
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-body-xs text-muted-foreground mb-2">Target</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    value="ALL"
                    checked={form.target === 'ALL'}
                    onChange={() => setForm({ ...form, target: 'ALL' })}
                    className="accent-[#01a35a]"
                  />
                  <span className="text-body-sm text-white">Semua</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    value="SPECIFIC_PRODUCT"
                    checked={form.target === 'SPECIFIC_PRODUCT'}
                    onChange={() => setForm({ ...form, target: 'SPECIFIC_PRODUCT' })}
                    className="accent-[#01a35a]"
                  />
                  <span className="text-body-sm text-white">Produk Tertentu</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    value="SPECIFIC_CATEGORY"
                    checked={form.target === 'SPECIFIC_CATEGORY'}
                    onChange={() => setForm({ ...form, target: 'SPECIFIC_CATEGORY' })}
                    className="accent-[#01a35a]"
                  />
                  <span className="text-body-sm text-white">Kategori Tertentu</span>
                </label>
              </div>
            </div>

            {/* isActive */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#3f3f46] accent-[#01a35a]"
                />
                <span className="text-body-sm text-white">Aktifkan voucher</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-[#01a35a] hover:bg-[#01a35a]/90 text-white text-body-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : editingId ? 'Update Voucher' : 'Simpan Voucher'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setFormError(''); }}
                className="px-5 py-2 border border-[#3f3f46] text-[#71717a] text-body-sm rounded-lg hover:text-white transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Voucher List */}
      {vouchers.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-body-sm bg-dark-card border border-dark-border rounded-xl">
          Belum ada voucher. Klik &quot;Tambah Voucher&quot; untuk membuat voucher pertama.
        </div>
      ) : (
        <div className="space-y-4">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="p-5 bg-[#2c2c2c] border border-[#3f3f46] rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Left side */}
                <div className="flex-1 min-w-0">
                  {/* Code + Status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-heading-3 text-white">{voucher.code}</span>
                    <span className={`text-body-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(voucher.status)}`}>
                      {getStatusLabel(voucher.status)}
                    </span>
                    {/* Type badge */}
                    <span className="text-body-xs px-2 py-0.5 rounded bg-[#01a35a]/10 text-[#01a35a] border border-[#01a35a]/20">
                      {voucher.discountType === 'PERCENTAGE'
                        ? `${voucher.discountValue}%`
                        : formatRupiah(voucher.discountValue)}
                    </span>
                  </div>

                  {/* Description */}
                  {voucher.description && (
                    <p className="text-body-sm text-[#71717a] mt-1">{voucher.description}</p>
                  )}

                  {/* Details row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-body-xs text-[#71717a]">
                    {voucher.discountType === 'PERCENTAGE' && voucher.maxDiscount && (
                      <span>Maks: {formatRupiah(voucher.maxDiscount)}</span>
                    )}
                    {voucher.minPurchase > 0 && (
                      <span>Min. beli: {formatRupiah(voucher.minPurchase)}</span>
                    )}
                    <span>
                      Digunakan: {voucher.usedCount} / {voucher.usageLimit !== null ? voucher.usageLimit : '∞'}
                    </span>
                    <span>
                      {formatDate(voucher.validFrom)} → {formatDate(voucher.validUntil)}
                    </span>
                    <span>Target: {getTargetLabel(voucher.target)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditForm(voucher)}
                    className="px-3 py-1.5 text-body-xs text-blue-400 hover:text-white border border-blue-400/20 hover:border-blue-400 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(voucher)}
                    className={`px-3 py-1.5 text-body-xs rounded-lg border transition-colors ${
                      voucher.isActive
                        ? 'text-yellow-400 border-yellow-400/20 hover:border-yellow-400 hover:text-white'
                        : 'text-green-400 border-green-400/20 hover:border-green-400 hover:text-white'
                    }`}
                  >
                    {voucher.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  {voucher.usedCount === 0 && (
                    <button
                      onClick={() => handleDelete(voucher.id)}
                      className="px-3 py-1.5 text-body-xs text-red-400 hover:text-white border border-red-400/20 hover:border-red-400 rounded-lg transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
