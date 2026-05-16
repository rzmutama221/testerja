# 🧪 Panduan Testing Lokal rzdkstore dengan Laragon

> **Dokumen ini ditujukan untuk siapa saja** — bahkan yang baru pertama kali mencoba menjalankan project web secara lokal. Ikuti langkah demi langkah, jangan di-skip.
>
> **Estimasi waktu:** 30–45 menit (tergantung kecepatan internet untuk download)

---

## 📋 Daftar Isi

1. [Apa yang Dibutuhkan](#1-apa-yang-dibutuhkan)
2. [Instalasi Laragon](#2-instalasi-laragon)
3. [Instalasi Node.js](#3-instalasi-nodejs)
4. [Clone Project dari GitHub](#4-clone-project-dari-github)
5. [Buat Database MySQL di Laragon](#5-buat-database-mysql-di-laragon)
6. [Konfigurasi File .env](#6-konfigurasi-file-env)
7. [Install Dependency Project](#7-install-dependency-project)
8. [Generate VAPID Keys (Push Notification)](#8-generate-vapid-keys-push-notification)
9. [Setup Database Schema](#9-setup-database-schema)
10. [Jalankan Project](#10-jalankan-project)
11. [Buat Akun Admin Pertama](#11-buat-akun-admin-pertama)
12. [Checklist Testing Fitur](#12-checklist-testing-fitur)
13. [Troubleshooting Masalah Umum](#13-troubleshooting-masalah-umum)

---

## 1. Apa yang Dibutuhkan

Sebelum mulai, pastikan komputer Anda memiliki:

| Kebutuhan | Keterangan |
|---|---|
| **Windows 10/11** | Panduan ini untuk Windows (Laragon hanya tersedia di Windows) |
| **RAM minimal 4GB** | Untuk menjalankan Laragon + Node.js + browser |
| **Koneksi Internet** | Untuk download Laragon, Node.js, dan package npm |
| **Git** | Untuk clone project dari GitHub |

---

## 2. Instalasi Laragon

Laragon adalah aplikasi yang menyediakan MySQL (database) dan phpMyAdmin (pengelola database berbasis web) secara mudah di Windows.

### Langkah 2.1 — Download Laragon

1. Buka browser, pergi ke: **https://laragon.org/download/**
2. Klik tombol **"Download Laragon Full"** (sekitar 170MB)
   - Pastikan pilih versi **Full** bukan Lite (versi Full sudah termasuk MySQL)
3. Tunggu download selesai

### Langkah 2.2 — Install Laragon

1. Buka file installer yang sudah didownload (`laragon-wamp.exe` atau sejenisnya)
2. Klik **"Next"** pada setiap langkah instalasi
3. Pilih folder instalasi (default: `C:\laragon`) — **biarkan default saja**
4. Klik **"Install"** dan tunggu proses selesai
5. Klik **"Finish"**

### Langkah 2.3 — Jalankan Laragon

1. Cari aplikasi **Laragon** di Start Menu atau Desktop, lalu buka
2. Laragon akan muncul di system tray (pojok kanan bawah taskbar)
3. Klik kanan icon Laragon → **"Start All"**
4. Tunggu hingga indikator MySQL berwarna **hijau** ✅

> **Verifikasi:** Buka browser dan ketik `http://localhost` — harus muncul halaman welcome Laragon.

---

## 3. Instalasi Node.js

Node.js diperlukan untuk menjalankan project Next.js.

### Langkah 3.1 — Download Node.js

1. Buka browser, pergi ke: **https://nodejs.org/en/download/**
2. Klik tombol **"LTS"** (Long Term Support) — versi yang stabil
   - Pilih **Windows Installer (.msi)** sesuai arsitektur komputer Anda (biasanya 64-bit)
3. Tunggu download selesai

### Langkah 3.2 — Install Node.js

1. Buka file `.msi` yang sudah didownload
2. Klik **"Next"** pada setiap langkah
3. Centang **"Add to PATH"** jika ada opsi tersebut (biasanya sudah otomatis)
4. Klik **"Install"** dan tunggu
5. Klik **"Finish"**

### Langkah 3.3 — Verifikasi Node.js

1. Buka **Command Prompt** (tekan `Windows + R`, ketik `cmd`, Enter)
2. Ketik perintah berikut dan tekan Enter:
   ```
   node --version
   ```
3. Harus muncul versi, contoh: `v20.12.0`
4. Ketik juga:
   ```
   npm --version
   ```
5. Harus muncul versi npm, contoh: `10.5.0`

> ✅ Jika muncul angka versi, Node.js sudah terinstall dengan benar.

---

## 4. Clone Project dari GitHub

### Langkah 4.1 — Install Git (jika belum ada)

1. Buka Command Prompt, ketik:
   ```
   git --version
   ```
2. Jika muncul error atau "not recognized", download Git di: **https://git-scm.com/download/win**
3. Install dengan klik Next-Next-Next hingga selesai
4. Tutup dan buka ulang Command Prompt, cek lagi `git --version`

### Langkah 4.2 — Pilih Folder untuk Project

1. Buka **File Explorer** (Windows + E)
2. Navigasi ke `C:\laragon\www\` (ini adalah folder root website Laragon)
3. Buat folder baru bernama `rzdkstore` di dalam `www`
   > Alternatif: Anda bisa taruh di mana saja, misalnya `D:\Projects\`

### Langkah 4.3 — Clone Repository

1. Buka **Command Prompt** atau **Git Bash**
2. Masuk ke folder tujuan:
   ```bash
   cd C:\laragon\www
   ```
3. Clone repository:
   ```bash
   git clone https://github.com/rzmutama221/testerja.git
   ```
4. Tunggu proses clone selesai (mungkin 1-2 menit)
5. Masuk ke folder project:
   ```bash
   cd testerja\rzdkstore
   ```
6. Verifikasi — ketik `dir` (Windows) atau `ls` (Git Bash), Anda harus melihat file seperti `package.json`, `next.config.js`, dll.

---

## 5. Buat Database MySQL di Laragon

### Langkah 5.1 — Buka phpMyAdmin

1. Klik kanan icon Laragon di system tray
2. Pilih **"phpMyAdmin"** — akan membuka browser otomatis
3. Login dengan:
   - **Username:** `root`
   - **Password:** *(kosongkan / tekan Enter)*
   - Klik **"Go"** atau **"Login"**

### Langkah 5.2 — Buat Database Baru

1. Di phpMyAdmin, klik tab **"Databases"** di bagian atas
2. Di kolom **"Create database"**, ketik: `rzdkstore`
3. Di dropdown sebelahnya (Collation), pilih: **`utf8mb4_unicode_ci`**
   > Ini penting agar emoji dan karakter Unicode tersimpan dengan benar
4. Klik tombol **"Create"**
5. Database `rzdkstore` akan muncul di daftar sebelah kiri ✅

### Langkah 5.3 — Catat Kredensial Database

Simpan informasi ini untuk digunakan di langkah berikutnya:
```
Host     : localhost
Port     : 3306
Database : rzdkstore
Username : root
Password : (kosong)
```

---

## 6. Konfigurasi File .env

File `.env` adalah file konfigurasi rahasia yang berisi semua pengaturan penting project seperti password database, secret key, dan lainnya.

### Langkah 6.1 — Salin File Template

1. Pastikan Anda ada di folder `C:\laragon\www\testerja\rzdkstore`
2. Di Command Prompt, ketik:
   ```bash
   copy .env.example .env
   ```
   > Di Git Bash: `cp .env.example .env`
3. File `.env` sudah dibuat ✅

### Langkah 6.2 — Edit File .env

1. Buka file `.env` menggunakan teks editor
   - **Rekomendasi:** Download **Visual Studio Code** (gratis) di https://code.visualstudio.com/
   - Atau pakai Notepad: klik kanan file → Open With → Notepad
2. Ubah isi file `.env` sesuai panduan berikut:

---

### 📝 Isi File .env untuk Testing Lokal

Buka file `.env` dan ganti seluruh isinya dengan konfigurasi berikut:

```env
# ===========================================================
# rzdkstore — Konfigurasi untuk Testing LOKAL (Laragon)
# ===========================================================

# --- DATABASE ---
# Format: mysql://username:password@host:port/nama_database
# Karena password Laragon kosong, tidak perlu tulis password
DATABASE_URL="mysql://root:@localhost:3306/rzdkstore"

# --- NEXTAUTH ---
# Secret harus diisi minimal 32 karakter acak
# Anda bisa isi bebas, contoh berikut sudah oke untuk testing
NEXTAUTH_SECRET="rzdkstore-local-testing-secret-key-2026"
NEXTAUTH_URL="http://localhost:3000"

# --- EMAIL (SMTP) ---
# Untuk testing lokal, kita bisa gunakan Mailtrap (gratis)
# atau disable sementara dengan nilai dummy
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="isi_username_mailtrap_anda"
SMTP_PASS="isi_password_mailtrap_anda"
SMTP_FROM="rzdkstore <noreply@rzdkstore.local>"

# --- WEB PUSH (VAPID) ---
# Akan diisi setelah generate keys di Langkah 8
# Untuk sementara biarkan kosong dulu
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_EMAIL="mailto:admin@rzdkstore.local"

# --- PAYMENT GATEWAY (Opsional - biarkan kosong untuk testing) ---
PAYMENT_GATEWAY_PROVIDER=""
PAYMENT_GATEWAY_API_KEY=""
PAYMENT_GATEWAY_SECRET_KEY=""

# --- ENCRYPTION ---
# Harus tepat 32 karakter
ENCRYPTION_KEY="rzdkstore-enc-key-32chars-testing"

# --- APP ---
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="rzdkstore"
NEXT_PUBLIC_WA_NUMBER="6285111642004"
```

3. **Simpan** file `.env` (Ctrl+S)

---

### 🔧 Setup Email untuk Testing (Opsional tapi Disarankan)

Agar fitur email berjalan (verifikasi akun, reset password), gunakan **Mailtrap** — layanan email testing gratis yang menangkap email tanpa benar-benar mengirimnya.

1. Buka **https://mailtrap.io** dan daftar akun gratis
2. Setelah login, buka **Email Testing → Inboxes**
3. Klik inbox default → pilih **Integration → Nodemailer**
4. Salin nilai `host`, `port`, `auth.user`, dan `auth.pass`
5. Isi di `.env`:
   ```env
   SMTP_HOST="sandbox.smtp.mailtrap.io"
   SMTP_PORT=2525
   SMTP_USER="xxxxxxxxxxxxx"
   SMTP_PASS="xxxxxxxxxxxxx"
   ```

> **Alternatif tanpa setup email:** Saat testing, Anda bisa langsung update kolom `emailVerified = true` di database via phpMyAdmin setelah registrasi, tanpa perlu klik link email.

---

## 7. Install Dependency Project

Dependency adalah semua library/package yang dibutuhkan project untuk berjalan.

### Langkah 7.1 — Buka Terminal di Folder Project

1. Pastikan Command Prompt/Git Bash berada di folder `rzdkstore`:
   ```bash
   cd C:\laragon\www\testerja\rzdkstore
   ```

### Langkah 7.2 — Install Package

1. Ketik perintah berikut dan tekan Enter:
   ```bash
   npm install
   ```
2. Tunggu proses selesai — ini akan mendownload semua library yang dibutuhkan
   > ⏳ **Proses ini memakan waktu 3–10 menit** tergantung kecepatan internet. Biarkan berjalan.
3. Setelah selesai, akan muncul pesan seperti: `added 1234 packages in 45s`
4. Folder `node_modules` akan terbuat otomatis ✅

> **⚠️ Jangan panik** jika muncul beberapa warning (garis kuning). Warning adalah normal. Yang tidak boleh adalah **error** (garis merah yang menyebabkan proses berhenti).

---

## 8. Generate VAPID Keys (Push Notification)

VAPID Keys diperlukan untuk fitur push notification di browser/PWA.

### Langkah 8.1 — Generate Keys

1. Di Command Prompt, pastikan masih di folder `rzdkstore`
2. Ketik:
   ```bash
   npx web-push generate-vapid-keys
   ```
3. Akan muncul output seperti ini:
   ```
   =======================================
   Public Key:
   BFr3X8example_public_key_string_here...

   Private Key:
   abc123example_private_key_string_here...
   =======================================
   ```

### Langkah 8.2 — Isi Keys ke .env

1. Buka kembali file `.env`
2. Salin **Public Key** ke `VAPID_PUBLIC_KEY`
3. Salin **Private Key** ke `VAPID_PRIVATE_KEY`

```env
VAPID_PUBLIC_KEY="BFr3X8example_public_key_string_here..."
VAPID_PRIVATE_KEY="abc123example_private_key_string_here..."
```

4. Simpan file `.env`

---

## 9. Setup Database Schema

Langkah ini akan membuat semua tabel yang dibutuhkan di database MySQL.

### Langkah 9.1 — Generate Prisma Client

```bash
npx prisma generate
```

Perintah ini membuat TypeScript client untuk database. Output akan muncul seperti:
```
✔ Generated Prisma Client (v5.x.x) to ./node_modules/@prisma/client
```

### Langkah 9.2 — Push Schema ke Database

```bash
npx prisma db push
```

Perintah ini akan membuat semua tabel di database `rzdkstore` yang sudah dibuat tadi.

Output yang diharapkan:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "rzdkstore" at "localhost:3306"

🚀  Your database is now in sync with your Prisma schema. Done in 2.34s
```

### Langkah 9.3 — Verifikasi Tabel di phpMyAdmin

1. Buka phpMyAdmin di browser: `http://localhost/phpmyadmin`
2. Klik database `rzdkstore` di panel kiri
3. Anda akan melihat banyak tabel seperti `users`, `products`, `orders`, dll.
4. Harus ada sekitar **19 tabel** ✅

> **Jika ada error:** Paling umum adalah database URL salah. Periksa kembali `DATABASE_URL` di `.env`. Pastikan tidak ada spasi dan formatnya benar.

---

## 10. Jalankan Project

### Langkah 10.1 — Start Development Server

```bash
npm run dev
```

Tunggu beberapa detik hingga muncul output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Starting...
✓ Ready in 3.2s
```

### Langkah 10.2 — Buka di Browser

1. Buka browser (Chrome/Firefox/Edge)
2. Ketik: **`http://localhost:3000`**
3. Anda harus melihat **Landing Page rzdkstore** 🎉

> **Terminal harus tetap buka** selama testing. Jangan tutup Command Prompt/terminal yang menjalankan `npm run dev`.

---

## 11. Buat Akun Admin Pertama

Project tidak menyediakan akun default. Anda perlu daftar terlebih dahulu lalu upgrade ke admin.

### Langkah 11.1 — Registrasi Akun

1. Buka `http://localhost:3000/register`
2. Isi semua field:
   - **Nama Lengkap:** Nama Anda
   - **Username:** `admin` (atau sesuai keinginan)
   - **Email:** Email Anda (atau email test)
   - **No. WhatsApp:** Nomor WA Anda
   - **Password:** Minimal 8 karakter, 1 huruf besar, 1 angka (contoh: `Admin123`)
   - **Konfirmasi Password:** Sama dengan password
3. Klik **"Daftar Akun"**

### Langkah 11.2 — Verifikasi Email (2 Cara)

**Cara A — Via Mailtrap (jika sudah setup):**
1. Login ke Mailtrap
2. Buka inbox, cari email verifikasi dari rzdkstore
3. Klik link verifikasi di email

**Cara B — Langsung via phpMyAdmin (lebih cepat untuk testing):**
1. Buka `http://localhost/phpmyadmin`
2. Klik database `rzdkstore` → klik tabel `users`
3. Klik **"Browse"** untuk lihat data
4. Temukan baris dengan username yang baru Anda daftarkan
5. Klik ikon **pensil (edit)** di baris tersebut
6. Ubah kolom `email_verified` dari `0` menjadi `1`
7. Klik **"Go"** untuk simpan ✅

### Langkah 11.3 — Upgrade ke Role Admin

Masih di phpMyAdmin, di tabel `users`:
1. Klik edit pada baris akun Anda
2. Ubah kolom `role` dari `USER` menjadi `ADMIN`
3. Klik **"Go"** untuk simpan ✅

### Langkah 11.4 — Login sebagai Admin

1. Buka `http://localhost:3000/login`
2. Masuk dengan username dan password yang baru dibuat
3. Anda akan diarahkan ke **`http://localhost:3000/admin`** — Admin Dashboard ✅

---

## 12. Checklist Testing Fitur

Gunakan checklist ini untuk memastikan semua fitur berjalan dengan baik.

### ✅ Landing Page
- [ ] Buka `http://localhost:3000` — halaman muncul
- [ ] Navbar tampil dengan logo + menu
- [ ] Hero section tampil dengan tombol CTA
- [ ] Scroll ke bawah — semua seksi tampil (Kategori, Produk, Cara Order, FAQ)
- [ ] Footer tampil dengan link WhatsApp

### ✅ Authentication
- [ ] Register akun baru berhasil
- [ ] Email verifikasi terkirim (jika Mailtrap setup)
- [ ] Login berhasil
- [ ] Logout berhasil
- [ ] Lupa password → kirim email reset
- [ ] Reset password berhasil

### ✅ Admin — Setup Awal (Lakukan Ini Dulu)
1. **Buat Kategori Produk:**
   - Buka `http://localhost:3000/admin/produk`
   - Tab **"Kategori"** → Tambah Kategori
   - Contoh: Icon `🎬`, Nama `Streaming Video`, Slug `streaming-video`
   - Buat minimal 1 kategori

2. **Buat Produk:**
   - Tab **"Produk"** → Tambah Produk
   - Pilih kategori, isi nama, slug, logo URL: `/logos/netflix.png`, tipe: `MANUAL`
   - Simpan

3. **Buat Varian:**
   - Klik **"Detail"** pada produk yang baru dibuat
   - Klik **"Tambah Varian"**
   - Isi: Nama `Sharing 1 Bulan`, Harga `30000`, Durasi `30`, Stok `100`
   - Garansi: kosong (full garansi)
   - Simpan

### ✅ Customer Flow — Uji Alur Order Penuh

**Buka tab browser baru (mode Incognito) agar terpisah dari sesi admin:**

1. **Daftar akun customer baru** di `http://localhost:3000/register`
2. **Verifikasi email** via phpMyAdmin (ubah `email_verified` = 1)
3. **Login** sebagai customer
4. **Buka `http://localhost:3000/dashboard/produk`**
5. **Cari produk** yang sudah dibuat admin
6. **Klik expand** → klik **"Order"** pada varian
7. **Buat order** → klik "Buat Order"
8. **Cek halaman transaksi** → status harus **"Pending Review"**

**Kembali ke tab Admin:**

9. Buka `http://localhost:3000/admin/transaksi`
10. Temukan order baru → klik **"ACC ✅"**
11. Isi catatan opsional → **"Konfirmasi Approve"**

**Kembali ke tab Customer:**

12. Refresh halaman transaksi → status harus **"Disetujui"**
13. Buka detail order → tampilkan section pembayaran QRIS
14. Upload **foto apapun** sebagai bukti bayar (untuk testing)
15. Status berubah ke **"Bukti Dikirim"**

**Kembali ke tab Admin:**

16. Di halaman transaksi → klik **"Verifikasi ✅"**
17. Jika produk Manual: klik **"Kirim Produk"** → isi info akun → kirim

**Kembali ke tab Customer:**

18. Refresh → order status **"Selesai"** ✅
19. Buka **"Akun Aktif"** → produk tampil dengan countdown
20. Coba **"Klaim Garansi"** → isi form → submit

### ✅ Fitur Lainnya (Admin)
- [ ] `http://localhost:3000/admin` — Dashboard tampil dengan stats
- [ ] `http://localhost:3000/admin/netflix` — Panel slot Netflix
  - Tambah akun Netflix (dummy data untuk testing)
  - 5 slot kosong muncul
- [ ] `http://localhost:3000/admin/chatgpt` — Panel slot ChatGPT
  - Tambah akun ChatGPT (dummy data)
  - 4 slot kosong muncul
- [ ] `http://localhost:3000/admin/voucher` — Buat voucher diskon
  - Buat voucher kode `TESTING` diskon 50% untuk semua produk
  - Test saat order di customer: input kode `TESTING`
- [ ] `http://localhost:3000/admin/announcement` — Buat pengumuman
  - Target: ALL, tipe INFO
  - Publish → customer mendapat notifikasi
- [ ] `http://localhost:3000/admin/keuangan` — Laporan keuangan
  - Grafik harian dan bulanan muncul
- [ ] `http://localhost:3000/admin/payment-settings` — Upload QRIS
  - Upload gambar apapun sebagai QRIS (untuk testing)
- [ ] `http://localhost:3000/admin/pengaturan` — Info toko tampil

### ✅ Notifikasi (Customer)
- [ ] `http://localhost:3000/dashboard/notifikasi` — Halaman notifikasi
- [ ] Notifikasi order muncul setelah interaksi
- [ ] Klik "Aktifkan Notifikasi" → browser meminta izin push

---

## 13. Troubleshooting Masalah Umum

### ❌ Error: "Cannot connect to MySQL"

**Gejala:** `prisma db push` gagal dengan error koneksi

**Solusi:**
1. Pastikan Laragon sudah running (icon MySQL hijau di system tray)
2. Cek `DATABASE_URL` di `.env`:
   ```
   DATABASE_URL="mysql://root:@localhost:3306/rzdkstore"
   ```
   > Perhatikan: tidak ada password (format `root:@` bukan `root:password@`)
3. Pastikan database `rzdkstore` sudah dibuat di phpMyAdmin
4. Coba restart MySQL di Laragon: klik kanan → MySQL → Restart

---

### ❌ Error: "npm install" gagal / ERESOLVE

**Solusi:**
```bash
npm install --legacy-peer-deps
```
Ini memaksa npm mengabaikan konflik dependency minor.

---

### ❌ Error: "next: command not found"

**Gejala:** `npm run dev` tidak bisa dijalankan

**Solusi:**
1. Pastikan `npm install` sudah selesai sepenuhnya
2. Coba install ulang:
   ```bash
   rm -rf node_modules
   npm install
   ```
   > Di Windows CMD: `rd /s /q node_modules` kemudian `npm install`

---

### ❌ Error: "Port 3000 is already in use"

**Gejala:** Server tidak bisa start karena port 3000 sudah dipakai

**Solusi:**
```bash
# Jalankan di port lain
npx next dev -p 3001
```
Kemudian buka `http://localhost:3001` di browser.

**Atau:** Cari dan matikan proses yang menggunakan port 3000:
1. Buka Command Prompt sebagai Administrator
2. Ketik: `netstat -ano | findstr :3000`
3. Lihat angka PID di kolom terakhir
4. Ketik: `taskkill /PID [angka_PID] /F`

---

### ❌ Error: "NEXTAUTH_SECRET is not set"

**Solusi:**
1. Buka file `.env`
2. Pastikan `NEXTAUTH_SECRET` terisi dan minimal 32 karakter:
   ```
   NEXTAUTH_SECRET="rzdkstore-local-testing-secret-key-2026"
   ```
3. Restart dev server (Ctrl+C lalu `npm run dev` lagi)

---

### ❌ Halaman Error "500 Internal Server Error"

**Solusi:**
1. Lihat pesan error di terminal yang menjalankan `npm run dev`
2. Biasanya ada pesan lebih detail di sana
3. Paling umum: file `.env` belum dikonfigurasi atau database belum di-push

---

### ❌ Login gagal setelah registrasi

**Kemungkinan penyebab:**
1. Email belum diverifikasi → ubah `email_verified = 1` di phpMyAdmin
2. Password salah → reset melalui `/forgot-password`

---

### ❌ Gambar/logo tidak muncul

**Untuk testing, ini normal.** Gambar produk butuh file yang di-upload. Untuk testing fungsional, fokus pada alur order dan data — bukan tampilan visual produk.

---

### 💡 Tips Tambahan

- **Prisma Studio** — GUI untuk lihat dan edit data database dengan mudah:
  ```bash
  npx prisma studio
  ```
  Buka `http://localhost:5555` di browser untuk melihat semua data.

- **Hot Reload** — Setiap Anda ubah kode saat `npm run dev` berjalan, browser otomatis refresh.

- **Restart Server** — Jika ada perubahan di file `.env`, selalu restart server dengan `Ctrl+C` lalu `npm run dev` ulang.

- **Dua Sesi** — Untuk test customer vs admin secara bersamaan, gunakan browser berbeda (misal Chrome untuk admin, Firefox untuk customer) atau Chrome + Chrome Incognito.

---

## 🎯 Ringkasan Perintah Penting

```bash
# Masuk ke folder project
cd C:\laragon\www\testerja\rzdkstore

# Install semua package
npm install

# Generate VAPID keys (sekali saja)
npx web-push generate-vapid-keys

# Setup database (sekali saja, atau setelah perubahan schema)
npx prisma generate
npx prisma db push

# Jalankan development server
npm run dev

# Buka Prisma Studio (GUI database)
npx prisma studio
```

---

## ✅ Selamat!

Jika semua langkah berhasil, Anda sudah berhasil menjalankan **rzdkstore SaaS Panel** secara lokal di komputer Anda menggunakan Laragon.

Untuk pertanyaan atau masalah lebih lanjut, hubungi via WhatsApp: **085111642004**

---

*Dokumen ini dibuat untuk memudahkan proses testing lokal rzdkstore.my.id*
*Last Updated: Mei 2026*
