/** @type {import('next').NextConfig} */
const nextConfig = {
  // Agar bisa dijalankan di shared hosting dengan standalone output
  output: 'standalone',

  // Konfigurasi gambar (logo produk, QRIS, dll.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rzdkstore.my.id',
      },
    ],
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
};

module.exports = nextConfig;
