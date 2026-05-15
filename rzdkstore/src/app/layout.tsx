import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'rzdkstore — Langganan Premium, Harga Terjangkau',
    template: '%s | rzdkstore',
  },
  description:
    'Platform toko digital premium terpercaya. Netflix, Spotify, ChatGPT, Canva, dan 100+ produk digital lainnya dengan harga terjangkau dan bergaransi.',
  keywords: ['streaming premium', 'akun premium murah', 'netflix murah', 'spotify premium'],
  authors: [{ name: 'rzdkstore' }],
  creator: 'rzdkstore',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://rzdkstore.my.id'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://rzdkstore.my.id',
    siteName: 'rzdkstore',
    title: 'rzdkstore — Langganan Premium, Harga Terjangkau',
    description: 'Platform toko digital premium terpercaya dengan 100+ produk digital bergaransi.',
  },
  manifest: '/manifest.json',
  themeColor: '#171717',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} ${poppins.variable} font-body`}>{children}</body>
    </html>
  );
}
