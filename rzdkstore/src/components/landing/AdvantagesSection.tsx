/**
 * Advantages/Keunggulan Section — Landing Page
 *
 * 4 kartu benefit mengapa beli di rzdkstore.
 */

const advantages = [
  {
    title: 'Harga Terjangkau',
    description: 'Harga paling kompetitif di pasaran. Hemat hingga 90% dibanding langganan langsung.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Proses Super Cepat',
    description: 'Order diproses dalam hitungan menit. Produk tipe AUTO langsung aktif setelah bayar.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Garansi Terjamin',
    description: 'Semua produk bergaransi. Jika ada masalah, klaim garansi langsung dari dashboard Anda.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Panel Mandiri 24/7',
    description: 'Akses dashboard kapan saja. Cek status order, masa aktif, dan klaim garansi tanpa ribet.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function AdvantagesSection() {
  return (
    <section className="py-20 bg-dark-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-heading-2 text-white mb-3">Kenapa Beli di rzdkstore?</h2>
          <p className="text-body-base text-muted-foreground max-w-xl mx-auto">
            Keunggulan yang membuat customer kami selalu kembali
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((item) => (
            <div
              key={item.title}
              className="p-6 bg-dark border border-dark-border rounded-xl hover:border-primary/30 transition-colors"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
                {item.icon}
              </div>

              {/* Content */}
              <h3 className="font-heading text-body-base font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-body-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
