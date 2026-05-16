# 🚀 rzdkstore — SaaS Panel Toko Digital Premium

> Platform toko digital premium terpercaya. Netflix, Spotify, ChatGPT, Canva, dan 100+ produk digital lainnya dengan harga terjangkau dan bergaransi.

**Domain:** https://rzdkstore.my.id  
**Tech Stack:** Next.js 14 · TypeScript · Tailwind CSS · Prisma · MySQL · NextAuth.js v5

---

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.x
- npm

### Installation

```bash
# 1. Clone repository
git clone https://github.com/rzmutama221/testerja.git
cd testerja/rzdkstore

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema ke database
npx prisma db push

# 6. (Opsional) Seed data awal
npx prisma db seed

# 7. Jalankan development server
npm run dev
```

### Akses:
- **Landing Page:** http://localhost:3000
- **Customer Dashboard:** http://localhost:3000/dashboard
- **Admin Panel:** http://localhost:3000/admin

---

## 🏗️ Deployment (Shared Hosting)

```bash
# Build production
npm run build

# Jalankan dengan PM2
pm2 start npm --name "rzdkstore" -- start

# Atau tanpa PM2
npm start
```

### Setup di Hosting:
1. Upload project ke hosting via SSH/FTP
2. Install Node.js 18+ via terminal hosting
3. Buat database MySQL via phpMyAdmin
4. Set environment variables (`.env`)
5. `npm install && npx prisma migrate deploy && npm run build`
6. Start dengan PM2: `pm2 start npm --name rzdkstore -- start`
7. Point domain `rzdkstore.my.id` ke Node.js process (port 3000)

---

## 📂 Project Structure

```
rzdkstore/
├── prisma/schema.prisma   — 19 tabel database
├── public/                — PWA assets, uploads, QRIS
├── src/
│   ├── app/
│   │   ├── (auth)/        — Login, Register, Verify, Reset
│   │   ├── dashboard/     — Customer Panel (7 pages)
│   │   ├── admin/         — Admin Panel (12 pages)
│   │   └── api/           — API Routes (30+ endpoints)
│   ├── components/        — UI components
│   ├── lib/               — Core services (auth, email, push, encryption)
│   └── middleware.ts      — Route protection
├── tailwind.config.ts     — Custom tema hitam-hijau
└── package.json
```

---

## 🔐 Membuat Akun Admin Pertama

Setelah deploy, buat admin pertama via database:

```sql
-- Via phpMyAdmin atau MySQL CLI
UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
```

Atau daftar akun biasa terlebih dahulu, lalu update role-nya di database.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#171717` |
| Card | `#2c2c2c` |
| Border | `#3f3f46` |
| Primary | `#01a35a` |
| Primary Hover | `#0edf7d` |
| Heading Font | Poppins |
| Body Font | Inter |

---

## 📝 Environment Variables

Lihat `.env.example` untuk daftar lengkap variabel yang diperlukan.

**Wajib:**
- `DATABASE_URL` — MySQL connection string
- `NEXTAUTH_SECRET` — Random string 32 karakter
- `NEXTAUTH_URL` — URL production
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Email SMTP
- `ENCRYPTION_KEY` — Random string 32 karakter

**Opsional:**
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — Push notifications
- `PAYMENT_GATEWAY_*` — Payment gateway config

---

## 📜 License

Private — rzdkstore.my.id © 2026
