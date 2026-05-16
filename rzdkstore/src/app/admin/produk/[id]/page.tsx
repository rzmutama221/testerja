'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Admin — Detail Produk
 *
 * Features:
 * - Info produk (nama, kategori, tipe fulfill)
 * - CRUD Varian (harga, durasi, stok, garansi)
 * - Manage Stok Digital (khusus tipe AUTO): bulk import & list
 */

interface Variant {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  stock: number;
  isUnlimited: boolean;
  isActive: boolean;
  guaranteeDays: number | null;
  notes: string | null;
  _count: { stockItems: number };
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  fulfillType: 'AUTO' | 'MANUAL' | 'SLOT';
  isActive: boolean;
  category: { id: string; name: string; icon: string };
  variants: Variant[];
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function AdminProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Variant form
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState({
    name: '', price: 0, durationDays: 30, stock: 0, isUnlimited: false, isActive: true, guaranteeDays: null as number | null, notes: '',
  });

  // Stock bulk import
  const [showStockForm, setShowStockForm] = useState(false);
  const [stockVariantId, setStockVariantId] = useState('');
  const [stockContent, setStockContent] = useState('');
  const [stockLoading, setStockLoading] = useState(false);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}`);
    const data = await res.json();
    if (data.success) setProduct(data.data);
    setLoading(false);
  }

  // --- VARIANT CRUD ---
  async function handleVariantSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const payload = { ...variantForm, productId, price: Number(variantForm.price), durationDays: Number(variantForm.durationDays), stock: Number(variantForm.stock) };
    const method = editingVariantId ? 'PUT' : 'POST';
    const url = editingVariantId ? `/api/admin/variants/${editingVariantId}` : '/api/admin/variants';

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();

    if (data.success) {
      setShowVariantForm(false);
      setEditingVariantId(null);
      setVariantForm({ name: '', price: 0, durationDays: 30, stock: 0, isUnlimited: false, isActive: true, guaranteeDays: null, notes: '' });
      fetchProduct();
    } else {
      setFormError(data.message);
    }
  }

  async function handleDeleteVariant(id: string) {
    if (!confirm('Yakin hapus varian ini?')) return;
    const res = await fetch(`/api/admin/variants/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) fetchProduct();
    else alert(data.message);
  }

  function startEditVariant(v: Variant) {
    setVariantForm({ name: v.name, price: v.price, durationDays: v.durationDays, stock: v.stock, isUnlimited: v.isUnlimited, isActive: v.isActive, guaranteeDays: v.guaranteeDays, notes: v.notes || '' });
    setEditingVariantId(v.id);
    setShowVariantForm(true);
  }

  // --- STOCK BULK IMPORT ---
  async function handleStockImport(e: React.FormEvent) {
    e.preventDefault();
    if (!stockVariantId || !stockContent.trim()) return;
    setStockLoading(true);

    const items = stockContent.split('\n').map((s) => s.trim()).filter(Boolean);
    const res = await fetch('/api/admin/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: stockVariantId, items }),
    });
    const data = await res.json();
    setStockLoading(false);

    if (data.success) {
      alert(`${data.count} stok berhasil ditambahkan!`);
      setStockContent('');
      setShowStockForm(false);
      fetchProduct();
    } else {
      alert(data.message);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="h-8 bg-dark-card rounded w-48 animate-pulse mb-4" />
        <div className="h-4 bg-dark-card rounded w-96 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <h1 className="font-heading text-heading-2 text-white mb-2">Produk Tidak Ditemukan</h1>
        <Link href="/admin/produk" className="text-primary text-body-sm hover:text-primary-hover">Kembali ke daftar produk</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Link href="/admin/produk" className="text-body-xs text-muted-foreground hover:text-primary">&larr; Kembali</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-heading-2 text-white">{product.name}</h1>
          <p className="text-body-sm text-muted-foreground">
            {product.category.icon} {product.category.name} |
            Tipe: <span className="text-white font-medium">{product.fulfillType}</span> |
            Status: <span className={product.isActive ? 'text-primary' : 'text-error'}>{product.isActive ? 'Aktif' : 'Nonaktif'}</span>
          </p>
        </div>
      </div>

      {/* Varian Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-heading-4 text-white">Varian ({product.variants.length})</h2>
          <div className="flex gap-2">
            {product.fulfillType === 'AUTO' && (
              <button
                onClick={() => { setShowStockForm(true); setStockVariantId(product.variants[0]?.id || ''); }}
                className="px-3 py-1.5 bg-info/10 border border-info/30 text-info text-body-xs font-medium rounded-lg hover:bg-info/20 transition-colors"
              >
                Import Stok Digital
              </button>
            )}
            <button
              onClick={() => { setShowVariantForm(true); setEditingVariantId(null); setVariantForm({ name: '', price: 0, durationDays: 30, stock: 0, isUnlimited: false, isActive: true, guaranteeDays: null, notes: '' }); }}
              className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-body-xs font-medium rounded-lg transition-colors"
            >
              + Tambah Varian
            </button>
          </div>
        </div>

        {/* Stock Import Form */}
        {showStockForm && product.fulfillType === 'AUTO' && (
          <div className="mb-4 p-5 bg-dark-card border border-dark-border rounded-xl">
            <h3 className="text-body-sm font-semibold text-white mb-3">Bulk Import Stok Digital</h3>
            <p className="text-body-xs text-muted-foreground mb-3">Masukkan satu item per baris (email:password, kode, atau info akun).</p>
            <form onSubmit={handleStockImport} className="space-y-3">
              <select value={stockVariantId} onChange={(e) => setStockVariantId(e.target.value)} className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none">
                {product.variants.map((v) => <option key={v.id} value={v.id}>{v.name} ({formatRupiah(v.price)})</option>)}
              </select>
              <textarea
                value={stockContent}
                onChange={(e) => setStockContent(e.target.value)}
                rows={6}
                placeholder={"akun1@email.com:password123\nakun2@email.com:password456\n..."}
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-xs font-mono focus:border-primary focus:outline-none resize-y"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={stockLoading} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-body-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {stockLoading ? 'Mengimport...' : 'Import Stok'}
                </button>
                <button type="button" onClick={() => setShowStockForm(false)} className="px-4 py-2 border border-dark-border text-muted-foreground text-body-sm rounded-lg hover:text-white transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Variant Form */}
        {showVariantForm && (
          <div className="mb-4 p-5 bg-dark-card border border-dark-border rounded-xl">
            <h3 className="text-body-sm font-semibold text-white mb-3">{editingVariantId ? 'Edit Varian' : 'Tambah Varian Baru'}</h3>
            {formError && <p className="text-body-xs text-error mb-2">{formError}</p>}
            <form onSubmit={handleVariantSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input value={variantForm.name} onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })} placeholder="Nama Varian (e.g. Sharing 1 Bulan)" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
              <input type="number" value={variantForm.price} onChange={(e) => setVariantForm({ ...variantForm, price: Number(e.target.value) })} placeholder="Harga (Rp)" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
              <input type="number" value={variantForm.durationDays} onChange={(e) => setVariantForm({ ...variantForm, durationDays: Number(e.target.value) })} placeholder="Durasi (hari)" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
              <input type="number" value={variantForm.stock} onChange={(e) => setVariantForm({ ...variantForm, stock: Number(e.target.value) })} placeholder="Stok" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
              <input type="number" value={variantForm.guaranteeDays ?? ''} onChange={(e) => setVariantForm({ ...variantForm, guaranteeDays: e.target.value ? Number(e.target.value) : null })} placeholder="Hari Garansi (kosong = full)" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
              <label className="flex items-center gap-2 px-3 py-2">
                <input type="checkbox" checked={variantForm.isUnlimited} onChange={(e) => setVariantForm({ ...variantForm, isUnlimited: e.target.checked })} className="rounded" />
                <span className="text-body-xs text-muted-foreground">Stok Unlimited</span>
              </label>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-body-sm font-medium rounded-lg transition-colors">
                  {editingVariantId ? 'Update' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowVariantForm(false)} className="px-4 py-2 border border-dark-border text-muted-foreground text-body-sm rounded-lg hover:text-white transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Variant List */}
        {product.variants.length === 0 ? (
          <div className="p-6 text-center bg-dark-card border border-dark-border rounded-xl text-muted-foreground text-body-sm">
            Belum ada varian. Tambahkan varian pertama!
          </div>
        ) : (
          <div className="space-y-2">
            {product.variants.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-xl">
                <div>
                  <p className="text-body-sm font-medium text-white">{v.name}</p>
                  <p className="text-body-xs text-muted-foreground">
                    {formatRupiah(v.price)} | {v.durationDays} hari |
                    Stok: {v.isUnlimited ? '∞' : v.stock} |
                    Garansi: {v.guaranteeDays === null ? 'Full' : v.guaranteeDays === 0 ? 'Tanpa' : `${v.guaranteeDays} hari`}
                    {product.fulfillType === 'AUTO' && ` | Ready: ${v._count.stockItems}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-body-xs px-2 py-0.5 rounded ${v.isActive ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                    {v.isActive ? 'Aktif' : 'Off'}
                  </span>
                  <button onClick={() => startEditVariant(v)} className="text-body-xs text-info hover:text-white px-2 py-1">Edit</button>
                  <button onClick={() => handleDeleteVariant(v.id)} className="text-body-xs text-error hover:text-white px-2 py-1">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
