import Link from 'next/link';

/**
 * Product Section — Landing Page
 *
 * Preview produk populer dari setiap kategori (12 produk).
 * Menampilkan card produk dengan nama, harga mulai, dan badge kategori.
 * CTA: Login untuk order / Daftar akun.
 */

const products = [
  { name: 'Netflix', category: 'Streaming Video', priceFrom: 2500, icon: '🎬' },
  { name: 'Disney+', category: 'Streaming Video', priceFrom: 15500, icon: '🎬' },
  { name: 'YouTube Premium', category: 'Streaming Video', priceFrom: 4000, icon: '🎬' },
  { name: 'Spotify Premium', category: 'Streaming Musik', priceFrom: 15000, icon: '🎧' },
  { name: 'Apple Music', category: 'Streaming Musik', priceFrom: 6000, icon: '🎧' },
  { name: 'Canva Pro', category: 'Aplikasi Kreatif', priceFrom: 3000, icon: '🎨' },
  { name: 'Capcut Pro', category: 'Aplikasi Kreatif', priceFrom: 3000, icon: '🎨' },
  { name: 'ChatGPT Premium', category: 'AI & Edukasi', priceFrom: 28000, icon: '🤖' },
  { name: 'Gemini Pro', category: 'AI & Edukasi', priceFrom: 9000, icon: '🤖' },
  { name: 'Perplexity Pro', category: 'AI & Edukasi', priceFrom: 10000, icon: '🤖' },
  { name: 'Vidio', category: 'Streaming Video', priceFrom: 10000, icon: '🎬' },
  { name: 'Zoom Pro', category: 'Produktivitas', priceFrom: 7000, icon: '💼' },
];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductSection() {
  return (
    <section id="produk" className="py-20 bg-dark-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-heading-2 text-white mb-3">Produk Populer</h2>
          <p className="text-body-base text-muted-foreground max-w-xl mx-auto">
            Pilihan produk digital terlaris dengan harga paling kompetitif
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="group p-5 bg-dark-card border border-dark-border rounded-xl hover:border-primary/40 transition-all duration-200"
            >
              {/* Category Badge */}
              <span className="inline-block text-body-xs text-muted-foreground bg-dark px-2 py-0.5 rounded-md mb-3">
                {product.icon} {product.category}
              </span>

              {/* Product Name */}
              <h3 className="font-heading text-body-sm font-semibold text-white group-hover:text-primary transition-colors mb-2">
                {product.name}
              </h3>

              {/* Price */}
              <p className="text-body-xs text-muted-foreground">
                Mulai dari
              </p>
              <p className="font-heading text-lg font-bold text-primary">
                {formatRupiah(product.priceFrom)}
              </p>

              {/* Availability */}
              <div className="mt-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-body-xs text-primary">Tersedia</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-body-sm text-muted-foreground mb-4">
            Daftar akun untuk melihat semua varian dan mulai berbelanja
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
            >
              Daftar & Lihat Semua Produk
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-dark-border text-white hover:bg-dark-card rounded-lg transition-colors"
            >
              Sudah Punya Akun? Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
