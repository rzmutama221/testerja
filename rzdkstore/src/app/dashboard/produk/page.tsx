'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

interface Variant {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  stock: number;
  isUnlimited: boolean;
  guaranteeDays: number | null;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string | null;
  fulfillType: string;
  isActive: boolean;
  category: Category;
  variants: Variant[];
}

interface AdditionalData {
  deviceBrand?: string;
  deviceModel?: string;
  deviceType?: string;
  deviceOs?: string;
  loginCity?: string;
  memberEmail?: string;
}

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [additionalData, setAdditionalData] = useState<AdditionalData>({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('categoryId', selectedCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products);
        setCategories(json.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (product: Product, variant: Variant) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
    setVoucherCode('');
    setVoucherDiscount(0);
    setVoucherError('');
    setVoucherApplied(false);
    setAdditionalData({});
    setOrderError('');
    setOrderSuccess(false);
    setShowOrderModal(true);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Masukkan kode voucher');
      return;
    }
    setVoucherError('');
    // For now, the voucher is validated on order submit. We just store the code.
    setVoucherApplied(true);
    setVoucherDiscount(0); // Actual discount calculated server-side
  };

  const handleSubmitOrder = async () => {
    if (!selectedVariant) return;

    setOrderLoading(true);
    setOrderError('');

    try {
      const body: { variantId: string; voucherCode?: string; additionalData?: AdditionalData } = {
        variantId: selectedVariant.id,
      };

      if (voucherCode.trim()) {
        body.voucherCode = voucherCode.trim();
      }

      const hasAdditionalData = Object.values(additionalData).some((v) => v && v.trim());
      if (hasAdditionalData) {
        body.additionalData = additionalData;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        setOrderSuccess(true);
      } else {
        setOrderError(json.message || 'Gagal membuat order');
      }
    } catch (error) {
      setOrderError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setOrderLoading(false);
    }
  };

  const isNetflixSlot = (product: Product): boolean => {
    return product.fulfillType === 'SLOT' && product.name.toLowerCase().includes('netflix');
  };

  const isChatGPT = (product: Product): boolean => {
    return product.name.toLowerCase().includes('chatgpt');
  };

  const getMinPrice = (variants: Variant[]): number => {
    if (variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.price));
  };

  const hasStock = (variants: Variant[]): boolean => {
    return variants.some((v) => v.isUnlimited || v.stock > 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-sm text-muted-foreground">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-heading-2 text-white mb-2">Katalog Produk</h1>
      <p className="text-body-sm text-muted-foreground mb-6">
        Pilih produk dan varian yang ingin kamu order
      </p>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-dark-card border border-dark-border rounded-lg text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-body-sm text-muted-foreground">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-dark-card border border-dark-border rounded-xl overflow-hidden transition-all hover:border-primary/30"
            >
              {/* Product Card Header */}
              <button
                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{product.category.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-body-sm text-white truncate">{product.name}</h3>
                    <p className="text-body-xs text-muted-foreground mt-0.5">{product.category.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-body-xs text-primary font-medium">
                        mulai dari {formatRupiah(getMinPrice(product.variants))}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${hasStock(product.variants) ? 'bg-green-400' : 'bg-red-400'}`}
                      />
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedProduct === product.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Variants */}
              {expandedProduct === product.id && (
                <div className="px-4 pb-4 border-t border-dark-border pt-3">
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-3 bg-dark rounded-lg border border-dark-border"
                      >
                        <div>
                          <p className="text-body-sm text-white">{variant.name}</p>
                          <p className="text-body-xs text-muted-foreground">
                            {variant.durationDays} hari
                            {variant.guaranteeDays ? ` • Garansi ${variant.guaranteeDays} hari` : ''}
                          </p>
                          <p className="text-body-sm text-primary font-medium mt-1">
                            {formatRupiah(variant.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleOrderClick(product, variant)}
                          disabled={!variant.isUnlimited && variant.stock <= 0}
                          className="px-3 py-1.5 bg-primary text-primary-foreground text-body-xs font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {variant.isUnlimited || variant.stock > 0 ? 'Order' : 'Habis'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedProduct && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !orderLoading && setShowOrderModal(false)} />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-dark-card border border-dark-border rounded-xl p-6">
            {/* Close button */}
            <button
              onClick={() => !orderLoading && setShowOrderModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {orderSuccess ? (
              /* Success State */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-heading text-heading-4 text-white mb-2">Order Berhasil!</h3>
                <p className="text-body-sm text-muted-foreground mb-6">
                  Order kamu telah dibuat dan menunggu persetujuan admin.
                </p>
                <a
                  href="/dashboard/transaksi"
                  className="inline-block px-6 py-2.5 bg-primary text-primary-foreground text-body-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Lihat Transaksi
                </a>
              </div>
            ) : (
              /* Order Form */
              <>
                <h3 className="font-heading text-heading-4 text-white mb-4">Buat Order</h3>

                {/* Product & Variant Info */}
                <div className="p-3 bg-dark rounded-lg border border-dark-border mb-4">
                  <p className="text-body-sm text-white font-medium">{selectedProduct.name}</p>
                  <p className="text-body-xs text-muted-foreground mt-1">
                    Varian: {selectedVariant.name} • {selectedVariant.durationDays} hari
                  </p>
                </div>

                {/* Netflix Additional Fields */}
                {isNetflixSlot(selectedProduct) && (
                  <div className="space-y-3 mb-4">
                    <p className="text-body-xs text-muted-foreground font-medium">Informasi Device (Netflix)</p>
                    <input
                      type="text"
                      placeholder="Brand Device (contoh: Samsung)"
                      value={additionalData.deviceBrand || ''}
                      onChange={(e) => setAdditionalData({ ...additionalData, deviceBrand: e.target.value })}
                      className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      placeholder="Model Device (contoh: Galaxy S23)"
                      value={additionalData.deviceModel || ''}
                      onChange={(e) => setAdditionalData({ ...additionalData, deviceModel: e.target.value })}
                      className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <select
                      value={additionalData.deviceType || ''}
                      onChange={(e) => setAdditionalData({ ...additionalData, deviceType: e.target.value })}
                      className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Pilih Tipe Device</option>
                      <option value="Smartphone">Smartphone</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Smart TV">Smart TV</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Firestick">Firestick</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    <input
                      type="text"
                      placeholder="OS Device (contoh: Android 14)"
                      value={additionalData.deviceOs || ''}
                      onChange={(e) => setAdditionalData({ ...additionalData, deviceOs: e.target.value })}
                      className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      placeholder="Kota Login (contoh: Jakarta)"
                      value={additionalData.loginCity || ''}
                      onChange={(e) => setAdditionalData({ ...additionalData, loginCity: e.target.value })}
                      className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}

                {/* ChatGPT Additional Field */}
                {isChatGPT(selectedProduct) && (
                  <div className="space-y-3 mb-4">
                    <p className="text-body-xs text-muted-foreground font-medium">Informasi Member (ChatGPT)</p>
                    <input
                      type="email"
                      placeholder="Email Member"
                      value={additionalData.memberEmail || ''}
                      onChange={(e) => setAdditionalData({ ...additionalData, memberEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}

                {/* Voucher Code */}
                <div className="mb-4">
                  <p className="text-body-xs text-muted-foreground font-medium mb-2">Kode Voucher (opsional)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode voucher"
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value);
                        setVoucherApplied(false);
                        setVoucherError('');
                      }}
                      className="flex-1 px-3 py-2 bg-dark border border-dark-border rounded-lg text-body-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={handleApplyVoucher}
                      className="px-4 py-2 bg-primary/20 text-primary text-body-xs font-medium rounded-lg hover:bg-primary/30 transition-colors border border-primary/30"
                    >
                      Terapkan
                    </button>
                  </div>
                  {voucherError && (
                    <p className="text-body-xs text-red-400 mt-1">{voucherError}</p>
                  )}
                  {voucherApplied && !voucherError && (
                    <p className="text-body-xs text-green-400 mt-1">Kode voucher akan divalidasi saat order</p>
                  )}
                </div>

                {/* Price Summary */}
                <div className="p-3 bg-dark rounded-lg border border-dark-border mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-body-xs text-muted-foreground">Harga</span>
                    <span className="text-body-sm text-white">{formatRupiah(selectedVariant.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-xs text-muted-foreground">Diskon</span>
                    <span className="text-body-sm text-green-400">
                      {voucherApplied ? 'Dihitung saat order' : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dark-border">
                    <span className="text-body-sm text-white font-medium">Total</span>
                    <span className="text-body-sm text-primary font-medium">
                      {formatRupiah(selectedVariant.price - voucherDiscount)}
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {orderError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                    <p className="text-body-xs text-red-400">{orderError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={orderLoading}
                  className="w-full py-3 bg-primary text-primary-foreground text-body-sm font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {orderLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Buat Order'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
