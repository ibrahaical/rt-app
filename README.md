# SmartRT - Sistem Informasi Manajemen Administrasi RT

SmartRT adalah aplikasi *Full-Stack* (Laravel + React) yang dirancang khusus untuk mempermudah tugas Rukun Tetangga (RT) dalam mengelola administrasi warga, rumah, dan keuangan (tagihan iuran & pengeluaran kas). Aplikasi ini dibangun sebagai solusi studi kasus untuk memanajemen iuran wajib (Satpam & Kebersihan), mengelola riwayat hunian, serta melaporkan saldo keuangan secara transparan.

## 🚀 Fitur Utama
- **Manajemen Penghuni**: Pendataan warga (Nama, KTP, Status Nikah, Kontak, Status Kepemilikan).
- **Manajemen Rumah & Riwayat**: Pencatatan unit rumah (Dihuni/Kosong) lengkap dengan riwayat siapa saja yang pernah menempati rumah tersebut beserta rentang waktunya.
- **Sistem Penagihan Pintar**: *Generate* tagihan bulanan (Satpam Rp100.000, Kebersihan Rp15.000) yang hanya ditujukan pada rumah berstatus "Dihuni" untuk mencegah tagihan salah sasaran.
- **Manajemen Pembayaran**: Pencatatan pembayaran tagihan warga secara *real-time*.
- **Laporan & Dashboard Keuangan**: Grafik interaktif 12 bulan pemasukan & pengeluaran, kartu ringkasan piutang/tunggakan, dan rincian kas bulanan yang bisa difilter berdasarkan tahun dan bulan.

## 🛠️ Tech Stack
- **Backend**: Laravel 11.x, PHP 8.2+, MySQL
- **Frontend**: React 18 (Vite), Tailwind CSS v4, Framer Motion (Animasi UI), Recharts (Grafik), Axios.

---

## 📋 Prasyarat Sistem
Pastikan perangkat Anda sudah terinstal:
- [PHP](https://www.php.net/) (minimal versi 8.2)
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) (minimal versi 18) & NPM
- [MySQL](https://www.mysql.com/) atau MariaDB (via XAMPP/Laragon/Docker)

---

## ⚙️ Panduan Instalasi (Step-by-Step)

Aplikasi ini terbagi menjadi dua folder utama: `rt-app-backend` (API) dan `rt-app-frontend` (UI). Ikuti langkah-langkah di bawah ini secara berurutan.

### Langkah 1: Clone Repository
Buka terminal/Command Prompt, lalu jalankan:
```bash
git clone https://github.com/ibrahaical/rt-app.git
cd rt-app
```

### Langkah 2: Konfigurasi Backend (Laravel)
```bash
# Masuk ke direktori backend
cd rt-app-backend

# Instal dependensi PHP
composer install

# Salin file konfigurasi environment
cp .env.example .env

# Buat App Key Laravel
php artisan key:generate
```

**Konfigurasi Database:**
1. Buka aplikasi database Anda (phpMyAdmin / DBeaver).
2. Buat database baru (misal dengan nama `rt_app`).
3. Buka file `.env` di folder `rt-app-backend`, cari bagian koneksi database dan ubah sesuai milik Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rt_app
DB_USERNAME=root
DB_PASSWORD=
```

**Migrasi dan Seeder (Penting):**
Sistem membutuhkan *Fee Types* (jenis iuran) bawaan agar berjalan normal. Jalankan perintah ini untuk membuat struktur tabel dan mengisi data awal (rumah, warga contoh, dan jenis iuran).
```bash
php artisan migrate:fresh --seed
```
*Catatan: Menjalankan seeder otomatis menyiapkan 20 rumah (15 dihuni, 5 kosong/kontrak).*

**Link Storage (Untuk Foto KTP):**
```bash
php artisan storage:link
```

**Jalankan Server Backend:**
```bash
php artisan serve
```
*Biarkan terminal ini tetap menyala. API Backend sekarang berjalan di `http://127.0.0.1:8000`*

---

### Langkah 3: Konfigurasi Frontend (React + Vite)
Buka terminal **baru** (biarkan terminal backend tetap berjalan), lalu jalankan:

```bash
# Kembali ke root folder, lalu masuk ke folder frontend
cd rt-app/rt-app-frontend

# Instal dependensi JavaScript (React, Tailwind, Framer Motion, dsb)
npm install

# Jalankan server frontend
npm run dev
```

*Server Frontend sekarang berjalan di `http://localhost:5173` (atau port lain yang diinfokan di terminal).*

---

## 🎮 Cara Menggunakan Aplikasi
1. Buka *browser* dan akses URL frontend Anda (biasanya `http://localhost:5173`).
2. Masuk ke halaman **Tagihan Iuran**.
3. Klik tombol **"Generate Tagihan"**. Aplikasi secara otomatis akan membuatkan tagihan Rp115.000 (Satpam + Kebersihan) untuk semua rumah yang ada penghuninya di bulan berjalan.
4. Buka halaman **Dashboard** untuk melihat pergerakan keuangan secara *real-time*.

---
*Dikembangkan untuk menyelesaikan studi kasus Skill Fit Test Full Stack Programmer.*
