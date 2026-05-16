'use client';

import { useEffect, useState } from 'react';

/**
 * Admin — Manajemen Produk
 *
 * Features:
 * - List semua produk dengan kategori & jumlah varian
 * - Filter per kategori
 * - Search by nama
 * - Tombol tambah produk (modal)
 * - Edit & hapus produk
 * - Toggle aktif/nonaktif
 * - Manage varian per produk (expand)
 */

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  fulfillType: 'AUTO' | 'MANUAL' | 'SLOT';
  isActive: boolean;
  sortOrder: number;
  category: { id: string; name: string; icon: string };
  _count: { variants: number };
}

function formatFulfillType(type: string): string {
  const map: Record<string, string> = {
    AUTO: 'Auto Fulfill',
    MANUAL: 'Manual',
    SLOT: 'Slot System',
  };
  return map[type] || type;
}

export default function AdminProdukPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');

  // Tab: categories | products
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '', slug: '', sortOrder: 0, isActive: true });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    categoryId: '', name: '', slug: '', logoUrl: '', description: '', fulfillType: 'MANUAL' as string, isActive: true, sortOrder: 0,
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [catRes, prodRes] = await Promise.all([
      fetch('/api/admin/categories'),
      fetch('/api/admin/products'),
    ]);
    const catData = await catRes.json();
    const prodData = await prodRes.json();
    if (catData.success) setCategories(catData.data);
    if (prodData.success) setProducts(prodData.data);
    setLoading(false);
  }

  // --- CATEGORY CRUD ---
  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const method = editingCategoryId ? 'PUT' : 'POST';
    const url = editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : '/api/admin/categories';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryForm),
    });
    const data = await res.json();

    if (data.success) {
      setShowCategoryForm(false);
      setCategoryForm({ name: '', icon: '', slug: '', sortOrder: 0, isActive: true });
      setEditingCategoryId(null);
      fetchData();
    } else {
      setFormError(data.message);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Yakin hapus kategori ini?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) fetchData();
    else alert(data.message);
  }

  function startEditCategory(cat: Category) {
    setCategoryForm({ name: cat.name, icon: cat.icon, slug: cat.slug, sortOrder: cat.sortOrder, isActive: cat.isActive });
    setEditingCategoryId(cat.id);
    setShowCategoryForm(true);
  }

  // --- PRODUCT CRUD ---
  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const method = editingProductId ? 'PUT' : 'POST';
    const url = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm),
    });
    const data = await res.json();

    if (data.success) {
      setShowProductForm(false);
      setProductForm({ categoryId: '', name: '', slug: '', logoUrl: '', description: '', fulfillType: 'MANUAL', isActive: true, sortOrder: 0 });
      setEditingProductId(null);
      fetchData();
    } else {
      setFormError(data.message);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Yakin hapus produk ini? Semua varian & stok akan ikut terhapus.')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) fetchData();
    else alert(data.message);
  }

  function startEditProduct(prod: Product) {
    setProductForm({
      categoryId: prod.category.id, name: prod.name, slug: prod.slug, logoUrl: prod.logoUrl,
      description: '', fulfillType: prod.fulfillType, isActive: prod.isActive, sortOrder: prod.sortOrder,
    });
    setEditingProductId(prod.id);
    setShowProductForm(true);
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (filterCategory && p.category.id !== filterCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-heading-2 text-white mb-6">Manajemen Produk</h1>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-dark-card border border-dark-border rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-heading-2 text-white mb-6">Manajemen Produk</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-primary text-white' : 'bg-dark-card text-muted-foreground border border-dark-border hover:text-white'}`}
        >
          Produk ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-primary text-white' : 'bg-dark-card text-muted-foreground border border-dark-border hover:text-white'}`}
        >
          Kategori ({categories.length})
        </button>
      </div>

      {/* ============== CATEGORIES TAB ============== */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-body-sm text-muted-foreground">Kelola kategori produk</p>
            <button
              onClick={() => { setShowCategoryForm(true); setEditingCategoryId(null); setCategoryForm({ name: '', icon: '', slug: '', sortOrder: 0, isActive: true }); }}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-body-sm font-medium rounded-lg transition-colors"
            >
              + Tambah Kategori
            </button>
          </div>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div className="mb-6 p-6 bg-dark-card border border-dark-border rounded-xl">
              <h3 className="font-heading text-body-base font-semibold text-white mb-4">
                {editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              {formError && <p className="text-body-xs text-error mb-3">{formError}</p>}
              <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Nama Kategori" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
                <input value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} placeholder="Icon/Emoji (e.g. 🎬)" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
                <input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="Slug (e.g. streaming-video)" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
                <input type="number" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: Number(e.target.value) })} placeholder="Sort Order" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-body-sm font-medium rounded-lg transition-colors">
                    {editingCategoryId ? 'Update' : 'Simpan'}
                  </button>
                  <button type="button" onClick={() => setShowCategoryForm(false)} className="px-4 py-2 border border-dark-border text-muted-foreground text-body-sm rounded-lg hover:text-white transition-colors">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Category List */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className="text-body-sm font-medium text-white">{cat.name}</p>
                    <p className="text-body-xs text-muted-foreground">{cat._count.products} produk | slug: {cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-body-xs px-2 py-0.5 rounded ${cat.isActive ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                    {cat.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button onClick={() => startEditCategory(cat)} className="text-body-xs text-info hover:text-white transition-colors px-2 py-1">Edit</button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-body-xs text-error hover:text-white transition-colors px-2 py-1">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============== PRODUCTS TAB ============== */}
      {activeTab === 'products' && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="flex-1 px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            <button
              onClick={() => { setShowProductForm(true); setEditingProductId(null); setProductForm({ categoryId: categories[0]?.id || '', name: '', slug: '', logoUrl: '', description: '', fulfillType: 'MANUAL', isActive: true, sortOrder: 0 }); }}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-body-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              + Tambah Produk
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="mb-6 p-6 bg-dark-card border border-dark-border rounded-xl">
              <h3 className="font-heading text-body-base font-semibold text-white mb-4">
                {editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              {formError && <p className="text-body-xs text-error mb-3">{formError}</p>}
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none">
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
                <select value={productForm.fulfillType} onChange={(e) => setProductForm({ ...productForm, fulfillType: e.target.value })} className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none">
                  <option value="MANUAL">Manual Fulfill</option>
                  <option value="AUTO">Auto Fulfill</option>
                  <option value="SLOT">Slot System</option>
                </select>
                <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Nama Produk" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
                <input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} placeholder="Slug (e.g. netflix)" className="px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
                <input value={productForm.logoUrl} onChange={(e) => setProductForm({ ...productForm, logoUrl: e.target.value })} placeholder="Logo URL (e.g. /logos/netflix.png)" className="sm:col-span-2 px-3 py-2 bg-dark border border-dark-border rounded-lg text-white text-body-sm focus:border-primary focus:outline-none" />
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-body-sm font-medium rounded-lg transition-colors">
                    {editingProductId ? 'Update' : 'Simpan'}
                  </button>
                  <button type="button" onClick={() => setShowProductForm(false)} className="px-4 py-2 border border-dark-border text-muted-foreground text-body-sm rounded-lg hover:text-white transition-colors">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product List */}
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-body-sm bg-dark-card border border-dark-border rounded-xl">
                {search || filterCategory ? 'Tidak ada produk yang cocok dengan filter' : 'Belum ada produk. Tambahkan produk pertama Anda!'}
              </div>
            ) : (
              filteredProducts.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark border border-dark-border rounded-lg flex items-center justify-center text-body-xs text-muted-foreground overflow-hidden">
                      {prod.logoUrl ? <span className="text-lg">{prod.category.icon}</span> : '?'}
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-white">{prod.name}</p>
                      <p className="text-body-xs text-muted-foreground">
                        {prod.category.icon} {prod.category.name} | {prod._count.variants} varian | {formatFulfillType(prod.fulfillType)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-body-xs px-2 py-0.5 rounded ${prod.isActive ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                      {prod.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <a href={`/admin/produk/${prod.id}`} className="text-body-xs text-info hover:text-white transition-colors px-2 py-1">Detail</a>
                    <button onClick={() => startEditProduct(prod)} className="text-body-xs text-info hover:text-white transition-colors px-2 py-1">Edit</button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="text-body-xs text-error hover:text-white transition-colors px-2 py-1">Hapus</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="mt-4 text-body-xs text-muted-foreground">
            Klik &quot;Detail&quot; pada produk untuk manage varian dan stok digital.
          </p>
        </div>
      )}
    </div>
  );
}
