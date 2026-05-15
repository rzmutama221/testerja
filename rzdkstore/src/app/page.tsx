import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import CategorySection from '@/components/landing/CategorySection';
import ProductSection from '@/components/landing/ProductSection';
import HowToOrderSection from '@/components/landing/HowToOrderSection';
import AdvantagesSection from '@/components/landing/AdvantagesSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';

/**
 * Landing Page — rzdkstore.my.id
 *
 * Halaman publik utama yang berfungsi sebagai:
 * - Katalog produk preview
 * - Informasi keunggulan & cara order
 * - Konversi visitor → customer (CTA register/login)
 *
 * Struktur:
 * 1. Navbar (sticky)
 * 2. Hero Section (headline + CTA + trust badges)
 * 3. Kategori Produk (5 kategori grid)
 * 4. Produk Populer (12 produk preview)
 * 5. Cara Order (4 langkah)
 * 6. Keunggulan (4 benefit cards)
 * 7. FAQ (accordion)
 * 8. Footer (kontak + links)
 */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategorySection />
        <ProductSection />
        <HowToOrderSection />
        <AdvantagesSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
