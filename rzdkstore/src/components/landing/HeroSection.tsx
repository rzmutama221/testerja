import Link from 'next/link';

/**
 * Hero Section — Landing Page
 *
 * Konten:
 * - Headline besar
 * - Subheadline value proposition
 * - 2 CTA Button (Lihat Produk + Daftar Sekarang)
 * - Trust badges (100+ Produk, Proses Cepat, Bergaransi)
 * - Background: subtle grid pattern
 */
export default function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-dark">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(1,163,90,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(1,163,90,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-8">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-body-xs text-primary font-medium">Platform Toko Digital #1</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Langganan Premium,{' '}
          <span className="text-primary">Harga Terjangkau</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Netflix, Spotify, ChatGPT, Canva, dan 100+ produk digital lainnya.
          Proses cepat, bergaransi, semua dikelola dalam satu panel.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#produk"
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 text-center"
          >
            Lihat Produk
          </a>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 border border-dark-border text-white hover:bg-dark-card font-medium rounded-xl transition-colors text-center"
          >
            Daftar Sekarang
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <TrustBadge icon="box" label="100+ Produk Digital" />
          <TrustBadge icon="zap" label="Proses Cepat" />
          <TrustBadge icon="shield" label="Bergaransi" />
          <TrustBadge icon="clock" label="Panel 24/7" />
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    box: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    zap: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    shield: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    clock: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-primary">{icons[icon]}</span>
      <span className="text-body-sm">{label}</span>
    </div>
  );
}
