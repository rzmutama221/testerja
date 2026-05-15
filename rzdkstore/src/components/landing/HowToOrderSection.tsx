/**
 * How to Order Section — Landing Page
 *
 * 4 langkah visual proses pembelian.
 */

const steps = [
  {
    number: '01',
    title: 'Daftar & Verifikasi',
    description: 'Buat akun baru dan verifikasi email Anda untuk mengaktifkan dashboard.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Pilih Produk & Varian',
    description: 'Jelajahi katalog, pilih produk dan varian yang diinginkan, lalu buat order.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Bayar via QRIS',
    description: 'Setelah order disetujui admin, lakukan pembayaran via QRIS dan upload bukti.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Terima Produk',
    description: 'Produk langsung tampil di dashboard Anda setelah pembayaran terverifikasi.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

export default function HowToOrderSection() {
  return (
    <section id="cara-order" className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="font-heading text-heading-2 text-white mb-3">Cara Order</h2>
          <p className="text-body-base text-muted-foreground max-w-xl mx-auto">
            4 langkah mudah untuk mendapatkan produk digital premium
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%_-_8px)] w-full h-[2px] bg-gradient-to-r from-primary/40 to-transparent z-0" />
              )}

              {/* Card */}
              <div className="relative z-10 p-6 bg-dark-card border border-dark-border rounded-xl h-full">
                {/* Step Number */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <span className="font-heading text-2xl font-bold text-dark-border">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-heading text-body-base font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-body-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
