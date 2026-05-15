/**
 * Category Section — Landing Page
 *
 * Grid 5 kategori produk sesuai database.
 * Klik kategori → scroll ke seksi produk (atau filter di masa depan).
 */

const categories = [
  { icon: '🎬', name: 'Streaming Video', slug: 'streaming-video', count: 14 },
  { icon: '🎧', name: 'Streaming Musik', slug: 'streaming-musik', count: 2 },
  { icon: '🎨', name: 'Aplikasi Kreatif', slug: 'aplikasi-kreatif', count: 11 },
  { icon: '🤖', name: 'AI & Edukasi', slug: 'ai-edukasi', count: 9 },
  { icon: '💼', name: 'Produktivitas', slug: 'produktivitas', count: 7 },
];

export default function CategorySection() {
  return (
    <section className="py-16 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-heading text-heading-2 text-white mb-3">Kategori Produk</h2>
          <p className="text-body-base text-muted-foreground max-w-xl mx-auto">
            Pilih kategori sesuai kebutuhan Anda
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <a
              key={category.slug}
              href="#produk"
              className="group p-5 bg-dark-card border border-dark-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="font-heading text-body-sm font-semibold text-white group-hover:text-primary transition-colors mb-1">
                {category.name}
              </h3>
              <p className="text-body-xs text-muted-foreground">
                {category.count} produk
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
