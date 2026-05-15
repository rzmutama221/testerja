# 🚀 MASTERPLAN — rzdkstore.my.id SaaS Panel Upgrade

> **Dokumen ini adalah masterplan resmi pengembangan platform rzdkstore.my.id**
> dari website katalog statis menjadi SaaS Panel toko digital yang lengkap.
>
> **Versi:** 1.0.0
> **Tanggal Dibuat:** 15 Mei 2026
> **Domain:** https://rzdkstore.my.id
> **WhatsApp Store:** 085111642004

---

## 📋 DAFTAR ISI

1. [Visi & Tujuan](#1-visi--tujuan)
2. [Tech Stack](#2-tech-stack)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Struktur Database](#4-struktur-database)
5. [Role & Hak Akses](#5-role--hak-akses)
6. [Alur Sistem Lengkap](#6-alur-sistem-lengkap)
7. [Fitur Detail — Landing Page](#7-fitur-detail--landing-page)
8. [Fitur Detail — Auth System](#8-fitur-detail--auth-system)
9. [Fitur Detail — Customer Dashboard](#9-fitur-detail--customer-dashboard)
10. [Fitur Detail — Admin Panel](#10-fitur-detail--admin-panel)
11. [Sistem Produk & Tipe Fulfillment](#11-sistem-produk--tipe-fulfillment)
12. [Sistem Slot Netflix](#12-sistem-slot-netflix)
13. [Sistem Slot ChatGPT Business](#13-sistem-slot-chatgpt-business)
14. [Sistem Payment](#14-sistem-payment)
15. [Sistem Garansi](#15-sistem-garansi)
16. [Sistem Voucher & Diskon](#16-sistem-voucher--diskon)
17. [Sistem Announcement](#17-sistem-announcement)
18. [Sistem Notifikasi (PWA + Email)](#18-sistem-notifikasi-pwa--email)
19. [Struktur Folder Project](#19-struktur-folder-project)
20. [Desain System & Tema](#20-desain-system--tema)
21. [Fase Pengerjaan Bertahap](#21-fase-pengerjaan-bertahap)
22. [Catatan Deployment](#22-catatan-deployment)

---

## 1. VISI & TUJUAN

### Visi
Mengubah rzdkstore.my.id dari katalog produk statis berbasis WhatsApp menjadi **platform toko digital SaaS yang profesional**, di mana seluruh proses dari pemesanan, pembayaran, fulfillment produk, hingga klaim garansi dilakukan dalam satu sistem terintegrasi tanpa ketergantungan pada WhatsApp sebagai media transaksi utama.

### Tujuan Utama
- ✅ Memberikan pengalaman belanja yang profesional kepada customer
- ✅ Meminimalkan pekerjaan manual admin melalui otomasi sistem
- ✅ Memiliki kontrol penuh atas data transaksi, keuangan, dan customer
- ✅ Sistem yang scalable dan mudah di-maintain tanpa sentuh kode
- ✅ Meningkatkan kepercayaan customer dengan transparansi order & garansi

### Yang Berubah dari Sistem Lama
| Aspek | Sebelum | Sesudah |
|---|---|---|
| Katalog produk | Halaman web statis | Dynamic dari database |
| Transaksi | Manual via WhatsApp | Panel terintegrasi |
| Payment | QRIS manual, konfirmasi WA | Upload bukti di web, admin ACC di panel |
| Fulfillment | Kirim manual via WA | Semi-otomatis & otomatis via panel |
| Data customer | Tidak ada | Database lengkap dengan history |
| Garansi | Chat WA | Sistem klaim formal di dashboard |
| Monitoring | Tidak ada | Dashboard keuangan & analitik real-time |

---

## 2. TECH STACK

### Core Framework
| Layer | Teknologi | Versi | Keterangan |
|---|---|---|---|
| Framework | **Next.js** | 14 (App Router) | Full-stack, SSR/SSG, API Routes built-in |
| Language | **TypeScript** | 5.x | Type safety, developer experience lebih baik |
| Styling | **Tailwind CSS** | 3.x | Utility-first, custom tema mudah |
| UI Components | **shadcn/ui** | Latest | Headless, fully customizable ke tema hitam-hijau |
| Icons | **Lucide React** | Latest | Konsisten, ringan |
| Font | **Poppins + Inter** | via next/font | Headings: Poppins, Body: Inter |

### Backend & Database
| Layer | Teknologi | Versi | Keterangan |
|---|---|---|---|
| Database | **MySQL** | 8.x | Familiar, tersedia di shared hosting |
| ORM | **Prisma** | 5.x | Type-safe queries, migration mudah, tetap bisa lihat data via phpMyAdmin |
| Auth | **NextAuth.js** | v5 (Auth.js) | Session management, email/password, JWT |
| Email | **Nodemailer** | Latest | Pakai SMTP hosting yang sudah ada |
| File Upload | **Multer / built-in** | - | Upload bukti transfer & QRIS image ke local filesystem |

### PWA & Notifikasi
| Layer | Teknologi | Keterangan |
|---|---|---|
| PWA | **next-pwa** | Installable ke homescreen, service worker |
| Push Notification | **Web Push API** | Native browser push, tidak berbayar |
| Push Library | **web-push** (npm) | Generate VAPID keys, kirim push dari server |
| Fallback Notifikasi | **Nodemailer** | Otomatis kirim email jika user belum izinkan push |

### Tooling
| Tool | Keterangan |
|---|---|
| Package Manager | **npm** |
| Linter | **ESLint** + **Prettier** |
| Validasi Form | **Zod** + **React Hook Form** |
| State Management | **Zustand** (lightweight, untuk client state) |
| Date Handling | **date-fns** |
| Table/Data Grid | **TanStack Table** |
| Chart/Grafik | **Recharts** |

---

## 3. ARSITEKTUR SISTEM

```
┌─────────────────────────────────────────────────────────────┐
│                     rzdkstore.my.id                          │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Landing Page│  │Customer Panel│  │    Admin Panel     │  │
│  │  (Public)   │  │  /dashboard  │  │      /admin        │  │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘  │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                    │
│              ┌───────────▼───────────┐                        │
│              │   Next.js App Router  │                        │
│              │     API Routes        │                        │
│              └───────────┬───────────┘                        │
│                          │                                    │
│         ┌────────────────┼────────────────┐                   │
│         │                │                │                   │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐           │
│  │   Prisma    │  │  NextAuth   │  │  Nodemailer│           │
│  │   ORM       │  │  (Auth.js)  │  │  (Email)   │           │
│  └──────┬──────┘  └─────────────┘  └────────────┘           │
│         │                                                     │
│  ┌──────▼──────┐  ┌─────────────┐  ┌────────────┐           │
│  │    MySQL    │  │   /public   │  │  Web Push  │           │
│  │  Database   │  │  (uploads,  │  │    API     │           │
│  │             │  │   qris.png) │  │            │           │
│  └─────────────┘  └─────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Routing Structure
```
/                          → Landing Page (public)
/login                     → Halaman Login
/register                  → Halaman Registrasi
/verify-email              → Verifikasi Email
/forgot-password           → Lupa Password
/reset-password            → Reset Password

/dashboard                 → Customer Dashboard (protected)
/dashboard/produk          → Katalog & Order Produk
/dashboard/transaksi       → Riwayat Transaksi
/dashboard/akun-aktif      → Detail Akun & Masa Aktif
/dashboard/garansi         → Klaim Garansi
/dashboard/notifikasi      → Notifikasi & Announcement
/dashboard/profil          → Profil & Pengaturan Akun

/admin                     → Admin Dashboard (protected, role: ADMIN)
/admin/transaksi           → Manajemen Transaksi
/admin/produk              → Manajemen Produk
/admin/customers           → Manajemen Customer
/admin/netflix             → Panel Slot Netflix
/admin/chatgpt             → Panel Slot ChatGPT
/admin/keuangan            → Laporan Keuangan
/admin/voucher             → Manajemen Voucher
/admin/announcement        → Manajemen Announcement
/admin/garansi             → Manajemen Klaim Garansi
/admin/payment-settings    → Pengaturan Payment
/admin/pengaturan          → Pengaturan Umum
```

---


## 4. STRUKTUR DATABASE

> Menggunakan MySQL 8.x dengan Prisma ORM. Semua tabel tetap bisa dipantau via phpMyAdmin.

### 4.1 Tabel `users`
```sql
- id              String    @id @default(cuid())
- username        String    @unique
- email           String    @unique
- password        String    (hashed bcrypt)
- full_name       String
- whatsapp        String?
- role            Enum      USER | ADMIN
- email_verified  Boolean   @default(false)
- is_active       Boolean   @default(true)
- push_subscribed Boolean   @default(false)
- push_endpoint   String?   (Web Push subscription endpoint)
- push_keys       Json?     (Web Push p256dh & auth keys)
- created_at      DateTime
- updated_at      DateTime
```

### 4.2 Tabel `email_verifications`
```sql
- id         String    @id
- user_id    String    → users.id
- token      String    @unique
- expires_at DateTime
- used       Boolean   @default(false)
- created_at DateTime
```

### 4.3 Tabel `password_resets`
```sql
- id         String    @id
- user_id    String    → users.id
- token      String    @unique
- expires_at DateTime
- used       Boolean   @default(false)
- created_at DateTime
```

### 4.4 Tabel `categories`
```sql
- id         String    @id
- name       String    (e.g. "Streaming Video & Hiburan")
- icon       String    (emoji atau icon class)
- slug       String    @unique
- sort_order Int
- is_active  Boolean   @default(true)
- created_at DateTime
```

### 4.5 Tabel `products`
```sql
- id                  String    @id
- category_id         String    → categories.id
- name                String
- slug                String    @unique
- logo_url            String
- description         String?
- fulfill_type        Enum      AUTO | MANUAL | SLOT
  -- AUTO   : stok tersedia, otomatis terkirim saat admin ACC
  -- MANUAL : admin proses & kirim info manual via panel
  -- SLOT   : khusus Netflix & ChatGPT (slot system)
- is_active           Boolean   @default(true)
- sort_order          Int
- announcement_note   String?   (catatan/pengumuman khusus produk ini)
- created_at          DateTime
- updated_at          DateTime
```

### 4.6 Tabel `product_variants`
```sql
- id               String    @id
- product_id       String    → products.id
- name             String    (e.g. "Sharing 1 Bulan")
- price            Int       (dalam Rupiah)
- duration_days    Int       (durasi dalam hari, untuk kalkulasi expired)
- stock            Int       @default(0)
- is_unlimited     Boolean   @default(false) (untuk produk resell manual)
- is_active        Boolean   @default(true)
- guarantee_days   Int?      (null = full garansi sesuai durasi, angka = hari garansi sejak order)
- notes            String?   (catatan internal admin)
- created_at       DateTime
- updated_at       DateTime
```

### 4.7 Tabel `product_stock_items`
> Khusus untuk produk tipe AUTO — menyimpan stok digital siap kirim
```sql
- id             String    @id
- variant_id     String    → product_variants.id
- content        String    (info akun/kode yang akan dikirim ke customer, encrypted)
- is_used        Boolean   @default(false)
- used_at        DateTime?
- order_id       String?   → orders.id
- created_at     DateTime
```

### 4.8 Tabel `orders`
```sql
- id               String    @id (format: ORD-YYYYMMDD-XXXX)
- user_id          String    → users.id
- variant_id       String    → product_variants.id
- quantity         Int       @default(1)
- unit_price       Int
- total_price      Int
- voucher_id       String?   → vouchers.id
- discount_amount  Int       @default(0)
- final_price      Int
- status           Enum:
  -- PENDING_REVIEW   : order masuk, menunggu admin review stok
  -- APPROVED         : admin ACC, menunggu customer bayar
  -- WAITING_PAYMENT  : customer diarahkan ke QRIS, belum upload bukti
  -- PAYMENT_UPLOADED : customer upload bukti transfer
  -- PAYMENT_VERIFIED : admin verifikasi pembayaran
  -- PROCESSING       : sedang diproses/fulfillment
  -- COMPLETED        : selesai, produk terkirim ke customer
  -- REJECTED         : ditolak admin (stok habis/alasan lain)
  -- CANCELLED        : dibatalkan
  -- REFUNDED         : dikembalikan
- reject_reason    String?
- admin_note       String?
- payment_method   Enum      QRIS_STATIC | PAYMENT_GATEWAY
- payment_proof    String?   (path file bukti transfer)
- payment_at       DateTime?
- completed_at     DateTime?
- expired_at       DateTime? (masa aktif produk, dikalkulasi dari completed_at)
- created_at       DateTime
- updated_at       DateTime
```

### 4.9 Tabel `order_fulfillments`
> Menyimpan detail info produk yang dikirimkan ke customer
```sql
- id           String    @id
- order_id     String    @unique → orders.id
- content      String    (info akun/instruksi yang diterima customer, encrypted)
- sent_at      DateTime
- sent_by      String    → users.id (admin yang mengirim, null jika auto)
- is_auto      Boolean   @default(false)
```

### 4.10 Tabel `guarantees`
```sql
- id              String    @id
- order_id        String    → orders.id
- user_id         String    → users.id
- description     String    (keluhan customer)
- attachment_url  String?   (screenshot bukti masalah)
- status          Enum      OPEN | IN_REVIEW | APPROVED | REJECTED | RESOLVED
- admin_note      String?
- resolved_at     DateTime?
- guarantee_valid_until DateTime (dikalkulasi dari order + guarantee_days varian)
- created_at      DateTime
- updated_at      DateTime
```

### 4.11 Tabel `vouchers`
```sql
- id               String    @id
- code             String    @unique
- description      String?
- discount_type    Enum      PERCENTAGE | FIXED
- discount_value   Int
- min_purchase     Int       @default(0)
- max_discount     Int?      (cap untuk percentage)
- usage_limit      Int?      (null = unlimited)
- used_count       Int       @default(0)
- valid_from       DateTime
- valid_until      DateTime
- is_active        Boolean   @default(true)
- applicable_to    Enum      ALL | SPECIFIC_PRODUCT | SPECIFIC_CATEGORY
- product_ids      Json?     (array product id jika SPECIFIC_PRODUCT)
- category_ids     Json?     (array category id jika SPECIFIC_CATEGORY)
- created_at       DateTime
```

### 4.12 Tabel `announcements`
```sql
- id           String    @id
- title        String
- content      String
- type         Enum      INFO | WARNING | MAINTENANCE | PROMO
- target       Enum      ALL | SPECIFIC_PRODUCT | SPECIFIC_CATEGORY
- product_ids  Json?     (array product id)
- category_ids Json?
- is_active    Boolean   @default(true)
- published_at DateTime
- expires_at   DateTime?
- created_by   String    → users.id
- created_at   DateTime
```

### 4.13 Tabel `notifications`
> Log notifikasi per user
```sql
- id           String    @id
- user_id      String    → users.id
- type         Enum      ORDER | PAYMENT | FULFILLMENT | GUARANTEE | ANNOUNCEMENT | SYSTEM
- title        String
- message      String
- data         Json?     (payload tambahan, misal order_id)
- is_read      Boolean   @default(false)
- push_sent    Boolean   @default(false)
- email_sent   Boolean   @default(false)
- created_at   DateTime
```

### 4.14 Tabel `netflix_accounts`
> Akun head Netflix milik admin
```sql
- id           String    @id
- label        String    (nama pengenal, e.g. "Netflix Head #1")
- email        String
- password     String    (encrypted)
- max_profiles Int       @default(5)
- is_active    Boolean   @default(true)
- notes        String?
- created_at   DateTime
- updated_at   DateTime
```

### 4.15 Tabel `netflix_slots`
> Slot profil per akun head Netflix
```sql
- id              String    @id
- account_id      String    → netflix_accounts.id
- profile_number  Int       (1-5)
- profile_name    String?
- is_occupied     Boolean   @default(false)
- order_id        String?   → orders.id
- customer_name   String?   (dari data user)
- customer_wa     String?
- device_brand    String?   (e.g. "Samsung")
- device_model    String?   (e.g. "Galaxy S23")
- device_type     String?   (e.g. "Smart TV", "Smartphone", "Tablet", "Laptop")
- device_os       String?   (e.g. "Android 14", "iOS 17", "Windows 11")
- login_city      String?   (kota/kabupaten login)
- started_at      DateTime?
- expired_at      DateTime?
- created_at      DateTime
- updated_at      DateTime
```

### 4.16 Tabel `chatgpt_accounts`
> Akun head ChatGPT Business milik admin
```sql
- id          String    @id
- label       String    (e.g. "ChatGPT Business Head #1")
- email       String
- password    String    (encrypted)
- max_members Int       @default(4)
- is_active   Boolean   @default(true)
- notes       String?
- created_at  DateTime
- updated_at  DateTime
```

### 4.17 Tabel `chatgpt_slots`
> Slot member per akun head ChatGPT
```sql
- id            String    @id
- account_id    String    → chatgpt_accounts.id
- slot_number   Int       (1-4)
- is_occupied   Boolean   @default(false)
- order_id      String?   → orders.id
- member_email  String?   (email customer yang di-invite)
- customer_name String?
- customer_wa   String?
- invited_at    DateTime?
- expired_at    DateTime?
- created_at    DateTime
- updated_at    DateTime
```

### 4.18 Tabel `payment_settings`
> Konfigurasi payment yang bisa diatur admin
```sql
- id                    String    @id @default("singleton")
- qris_image_path       String    @default("/uploads/qrisrzdkstore.png")
- qris_is_active        Boolean   @default(true)
- gateway_is_active     Boolean   @default(false)
- gateway_provider      String?   (e.g. "Midtrans", "Xendit")
- gateway_api_key       String?   (encrypted)
- gateway_secret_key    String?   (encrypted)
- active_method         Enum      QRIS_ONLY | GATEWAY_ONLY | BOTH
- payment_timeout_hours Int       @default(24) (batas waktu upload bukti)
- updated_at            DateTime
```

### 4.19 Tabel `financial_summaries`
> Cache summary keuangan harian (untuk performa dashboard)
```sql
- id               String    @id
- date             DateTime  @unique (per hari)
- total_orders     Int
- completed_orders Int
- cancelled_orders Int
- gross_revenue    Int
- net_revenue      Int       (setelah diskon voucher)
- created_at       DateTime
- updated_at       DateTime
```

### Relasi Antar Tabel (ERD Summary)
```
users ──────────────< orders >──────────── product_variants
                        │                        │
                        │                        ├── products ── categories
                        │                        └── product_stock_items
                        │
                        ├── order_fulfillments
                        ├── guarantees
                        └── notifications

netflix_accounts ──< netflix_slots >── orders
chatgpt_accounts ──< chatgpt_slots >── orders

vouchers ──< orders
announcements (target: all / product / category)
payment_settings (singleton config)
```

---


## 5. ROLE & HAK AKSES

### Role yang Ada
| Role | Deskripsi |
|---|---|
| `ADMIN` | Pemilik toko (Anda). Akses penuh ke semua fitur |
| `USER` | Customer yang sudah registrasi dan verifikasi email |

### Matriks Akses
| Halaman / Fitur | Public | USER | ADMIN |
|---|---|---|---|
| Landing Page | ✅ | ✅ | ✅ |
| Login / Register | ✅ | ✅ | ✅ |
| Katalog Produk (landing) | ✅ | ✅ | ✅ |
| Customer Dashboard | ❌ | ✅ | ✅ |
| Buat Order | ❌ | ✅ | ❌ |
| Upload Bukti Bayar | ❌ | ✅ | ❌ |
| Klaim Garansi | ❌ | ✅ | ❌ |
| Admin Panel | ❌ | ❌ | ✅ |
| Manage Produk | ❌ | ❌ | ✅ |
| ACC / Reject Order | ❌ | ❌ | ✅ |
| Manage Netflix/ChatGPT Slots | ❌ | ❌ | ✅ |
| Laporan Keuangan | ❌ | ❌ | ✅ |
| Manage Voucher | ❌ | ❌ | ✅ |
| Kirim Announcement | ❌ | ❌ | ✅ |
| Pengaturan Payment | ❌ | ❌ | ✅ |

---

## 6. ALUR SISTEM LENGKAP

### 6.1 Alur Registrasi & Login
```
[REGISTRASI]
Customer isi form (username, email, password, nama lengkap, no WA)
  → Sistem kirim email verifikasi (link token, expired 24 jam)
  → Customer klik link di email
  → Akun aktif, redirect ke /login
  → Login dengan username + password
  → Redirect ke /dashboard

[LOGIN]
Isi username + password
  → NextAuth validasi
  → Jika email belum verified → tampilkan pesan + tombol kirim ulang email
  → Jika valid → session dibuat → redirect /dashboard

[LUPA PASSWORD]
Isi email → sistem kirim link reset password (expired 1 jam)
  → Customer klik link → isi password baru → redirect /login
```

### 6.2 Alur Order Lengkap (6 Fase)
```
FASE 1 — CUSTOMER BUAT ORDER
  Customer buka /dashboard/produk
  → Pilih produk & varian
  → Isi form data tambahan jika diperlukan (khusus Netflix: device detail, kota login)
  → Terapkan kode voucher (opsional)
  → Submit order
  → Status: PENDING_REVIEW
  → Notifikasi masuk ke Admin Panel
  → Customer lihat status "Menunggu Konfirmasi Admin"

FASE 2 — ADMIN REVIEW STOK
  Admin dapat notifikasi order baru di panel
  → Admin cek ketersediaan stok / slot
  → [ACC] → Status: APPROVED → Customer dapat notifikasi + info QRIS muncul
  → [REJECT] → Status: REJECTED → Customer dapat notifikasi + alasan penolakan
  → Customer lihat status "Order Disetujui, Silakan Lakukan Pembayaran"

FASE 3 — CUSTOMER BAYAR
  Customer melihat halaman pembayaran dengan:
    - QR Code QRIS (gambar qrisrzdkstore.png)
    - Nominal yang harus dibayar (dengan kode unik 3 digit di belakang jika perlu)
    - Batas waktu pembayaran (countdown timer, default 24 jam)
    - Form upload bukti transfer
  → Customer transfer → upload bukti (jpg/png/pdf, max 5MB)
  → Status: PAYMENT_UPLOADED
  → Notifikasi ke Admin

FASE 4 — ADMIN VERIFIKASI PEMBAYARAN
  Admin lihat bukti transfer di panel
  → [Verifikasi] → Status: PAYMENT_VERIFIED → lanjut ke fulfillment
  → [Tolak] → Status kembali ke APPROVED, customer diminta upload ulang
    dengan keterangan alasan

FASE 5 — FULFILLMENT PRODUK
  [Tipe AUTO]
    Sistem otomatis ambil 1 item dari product_stock_items
    → Status: COMPLETED
    → Info produk langsung tampil di dashboard customer
    → Email + push notification terkirim ke customer

  [Tipe MANUAL]
    Status: PROCESSING
    → Admin mendapat notifikasi untuk proses manual
    → Admin input info akun/instruksi di panel
    → Kirim ke customer via sistem (tersimpan di order_fulfillments)
    → Status: COMPLETED

  [Tipe SLOT - Netflix/ChatGPT]
    Status: PROCESSING
    → Admin assign slot yang kosong ke order ini di panel
    → Untuk Netflix: admin pilih akun head & nomor profil yang kosong
    → Untuk ChatGPT: admin pilih akun head & nomor slot member
    → Sistem catat detail slot + data customer
    → Status: COMPLETED
    → Customer lihat info di dashboard

FASE 6 — ORDER SELESAI
  Customer menerima notifikasi order selesai
  → Dashboard customer menampilkan:
    - Detail info produk/akun
    - Tanggal mulai & expired
    - Tombol "Klaim Garansi" (aktif selama masa garansi)
  → Admin dashboard: order tercatat di laporan keuangan
```

### 6.3 Alur Klaim Garansi
```
Customer buka order yang bermasalah → klik "Klaim Garansi"
  → Sistem cek: apakah masih dalam masa garansi? (guarantee_valid_until)
  → Jika sudah expired → tampilkan pesan masa garansi habis
  → Jika masih aktif → tampilkan form klaim:
    - Deskripsi masalah (wajib)
    - Upload screenshot bukti masalah (opsional)
  → Submit → Status: OPEN
  → Notifikasi ke Admin

Admin terima klaim di panel /admin/garansi
  → Admin review
  → [Approve] → Admin proses (extend masa aktif / replace akun) → Status: RESOLVED
  → [Reject] → Isi alasan → Status: REJECTED
  → Customer mendapat notifikasi hasil klaim
```

---

## 7. FITUR DETAIL — LANDING PAGE

### Struktur Halaman (Urut dari Atas)

**7.1 Navbar**
- Logo + nama toko (rzdkstore)
- Menu: Beranda, Produk, Cara Order, FAQ
- Tombol: Login | Daftar

**7.2 Hero Section**
- Headline besar: "Langganan Premium, Harga Terjangkau"
- Subheadline: value proposition singkat
- 2 CTA Button: "Lihat Produk" (scroll ke katalog) & "Daftar Sekarang" (→ /register)
- Background: dark dengan aksen hijau, mungkin subtle grid pattern
- Badge trust: "100+ Produk Digital", "Proses Cepat", "Bergaransi"

**7.3 Kategori Produk**
- Grid kategori dengan icon/emoji
- Klik kategori → filter produk di bawah

**7.4 Katalog Produk (Preview)**
- Card produk dengan logo, nama, harga mulai dari...
- Badge "Stok Ada" / "Habis"
- Klik card → modal detail varian & harga
- Jika belum login: tombol "Login untuk Order"
- Jika sudah login: tombol "Pesan Sekarang" → redirect /dashboard/produk

**7.5 Cara Order**
- 4 langkah visual:
  1. Daftar & Verifikasi Akun
  2. Pilih Produk & Varian
  3. Bayar via QRIS
  4. Terima Info Produk di Dashboard

**7.6 Keunggulan**
- Harga terjangkau, proses cepat, bergaransi, 24/7 panel

**7.7 FAQ**
- Accordion Q&A yang paling sering ditanyakan

**7.8 Footer**
- Logo, deskripsi singkat
- Kontak: tombol WhatsApp (085111642004)
- Link: Kebijakan, Syarat & Ketentuan
- Copyright

---

## 8. FITUR DETAIL — AUTH SYSTEM

### Halaman Login (`/login`)
- Input: Username + Password
- Link: "Lupa Password?" → /forgot-password
- Link: "Belum punya akun? Daftar" → /register
- Validasi: frontend (Zod) + backend
- Error handling: username tidak ditemukan, password salah, email belum verified

### Halaman Register (`/register`)
- Input: Nama Lengkap, Username, Email, No. WhatsApp, Password, Konfirmasi Password
- Validasi real-time (username tersedia?, email valid?, password match?)
- Submit → sistem kirim email verifikasi
- Redirect ke halaman "Cek email Anda untuk verifikasi"

### Email Verifikasi
- Template email branded (tema hitam-hijau)
- Link token (expired 24 jam)
- Tombol "Kirim Ulang Email" jika belum dapat
- Setelah klik link → akun aktif → redirect /login dengan notif sukses

### Lupa Password
- Input email → kirim link reset (expired 1 jam)
- Halaman reset: input password baru + konfirmasi
- Setelah sukses → redirect /login

---

## 9. FITUR DETAIL — CUSTOMER DASHBOARD

### Layout
- Sidebar kiri (desktop) / bottom nav (mobile)
- Header: nama user, avatar, notifikasi bell, tombol logout

### 9.1 Halaman Utama Dashboard (`/dashboard`)
- Greeting: "Halo, [Nama]! 👋"
- Summary card:
  - Total Order
  - Order Aktif (produk yang masih dalam masa aktif)
  - Klaim Garansi Tersedia
- Produk Aktif saat ini (list singkat dengan expired countdown)
- Transaksi terbaru (5 terakhir)
- Announcement terbaru yang relevan

### 9.2 Katalog Produk (`/dashboard/produk`)
- Sama seperti di landing page tapi dengan tombol order langsung
- Filter: Kategori, Harga, Nama
- Search produk
- Modal order: pilih varian, input data tambahan (jika perlu), kode voucher, summary harga
- Tombol "Buat Order"

### 9.3 Riwayat Transaksi (`/dashboard/transaksi`)
- Tabel semua order dengan kolom: No. Order, Produk, Varian, Harga, Tanggal, Status
- Filter: Status, Tanggal, Produk
- Klik order → halaman detail order:
  - Semua info order
  - Status tracker (visual step-by-step)
  - Jika status APPROVED: tampilkan info QRIS + form upload bukti
  - Jika status COMPLETED: tampilkan info produk yang diterima
  - Tombol klaim garansi (jika eligible)

### 9.4 Akun Aktif (`/dashboard/akun-aktif`)
- List semua produk yang masih aktif (status COMPLETED dan expired_at > hari ini)
- Card per produk: nama produk, varian, tanggal mulai, tanggal expired, sisa hari
- Countdown timer berwarna: hijau (>7 hari), kuning (3-7 hari), merah (<3 hari)
- Klik → lihat detail info akun/produk yang diterima
- Tombol klaim garansi per produk (jika masih dalam masa garansi)

### 9.5 Klaim Garansi (`/dashboard/garansi`)
- Tab: "Buat Klaim Baru" | "Riwayat Klaim"
- Form buat klaim: pilih order (dropdown order eligible), deskripsi, upload screenshot
- Riwayat klaim: tabel dengan status & keterangan dari admin

### 9.6 Notifikasi (`/dashboard/notifikasi`)
- List semua notifikasi (order, payment, fulfillment, announcement, system)
- Filter per tipe
- Mark as read (semua / satu per satu)
- Detail announcement dengan konten lengkap

### 9.7 Profil (`/dashboard/profil`)
- Edit: Nama Lengkap, No. WhatsApp
- Ganti Password (input password lama + baru)
- Pengaturan notifikasi: toggle push notification, toggle email notification
- Tombol "Izinkan Notifikasi Browser" jika belum

---

## 10. FITUR DETAIL — ADMIN PANEL

### Layout
- Sidebar kiri dengan semua menu admin
- Header: info admin, notifikasi, logout

### 10.1 Dashboard Admin (`/admin`)
- Ringkasan hari ini: Total Order Masuk, Menunggu Review, Menunggu Verifikasi Bayar, Selesai
- Grafik pendapatan: harian (7 hari terakhir) & bulanan (12 bulan terakhir) — Recharts
- Total pendapatan bulan ini vs bulan lalu
- Order terbaru (live, real-time update atau auto-refresh tiap 30 detik)
- Klaim garansi yang belum ditangani
- Stok produk AUTO yang hampir habis (alert)
- Slot Netflix & ChatGPT yang hampir penuh

### 10.2 Manajemen Transaksi (`/admin/transaksi`)
- Tabel semua order dengan filter: Status, Tanggal, Produk, Customer
- Search by No. Order / nama customer
- Aksi per order:
  - **PENDING_REVIEW**: tombol ACC ✅ atau REJECT ❌ + alasan
  - **PAYMENT_UPLOADED**: tombol Verifikasi ✅ atau Minta Upload Ulang
  - **PROCESSING**: form input info fulfillment (untuk tipe MANUAL)
  - **COMPLETED/REJECTED**: hanya view
- Export data ke CSV/Excel

### 10.3 Manajemen Produk (`/admin/produk`)
- List semua produk dengan kategori
- CRUD Kategori
- CRUD Produk:
  - Nama, kategori, logo upload, deskripsi, tipe fulfill, status aktif, sort order
  - Tombol manage varian
- CRUD Varian per produk:
  - Nama varian, harga, durasi (hari), stok, is_unlimited, status aktif, hari garansi, catatan
- Untuk produk tipe AUTO: sub-panel "Kelola Stok Digital"
  - Input stok baru: textarea (satu item per baris atau JSON) → bulk import
  - List stok yang ada (tersedia / sudah terpakai)
  - Hapus stok item

### 10.4 Manajemen Customer (`/admin/customers`)
- Tabel semua customer
- Search & filter
- Klik customer → profil lengkap:
  - Data akun
  - Riwayat order
  - Produk aktif saat ini
  - Riwayat klaim garansi
- Aksi: Suspend akun / Aktifkan kembali
- Reset email verifikasi (kirim ulang)

### 10.5 Panel Slot Netflix (`/admin/netflix`)
- List semua akun head Netflix (tambah/edit/hapus akun)
- Per akun: tampilkan 5 slot profil
- Visual slot: hijau = kosong, merah = terisi + info customer + expired countdown
- Tombol per slot:
  - Assign slot ke order (jika status PROCESSING)
  - Edit detail slot (device, kota, dll.)
  - Hapus / kosongkan slot (jika expired manual)
- Filter: tampilkan slot yang akan expired dalam X hari (untuk proaktif perpanjangan)
- Export data slot ke CSV

### 10.6 Panel Slot ChatGPT (`/admin/chatgpt`)
- List semua akun head ChatGPT Business
- Per akun: tampilkan 4 slot member
- Visual slot: tersedia / terisi + email customer + expired countdown
- Assign slot ke order
- Edit email member, tanggal expired
- Filter slot hampir expired

### 10.7 Laporan Keuangan (`/admin/keuangan`)
- Tab: Harian | Bulanan | Kustom Range
- Tabel & grafik: total order, total pendapatan, total diskon voucher, pendapatan bersih
- Breakdown per produk: produk terlaris, pendapatan per kategori
- Filter bulan/tahun
- Export PDF / CSV

### 10.8 Manajemen Voucher (`/admin/voucher`)
- Tabel semua voucher (aktif / kedaluwarsa)
- CRUD Voucher:
  - Kode (auto-generate atau manual)
  - Tipe diskon: persentase atau nominal tetap
  - Nilai diskon, minimum pembelian, maksimum diskon (untuk %)
  - Batas penggunaan total, masa berlaku
  - Target: semua produk / produk tertentu / kategori tertentu
- Monitor: berapa kali digunakan, total nilai diskon yang diberikan

### 10.9 Manajemen Announcement (`/admin/announcement`)
- CRUD Announcement
- Target: Semua customer | Customer dengan produk tertentu | Customer dengan kategori tertentu
- Tipe: INFO / WARNING / MAINTENANCE / PROMO (beda warna di UI)
- Jadwal publish & expired
- Preview tampilan sebelum publish
- Setelah publish: sistem otomatis kirim push notification + email ke target customer

### 10.10 Manajemen Garansi (`/admin/garansi`)
- Tabel semua klaim (filter: status, produk, tanggal)
- Klik klaim → detail:
  - Info order, info customer, deskripsi masalah, screenshot
  - Tombol: Approve (+ input tindakan: extend expired / replace akun) | Reject (+ alasan)
  - Catatan internal admin
- Notifikasi otomatis ke customer setelah aksi admin

### 10.11 Pengaturan Payment (`/admin/payment-settings`)
- Toggle aktif/nonaktif QRIS Statis
- Upload gambar QRIS baru (replace qrisrzdkstore.png)
- Toggle aktif/nonaktif Payment Gateway
- Input konfigurasi gateway: provider, API key, secret key
- Pilihan active method: QRIS saja / Gateway saja / Keduanya (customer bisa pilih)
- Batas waktu pembayaran (jam)
- Preview tampilan halaman payment seperti yang dilihat customer

### 10.12 Pengaturan Umum (`/admin/pengaturan`)
- Info toko: nama, deskripsi, logo, nomor WA
- Pengaturan email: SMTP config (host, port, user, password), template test send
- Pengaturan notifikasi: VAPID keys untuk Web Push
- Maintenance mode: on/off (tampilkan halaman under maintenance ke customer)
- Backup database manual (export SQL)

---


## 11. SISTEM PRODUK & TIPE FULFILLMENT

### Tipe A — AUTO FULFILL
**Karakteristik:**
- Stok digital sudah diinput admin sebelumnya (berupa kode/info akun)
- Setelah admin verifikasi pembayaran, sistem **otomatis** mengambil 1 item stok dan mengirimkannya ke customer
- Admin tidak perlu intervensi di fase fulfillment

**Contoh Produk:**
- Capcut Pro (akun sharing yang admin miliki)
- Voucher/kode redeem yang sudah dibeli admin dari supplier
- Produk dengan stok kode digital yang sudah tersedia

**Flow Stok:**
```
Admin input stok baru → product_stock_items (is_used: false)
Order COMPLETED → sistem ambil item pertama yang is_used = false
→ item di-mark is_used = true, order_id diisi
→ konten item di-copy ke order_fulfillments → tampil ke customer
```

### Tipe B — MANUAL FULFILL
**Karakteristik:**
- Tidak ada stok yang pre-input di sistem
- Setelah pembayaran verified, admin dinotifikasi untuk proses manual
- Admin input info akun/instruksi langsung di panel dan "kirim" ke customer

**Contoh Produk:**
- Semua produk yang sifatnya invite (Canva Pro, Apple Music invite, ChatGPT invite, dll.)
- Produk resell dari supplier yang prosesnya bergantung supplier
- Produk yang memerlukan proses dari pihak ketiga

**Flow:**
```
Pembayaran verified → Status: PROCESSING → notif ke admin
Admin buka panel → order tab PROCESSING → klik "Isi & Kirim Info Produk"
→ Admin ketik/paste info akun di textarea → Submit
→ Tersimpan di order_fulfillments → Status: COMPLETED → notif ke customer
```

### Tipe C — SLOT SYSTEM
**Karakteristik:**
- Khusus untuk Netflix dan ChatGPT
- Ada data akun head yang dikelola admin
- Setiap order akan di-assign ke slot tertentu
- Monitoring slot tersedia secara visual

**Lihat detail di Section 12 & 13.**

### Logika Stok & Unlimited
```
is_unlimited = true  → produk ini tidak punya stok terbatas
                       (resell manual, stok ada di supplier)
                       → admin tetap harus ACC order untuk cek ke supplier

is_unlimited = false → stok terbatas, dihitung dari:
                       - product_stock_items yang tersedia (tipe AUTO)
                       - Slot kosong yang ada (tipe SLOT)
                       - Nilai manual yang diset admin (tipe MANUAL)

Jika stok = 0 dan is_unlimited = false:
  → Badge "Stok Habis" di landing page & dashboard
  → Customer tidak bisa buat order
```

---

## 12. SISTEM SLOT NETFLIX

### Struktur Data
```
Netflix Head Account #1 (email: xxxxx@gmail.com)
├── Slot/Profil 1: [KOSONG]
├── Slot/Profil 2: [TERISI]
│   ├── Customer: Budi Santoso
│   ├── WA: 08xxxxxxxxxx
│   ├── Order ID: ORD-20260515-0023
│   ├── Device Brand: Samsung
│   ├── Device Model: Galaxy S23 Ultra
│   ├── Device Type: Smartphone
│   ├── Device OS: Android 14
│   ├── Login City: Surabaya
│   ├── Started: 01 Mei 2026
│   └── Expired: 01 Jun 2026 (sisa 17 hari)
├── Slot/Profil 3: [TERISI] ...
├── Slot/Profil 4: [KOSONG]
└── Slot/Profil 5: [TERISI] ...
```

### Data Device yang Wajib Diisi Customer Saat Order
Form tambahan saat customer order Netflix:
1. **Merek Perangkat** — text input (e.g. Samsung, Apple, LG, Sony, Xiaomi, dll.)
2. **Model Perangkat** — text input (e.g. Galaxy S23, iPhone 15, Bravia X90L)
3. **Tipe Perangkat** — dropdown: Smartphone / Tablet / Smart TV / Laptop/PC / Firestick / Chromecast / Lainnya
4. **Sistem Operasi** — text input (e.g. Android 14, iOS 17, webOS 6, Windows 11)
5. **Kota/Kabupaten Login** — text input (level kota/kabupaten)

### Flow Admin Assign Slot Netflix
```
Order Netflix masuk → Admin ACC (fase review)
→ Customer bayar → Admin verify payment
→ Status: PROCESSING
→ Admin buka /admin/netflix
→ Pilih akun head yang punya slot kosong
→ Klik "Assign ke Slot X" → sistem auto-link order ke slot
→ Admin set profile_name, konfirmasi data device (dari data order customer)
→ expired_at otomatis dikalkulasi dari completed_at + duration_days
→ Status: COMPLETED
→ Customer lihat di /dashboard/akun-aktif:
   Info yang tampil: Nama profil, info akun Netflix (dari fulfillment), masa aktif
```

### Monitoring & Alert
- Dashboard admin: slot yang expired dalam 7 hari ke depan → highlight merah
- Slot yang expired otomatis → status berubah "Perlu Perpanjangan"
- Admin bisa filter: "Semua Slot Expired Hari Ini/Minggu Ini"

---

## 13. SISTEM SLOT CHATGPT BUSINESS

### Struktur Data
```
ChatGPT Business Head #1 (email: xxxxx@gmail.com, 4 member slots)
├── Member Slot 1: [TERISI]
│   ├── Customer: Rina Wijaya
│   ├── Member Email: rinawijaya@gmail.com
│   ├── WA: 08xxxxxxxxxx
│   ├── Order ID: ORD-20260510-0019
│   ├── Invited At: 10 Mei 2026
│   └── Expired: 10 Jun 2026 (sisa 26 hari)
├── Member Slot 2: [KOSONG]
├── Member Slot 3: [TERISI] ...
└── Member Slot 4: [KOSONG]
```

### Data yang Diisi Customer Saat Order ChatGPT
Form tambahan:
1. **Email yang akan di-invite** — email input (wajib, ini yang akan diinvite ke workspace ChatGPT Business)

### Flow Admin Assign Slot ChatGPT
```
Order ChatGPT masuk → Admin ACC → Customer bayar → Verified
→ Status: PROCESSING
→ Admin buka /admin/chatgpt
→ Pilih akun head yang punya slot kosong
→ Klik "Assign Slot" → sistem link order ke slot
→ Admin set member_email (dari data order customer)
→ Admin invite email tersebut secara manual di ChatGPT workspace
→ Admin confirm di panel: "Invite Terkirim"
→ expired_at otomatis dikalkulasi
→ Status: COMPLETED
→ Customer lihat di dashboard: instruksi cara join + masa aktif
```

### Catatan Otomasi Masa Depan
- Saat ini: admin invite manual di ChatGPT workspace
- Prospek: jika ChatGPT Business membuka API, bisa diintegrasikan untuk invite otomatis

---

## 14. SISTEM PAYMENT

### 14.1 QRIS Statis (Default & Utama)
```
Cara Kerja:
- Admin upload gambar QRIS statis (qrisrzdkstore.png) via panel
- Semua order menggunakan QR yang sama
- Customer scan → transfer nominal sesuai tagihan
- Customer upload bukti transfer di halaman order
- Admin verifikasi manual di panel
```

**Halaman Payment Customer:**
- Gambar QRIS besar & jelas
- Nominal yang harus dibayar (bold, besar)
- Catatan: "Transfer tepat sesuai nominal"
- Countdown timer batas waktu pembayaran
- Form upload bukti (drag & drop atau klik)
- Tombol "Sudah Transfer, Upload Bukti"
- Info: "Jika ada kendala, hubungi WA: 085111642004"

### 14.2 Payment Gateway (Opsional, Konfigurasi Admin)
```
Cara Kerja:
- Admin aktifkan gateway di /admin/payment-settings
- Input API key & secret key provider (Midtrans/Xendit/dll.)
- Customer bisa pilih: QRIS Gateway (real-time verified) atau transfer manual
- QRIS Gateway: verifikasi otomatis via webhook
- Jika gateway error → admin bisa switch ke QRIS manual di panel tanpa sentuh kode
```

**Logika Switch Payment:**
```javascript
// Di pengaturan: active_method dapat diubah kapan saja oleh admin
if (active_method === 'QRIS_ONLY')     → hanya tampilkan QRIS statis
if (active_method === 'GATEWAY_ONLY')  → hanya tampilkan payment gateway
if (active_method === 'BOTH')          → customer bisa pilih salah satu
```

### 14.3 Timeout & Pembatalan Otomatis
- Jika customer tidak upload bukti dalam batas waktu (default: 24 jam)
- Sistem otomatis ubah status ke CANCELLED
- Customer dinotifikasi via push/email
- Customer bisa buat order baru

---

## 15. SISTEM GARANSI

### Konsep Dasar
- Setiap varian produk memiliki field `guarantee_days`
- `guarantee_days = null` → **Full Garansi**: garansi berlaku selama durasi produk aktif
- `guarantee_days = 7` → Garansi hanya 7 hari sejak tanggal order, meskipun produk aktif 30 hari

### Kalkulasi
```
guarantee_valid_until = order.completed_at + (
  variant.guarantee_days ?? variant.duration_days
) days
```

### Contoh Kasus
| Produk | Durasi | Hari Garansi | Garansi Berlaku Sampai |
|---|---|---|---|
| Netflix Sharing 1 Bulan | 30 hari | null (full) | 30 hari sejak aktif |
| YouTube Premium 44 Hari (No Garansi) | 44 hari | 0 | Tidak ada garansi |
| Capcut Pro Sharing 1 Bulan | 30 hari | 7 | 7 hari sejak aktif |
| Viu Private 1 Bulan | 30 hari | null (full) | 30 hari sejak aktif |

### Setting Garansi di Admin Panel
- Masuk ke /admin/produk → edit varian
- Field "Hari Garansi":
  - Kosongkan (null) → Full Garansi
  - Isi "0" → Tidak ada garansi
  - Isi "7" → Garansi 7 hari sejak aktif
- Perubahan berlaku untuk order **baru** setelah perubahan disimpan

### Tindakan Admin Saat Approve Klaim
1. **Extend Expired** — admin extend tanggal expired di slot/order
2. **Replace Akun** — admin kirim info akun baru via form fulfillment
3. **Refund** — admin ubah status ke REFUNDED (untuk tracking, proses refund manual)

---

## 16. SISTEM VOUCHER & DISKON

### Tipe Voucher
| Tipe | Deskripsi | Contoh |
|---|---|---|
| `PERCENTAGE` | Diskon persentase dari total | 20% off, max Rp 10.000 |
| `FIXED` | Diskon nominal tetap | Potongan Rp 5.000 |

### Logika Penerapan
```
1. Customer input kode voucher di form order
2. Sistem validasi:
   - Kode ada dan aktif?
   - Belum expired?
   - Belum mencapai batas penggunaan?
   - Memenuhi minimum pembelian?
   - Berlaku untuk produk/kategori yang dipesan?
3. Jika valid → tampilkan preview diskon
4. Submit order → diskon tercatat di order.discount_amount
```

### Target Voucher
- `ALL` → berlaku untuk semua produk
- `SPECIFIC_PRODUCT` → hanya untuk produk tertentu (array product_id)
- `SPECIFIC_CATEGORY` → hanya untuk kategori tertentu

---

## 17. SISTEM ANNOUNCEMENT

### Konsep
Admin dapat membuat pengumuman yang hanya diterima oleh customer yang **pernah membeli produk/kategori tertentu** (setidaknya 1 order dengan status COMPLETED).

### Contoh Use Case
- "Maintenance akun Netflix 12-15 Juni" → hanya customer yang pernah beli Netflix
- "Harga Spotify naik mulai Juli" → hanya customer yang pernah beli Spotify
- "Promo spesial semua produk" → semua customer
- "Tips penggunaan ChatGPT" → hanya customer ChatGPT

### Filter Target Customer
```
Target = SPECIFIC_PRODUCT (Netflix):
  → Ambil semua user yang punya order dengan:
     variant.product_id IN [netflix_product_id]
     AND order.status = COMPLETED

Target = ALL:
  → Semua user yang terdaftar & email verified
```

### Delivery Channel
1. **In-App Notification** — masuk ke tabel `notifications`, tampil di /dashboard/notifikasi
2. **Push Notification** — Web Push ke browser yang sudah subscribe
3. **Email** — Fallback otomatis jika user belum subscribe push, ATAU bisa dikonfigurasi untuk selalu kirim email juga
4. **PWA Badge** — Badge angka di icon app saat di-install ke homescreen

---

## 18. SISTEM NOTIFIKASI (PWA + EMAIL)

### PWA — Progressive Web App

**Instalasi ke Homescreen:**
- Manifest.json dengan icon, theme_color (#171717), background_color (#171717)
- Service worker via next-pwa
- Banner "Tambahkan ke Layar Utama" muncul otomatis atau via tombol di dashboard
- Setelah install: icon app dengan badge notifikasi di homescreen

**Push Notification Setup:**
```
1. Saat customer login pertama kali → tampilkan dialog permission
   "Izinkan notifikasi agar kamu tidak ketinggalan update order"
2. Jika user klik "Izinkan" → browser minta permission
3. Jika granted → simpan subscription (endpoint + keys) ke users.push_endpoint & push_keys
4. Jika denied → fallback ke email otomatis
```

**Trigger Push Notification (server-side):**
```
- Order baru dibuat (ke admin)
- Order di-ACC admin (ke customer)
- Order di-reject admin (ke customer)
- Bukti bayar diterima (ke admin)
- Pembayaran diverifikasi (ke customer)
- Order selesai / produk terkirim (ke customer)
- Klaim garansi masuk (ke admin)
- Klaim garansi diproses (ke customer)
- Announcement baru yang relevan (ke customer)
- Produk hampir expired (ke customer, H-3 dan H-1)
```

### Email Notification

**Trigger Email:**
- Sama seperti push notification, dikirim sebagai fallback ATAU bersamaan
- Email verifikasi akun
- Reset password
- Announcement (selalu kirim email, push hanya bonus)

**Template Email:**
- HTML template branded (logo, warna tema hitam-hijau)
- Responsive untuk mobile
- Footer: unsubscribe link, kontak WA

### Logika Fallback
```javascript
async function sendNotification(userId, payload) {
  const user = await getUserById(userId)

  // Selalu simpan ke tabel notifications (in-app)
  await createInAppNotification(userId, payload)

  // Coba kirim push jika ada subscription
  if (user.push_subscribed && user.push_endpoint) {
    try {
      await sendWebPush(user.push_endpoint, user.push_keys, payload)
    } catch (err) {
      // Push gagal → fallback ke email
      await sendEmail(user.email, payload)
    }
  } else {
    // Tidak ada push subscription → kirim email
    await sendEmail(user.email, payload)
  }
}
```

---

## 19. STRUKTUR FOLDER PROJECT

```
rzdkstore/
├── prisma/
│   ├── schema.prisma          ← definisi semua tabel
│   └── migrations/            ← migration files
│
├── public/
│   ├── uploads/
│   │   ├── qrisrzdkstore.png  ← QRIS statis (upload manual admin)
│   │   ├── payment-proofs/    ← bukti transfer customer
│   │   └── guarantee/         ← screenshot klaim garansi
│   ├── logos/                 ← logo produk
│   ├── icons/                 ← PWA icons (192x192, 512x512)
│   └── manifest.json          ← PWA manifest
│
├── src/
│   ├── app/                   ← Next.js App Router
│   │   ├── (public)/          ← route group: public pages
│   │   │   ├── page.tsx       ← Landing Page
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── dashboard/         ← Customer Panel (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── produk/
│   │   │   ├── transaksi/
│   │   │   │   └── [id]/
│   │   │   ├── akun-aktif/
│   │   │   ├── garansi/
│   │   │   ├── notifikasi/
│   │   │   └── profil/
│   │   │
│   │   ├── admin/             ← Admin Panel (protected, role: ADMIN)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── transaksi/
│   │   │   ├── produk/
│   │   │   ├── customers/
│   │   │   ├── netflix/
│   │   │   ├── chatgpt/
│   │   │   ├── keuangan/
│   │   │   ├── voucher/
│   │   │   ├── announcement/
│   │   │   ├── garansi/
│   │   │   ├── payment-settings/
│   │   │   └── pengaturan/
│   │   │
│   │   └── api/               ← API Routes
│   │       ├── auth/          ← NextAuth endpoints
│   │       ├── orders/
│   │       ├── products/
│   │       ├── admin/
│   │       ├── notifications/
│   │       ├── upload/
│   │       └── webhooks/      ← Payment gateway webhooks
│   │
│   ├── components/
│   │   ├── ui/                ← shadcn/ui base components
│   │   ├── layout/            ← Navbar, Sidebar, Footer
│   │   ├── landing/           ← Komponen landing page
│   │   ├── dashboard/         ← Komponen customer dashboard
│   │   ├── admin/             ← Komponen admin panel
│   │   ├── forms/             ← Form components
│   │   └── shared/            ← Komponen reusable
│   │
│   ├── lib/
│   │   ├── prisma.ts          ← Prisma client singleton
│   │   ├── auth.ts            ← NextAuth config
│   │   ├── email.ts           ← Nodemailer config & templates
│   │   ├── push.ts            ← Web Push config & sender
│   │   ├── notifications.ts   ← Notification dispatcher (push + email fallback)
│   │   ├── encryption.ts      ← Enkripsi data sensitif (akun, kode)
│   │   └── utils.ts           ← Helper functions
│   │
│   ├── hooks/                 ← Custom React hooks
│   ├── stores/                ← Zustand stores
│   ├── types/                 ← TypeScript type definitions
│   └── middleware.ts          ← Auth middleware (protect routes)
│
├── .env                       ← Environment variables (tidak di-commit)
├── .env.example               ← Template env variables
├── next.config.js
├── tailwind.config.js
├── prisma/
└── package.json
```

---

## 20. DESAIN SYSTEM & TEMA

### Palet Warna
```css
/* Primary Colors */
--color-bg-primary:    #171717;  /* Background utama */
--color-bg-secondary:  #2c2c2c;  /* Card, sidebar, modal */
--color-green-main:    #01a35a;  /* Tombol utama, badge aktif, highlight */
--color-green-accent:  #0edf7d;  /* Hover state, aksen, icon aktif */

/* Text Colors */
--color-text-primary:  #ffffff;  /* Teks utama */
--color-text-secondary:#a1a1aa;  /* Teks sekunder / placeholder */
--color-text-muted:    #71717a;  /* Teks lemah */

/* Status Colors */
--color-success:       #01a35a;
--color-warning:       #f59e0b;
--color-error:         #ef4444;
--color-info:          #3b82f6;

/* Border */
--color-border:        #3f3f46;  /* Border card dan input */
```

### Tipografi
```css
/* Headings — Poppins */
h1: Poppins 700, 2.25rem (36px)
h2: Poppins 600, 1.875rem (30px)
h3: Poppins 600, 1.5rem (24px)
h4: Poppins 500, 1.25rem (20px)

/* Body — Inter */
body:      Inter 400, 1rem (16px)
body-sm:   Inter 400, 0.875rem (14px)
body-xs:   Inter 400, 0.75rem (12px)
label:     Inter 500, 0.875rem (14px)
```

### Komponen UI Utama
| Komponen | Spesifikasi |
|---|---|
| Button Primary | bg #01a35a, hover #0edf7d, text white, rounded-lg |
| Button Secondary | border #3f3f46, bg transparent, hover bg #2c2c2c |
| Button Danger | bg #ef4444, hover #dc2626 |
| Card | bg #2c2c2c, border #3f3f46, rounded-xl, shadow-lg |
| Input | bg #171717, border #3f3f46, focus border #01a35a, text white |
| Badge Aktif | bg #01a35a/20, text #0edf7d, rounded-full |
| Badge Habis | bg #ef4444/20, text #ef4444 |
| Sidebar | bg #2c2c2c, active item: bg #01a35a/20, text #0edf7d |

### Tailwind Config (Excerpt)
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#01a35a',
        hover:   '#0edf7d',
      },
      dark: {
        DEFAULT: '#171717',
        card:    '#2c2c2c',
        border:  '#3f3f46',
      }
    },
    fontFamily: {
      heading: ['Poppins', 'sans-serif'],
      body:    ['Inter', 'sans-serif'],
    }
  }
}
```

---


## 21. FASE PENGERJAAN BERTAHAP

> Prinsip: **Quality over Speed**. Setiap fase harus selesai, berjalan, dan diuji sebelum lanjut ke fase berikutnya. Tidak ada yang di-skip.

---

### FASE 1 — Fondasi Project
**Estimasi: Tahap Awal**
**Output: Project berjalan, database terhubung, routing dasar tersedia**

- [ ] Init project Next.js 14 dengan TypeScript
- [ ] Setup Tailwind CSS + konfigurasi tema custom (warna & font)
- [ ] Setup shadcn/ui dengan tema dark
- [ ] Setup Prisma + koneksi MySQL
- [ ] Definisi schema Prisma lengkap (semua tabel dari Section 4)
- [ ] Jalankan migration awal
- [ ] Setup environment variables
- [ ] Setup ESLint + Prettier
- [ ] Struktur folder sesuai Section 19
- [ ] Halaman placeholder untuk semua route utama

---

### FASE 2 — Authentication System
**Output: Sistem login/register/verifikasi email berjalan penuh**

- [ ] Setup NextAuth.js v5 dengan credentials provider
- [ ] Implementasi register dengan validasi (Zod)
- [ ] Sistem kirim email verifikasi (Nodemailer)
- [ ] Halaman verifikasi email (klik link token)
- [ ] Implementasi login dengan session
- [ ] Middleware proteksi route (dashboard & admin)
- [ ] Halaman lupa password + reset password
- [ ] Redirect logic berdasarkan role (USER → /dashboard, ADMIN → /admin)
- [ ] Handling: email belum verified, akun suspended

---

### FASE 3 — Landing Page
**Output: Landing page publik yang lengkap dan profesional**

- [ ] Layout landing (Navbar, Footer)
- [ ] Hero Section
- [ ] Seksi kategori produk (data dari database)
- [ ] Katalog produk dengan card & modal detail varian/harga
- [ ] Seksi "Cara Order"
- [ ] Seksi "Keunggulan"
- [ ] FAQ accordion
- [ ] Responsif mobile/tablet/desktop
- [ ] SEO dasar (meta tags, Open Graph)

---

### FASE 4 — Manajemen Produk (Admin)
**Output: Admin bisa kelola kategori, produk, dan varian dari panel**

- [ ] Layout Admin Panel (sidebar, header)
- [ ] Dashboard Admin (placeholder stat cards)
- [ ] CRUD Kategori produk
- [ ] CRUD Produk (dengan upload logo)
- [ ] CRUD Varian produk (harga, durasi, stok, garansi)
- [ ] Kelola stok digital (produk tipe AUTO — input/hapus stok item)
- [ ] Toggle aktif/nonaktif produk & varian
- [ ] Preview produk dari sudut pandang customer

---

### FASE 5 — Sistem Order (Customer)
**Output: Customer bisa browse produk, buat order, dan tracking status**

- [ ] Layout Customer Dashboard (sidebar/bottom nav)
- [ ] Halaman katalog produk di dashboard
- [ ] Modal/form order dengan:
  - Pilih varian
  - Form data tambahan (Netflix: device + kota)
  - Form data tambahan (ChatGPT: email member)
  - Input kode voucher
  - Summary harga
- [ ] Submit order → status PENDING_REVIEW
- [ ] Halaman riwayat transaksi (tabel + filter)
- [ ] Halaman detail order dengan status tracker

---

### FASE 6 — Alur Order Admin (Review, Payment, Fulfillment)
**Output: Admin bisa proses order dari awal sampai selesai**

- [ ] Halaman manajemen transaksi admin
- [ ] Notifikasi order baru di admin panel (polling / refresh)
- [ ] Aksi ACC / Reject order (fase PENDING_REVIEW)
- [ ] Halaman payment customer (QRIS, countdown timer, form upload bukti)
- [ ] Aksi verifikasi / tolak bukti pembayaran
- [ ] Fulfillment tipe MANUAL (admin input & kirim info ke customer)
- [ ] Fulfillment tipe AUTO (otomatis dari stok digital)
- [ ] Dashboard customer: tampilkan info produk setelah COMPLETED
- [ ] Halaman "Akun Aktif" di dashboard customer

---

### FASE 7 — Sistem Slot Netflix & ChatGPT
**Output: Admin bisa manage slot dan assign ke order**

- [ ] CRUD akun head Netflix
- [ ] Visual panel slot Netflix (5 slot per akun)
- [ ] Assign slot ke order Netflix
- [ ] Form detail slot (device brand, model, type, OS, kota)
- [ ] CRUD akun head ChatGPT
- [ ] Visual panel slot ChatGPT (4 slot per akun)
- [ ] Assign slot ke order ChatGPT
- [ ] Alert slot hampir expired di admin dashboard
- [ ] Data slot tampil di akun aktif customer

---

### FASE 8 — Sistem Garansi
**Output: Customer bisa klaim garansi, admin bisa proses di panel**

- [ ] Kalkulasi guarantee_valid_until saat order COMPLETED
- [ ] Tombol klaim garansi (tampil hanya jika masih eligible)
- [ ] Form klaim garansi (deskripsi + upload screenshot)
- [ ] Halaman riwayat klaim customer
- [ ] Panel klaim garansi admin
- [ ] Aksi approve/reject klaim (dengan tindakan: extend / replace / refund)
- [ ] Notifikasi ke customer setelah admin aksi

---

### FASE 9 — Sistem Voucher
**Output: Admin bisa buat voucher, customer bisa pakai saat order**

- [ ] CRUD voucher di admin panel
- [ ] Generate kode otomatis atau manual
- [ ] Validasi voucher saat order (semua kondisi: expired, limit, min purchase, target)
- [ ] Preview diskon realtime di form order
- [ ] Tracking penggunaan voucher di admin

---

### FASE 10 — Sistem Notifikasi & PWA
**Output: Notifikasi in-app, push notification, email, dan app bisa di-install**

- [ ] Tabel notifications + in-app notification center
- [ ] Setup VAPID keys untuk Web Push
- [ ] Komponen "Izinkan Notifikasi" di dashboard
- [ ] Subscribe/unsubscribe push dari profil customer
- [ ] Server-side: kirim push notification ke subscriber
- [ ] Fallback: kirim email jika tidak subscribe push
- [ ] Trigger notifikasi di semua event order
- [ ] PWA: manifest.json + service worker (next-pwa)
- [ ] Icon PWA semua ukuran
- [ ] Badge notifikasi di PWA icon
- [ ] Halaman notifikasi customer (list, read, filter)

---

### FASE 11 — Sistem Announcement
**Output: Admin bisa kirim pengumuman tertarget ke customer spesifik**

- [ ] CRUD announcement di admin panel
- [ ] Logic filter target customer (all / produk / kategori)
- [ ] Preview target sebelum publish
- [ ] Dispatch notifikasi + email saat publish
- [ ] Announcement tampil di dashboard customer
- [ ] Announcement tampil di landing page (jika target ALL)

---

### FASE 12 — Dashboard Keuangan & Laporan
**Output: Admin punya visibility penuh atas keuangan toko**

- [ ] Grafik pendapatan harian (7 hari terakhir)
- [ ] Grafik pendapatan bulanan (12 bulan)
- [ ] Tabel laporan harian & bulanan
- [ ] Breakdown per produk / kategori
- [ ] Summary: total order, pendapatan, diskon voucher
- [ ] Export CSV/Excel
- [ ] Stat cards di admin dashboard (lengkap & real data)

---

### FASE 13 — Pengaturan Payment Gateway
**Output: Admin bisa switch antara QRIS manual dan payment gateway**

- [ ] Halaman pengaturan payment di admin
- [ ] Upload/update gambar QRIS
- [ ] Toggle QRIS aktif/nonaktif
- [ ] Form konfigurasi payment gateway (API key, dll.)
- [ ] Toggle gateway aktif/nonaktif
- [ ] Logic active_method di halaman payment customer
- [ ] Webhook handler untuk verifikasi otomatis dari gateway
- [ ] Preview halaman payment dari sudut pandang customer

---

### FASE 14 — Polish, Testing & Deployment
**Output: Aplikasi siap production di shared hosting**

- [ ] Review responsif semua halaman (mobile/tablet/desktop)
- [ ] Review dark theme konsistensi di semua halaman
- [ ] Loading states & skeleton screens
- [ ] Error handling & fallback UI
- [ ] Form validation messages yang jelas
- [ ] Empty states yang informatif
- [ ] Pengaturan umum admin (nama toko, SMTP, dll.)
- [ ] Maintenance mode
- [ ] Setup di shared hosting (Node.js process manager: PM2)
- [ ] Konfigurasi domain rzdkstore.my.id
- [ ] Setup database MySQL di hosting
- [ ] Environment variables production
- [ ] Build & deploy
- [ ] Smoke test semua alur utama

---

## 22. CATATAN DEPLOYMENT

### Shared Hosting Requirements
- Node.js 18+ tersedia di hosting
- MySQL 8.x database
- PM2 atau process manager untuk keep-alive Next.js
- Domain: rzdkstore.my.id sudah ada
- SSL/HTTPS sudah aktif (wajib untuk PWA & Web Push)

### Environment Variables yang Dibutuhkan
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/rzdkstore"

# NextAuth
NEXTAUTH_SECRET="[random secret]"
NEXTAUTH_URL="https://rzdkstore.my.id"

# Email (SMTP)
SMTP_HOST="mail.rzdkstore.my.id"
SMTP_PORT=465
SMTP_USER="noreply@rzdkstore.my.id"
SMTP_PASS="[email password]"
SMTP_FROM="rzdkstore <noreply@rzdkstore.my.id>"

# Web Push (VAPID)
VAPID_PUBLIC_KEY="[generated public key]"
VAPID_PRIVATE_KEY="[generated private key]"
VAPID_EMAIL="mailto:admin@rzdkstore.my.id"

# Payment Gateway (opsional, diisi jika diaktifkan)
PAYMENT_GATEWAY_API_KEY=""
PAYMENT_GATEWAY_SECRET_KEY=""

# Encryption (untuk data sensitif di DB)
ENCRYPTION_KEY="[32 char random string]"

# App
NEXT_PUBLIC_APP_URL="https://rzdkstore.my.id"
NEXT_PUBLIC_WA_NUMBER="6285111642004"
```

### Build & Start
```bash
npm install
npx prisma migrate deploy
npx prisma db seed       # (opsional: seed data awal)
npm run build
pm2 start npm --name "rzdkstore" -- start
```

---

## 📌 RINGKASAN KEPUTUSAN ARSITEKTUR

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 14 | Full-stack, 1 codebase, cocok shared hosting |
| Database | MySQL + Prisma | Familiar, phpMyAdmin tetap bisa dipakai |
| Auth | NextAuth.js v5 | Battle-tested, email/password + session |
| Payment Default | QRIS Statis | Paling simpel, zero cost, full kontrol |
| Payment Opsional | Gateway (configurable) | Bisa switch tanpa kode |
| Notifikasi | Web Push + Email fallback | Zero cost, native browser |
| PWA | next-pwa | Install ke homescreen, badge notif |
| Fulfillment | 3 tipe (AUTO/MANUAL/SLOT) | Fleksibel sesuai semua jenis produk |
| Garansi | Configurable per varian | Admin kontrol penuh tanpa kode |
| Slot System | Netflix (5/akun) + ChatGPT (4/akun) | Khusus 2 produk ini saja |

---

*Masterplan ini adalah dokumen hidup. Update seiring perkembangan diskusi dan pengerjaan.*
*Selalu commit perubahan ke repository agar konteks terjaga.*

**Last Updated:** 15 Mei 2026
**Status:** ✅ Final — Siap Eksekusi Bertahap
