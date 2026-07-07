# Aplikasi Administrasi RT (RT App)

Aplikasi berbasis web untuk mengelola data perumahan RT, meliputi pendataan warga, rumah, pembayaran iuran kas RT, serta manajemen pengeluaran dan pelaporan keuangan.

Aplikasi ini dibangun menggunakan arsitektur *decoupled* di mana Backend (Laravel) dan Frontend (React + Tailwind CSS v4) terpisah dan berjalan di layanannya masing-masing.

## 🗂 Struktur Repository

Repository ini terdiri dari dua direktori utama:
- `rt-app-backend/` : RESTful API menggunakan Laravel 11.
- `rt-app-frontend/` : Frontend SPA menggunakan React (Vite) + Tailwind CSS v4.

---

## 🛠 Panduan Instalasi (Installation Guide)

Pastikan sistem Anda (Local Environment) sudah terinstall:
- PHP >= 8.2 & Composer
- Node.js >= 18 & npm
- MySQL / MariaDB Server

### Tahap 1: Setup Backend (Laravel)

1. Buka terminal, masuk ke direktori backend:
   ```bash
   cd rt-app-backend
   ```
2. Install dependensi PHP menggunakan Composer:
   ```bash
   composer install
   ```
3. Copy file konfigurasi `.env`:
   ```bash
   cp .env.example .env
   ```
4. Buat database baru di MySQL bernama `rt_app_db`.
5. Sesuaikan kredensial database pada file `.env` di dalam `rt-app-backend`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=rt_app_db
   DB_USERNAME=root      # (Sesuaikan dengan username MySQL Anda)
   DB_PASSWORD=          # (Sesuaikan dengan password MySQL Anda)
   ```
6. Generate *Application Key*:
   ```bash
   php artisan key:generate
   ```
7. Jalankan Migrasi Database beserta Seeder untuk mengisi data awal (Tipe Iuran, Dummy Warga, dan Rumah):
   ```bash
   php artisan migrate:fresh --seed
   ```
8. Buat *symbolic link* untuk folder storage (agar foto KTP dapat diakses publik):
   ```bash
   php artisan storage:link
   ```
9. Jalankan server Laravel:
   ```bash
   php artisan serve
   ```
   > Backend akan berjalan di `http://127.0.0.1:8000`. Biarkan terminal ini tetap menyala.

### Tahap 2: Setup Frontend (React)

1. Buka tab terminal baru, masuk ke direktori frontend:
   ```bash
   cd rt-app-frontend
   ```
2. Install dependensi Node.js:
   ```bash
   npm install
   ```
   > Catatan: Proses ini sekaligus akan menginstal Tailwind CSS v4.
3. Jalankan *development server* React:
   ```bash
   npm run dev
   ```
   > Frontend akan berjalan di `http://localhost:5173`. Buka URL ini di browser Anda.

Aplikasi sekarang siap digunakan secara lokal! 🎉

---

## 📸 Dokumentasi Fitur (Screenshots)

Berikut adalah daftar fitur beserta bukti implementasinya:

### 1. Dashboard Summary
Menampilkan ringkasan total saldo, pemasukan, pengeluaran bulan ini, status rumah, dan grafik keuangan tahunan.

*(Silakan masukkan screenshot Dashboard di bawah ini)*
![Dashboard Screenshot](./screenshots/dashboard.png)

### 2. Mengelola Penghuni
Fitur untuk menambah dan mengubah data penghuni, lengkap dengan upload Foto KTP, status menetap (Tetap/Kontrak), dan status pernikahan.

*(Silakan masukkan screenshot Halaman Penghuni di bawah ini)*
![Residents Screenshot](./screenshots/residents.png)

### 3. Mengelola Rumah & Detail Penghuni
Fitur untuk manajemen rumah dan detail riwayat. Jika rumah dihuni, akan ada riwayat siapa saja yang menempatinya dan riwayat pembayaran mereka.

*(Silakan masukkan screenshot Halaman Rumah di bawah ini)*
![Houses Screenshot](./screenshots/houses.png)

*(Silakan masukkan screenshot Detail Rumah di bawah ini)*
![House Detail Screenshot](./screenshots/house_detail.png)

### 4. Mengelola Pembayaran Iuran
Input pembayaran iuran (Satpam & Kebersihan). Fitur ini memiliki validasi otomatis untuk hanya menagih rumah yang berpenghuni, dan bisa dibayar per bulan atau beberapa bulan sekaligus.

*(Silakan masukkan screenshot Pembayaran di bawah ini)*
![Payments Screenshot](./screenshots/payments.png)

### 5. Mengelola Pengeluaran
Pencatatan pengeluaran operasional (seperti gaji satpam, listrik, perbaikan jalan).

*(Silakan masukkan screenshot Pengeluaran di bawah ini)*
![Expenses Screenshot](./screenshots/expenses.png)

### 6. Laporan Keuangan Detail Bulanan
Menampilkan laporan terperinci mengenai daftar pemasukan dan pengeluaran beserta total saldo pada bulan dan tahun tertentu.

*(Silakan masukkan screenshot Laporan Bulanan di bawah ini)*
![Monthly Report Screenshot](./screenshots/monthly_report.png)

---

## 🗃 Diagram Database (ERD)

Desain struktur database (Entity Relationship Diagram) dapat dilihat pada file `ERD.md` di root repository ini.
