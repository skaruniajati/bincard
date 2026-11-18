# DIGITAL WAREHOUSE INVENTORY SYSTEM
## Sistem Digitalisasi Bin Card Berbasis QR Code & Real-Time Monitoring Dashboard
### Unit Operasional Gudang Perkebunan Kelapa Sawit — PT Muaratoyu Subur Lestari

Aplikasi web enterprise full-stack modern yang dirancang khusus untuk memenuhi kebutuhan pencatatan, pengawasan persediaan fisik, dan akurasi mutasi suku cadang (*sparepart* armada dump truck, traktor, alat panen kelapa sawit, pelumas, dan pupuk) menggunakan sistem **QR Code Bin Card** dan **Real-Time Live Dashboard**.

---

## 🌟 FITUR UTAMA

### 1. General Warehouse Monitoring Dashboard
- **6 KPI Cards**:
  - Total Jenis Material (Katalog aktif)
  - Total Fisik Stok (Akumulasi saldo)
  - Total Transaksi Barang Masuk (Goods Receipt / GR)
  - Total Transaksi Barang Keluar (Goods Issue / GI)
  - Material dengan Stok Minimum (Peringatan restock)
  - Material dengan Stok Kosong (Kritis)
- **Grafik Pergerakan Barang**: Bar chart dinamis membandingkan volume GR vs GI.
- **Grafik Komposisi Stok**: Donut chart proporsi stok Normal, Low Stock, dan Out of Stock.
- **Transaksi Terkini (Recent Transactions)**: 8 transaksi terakhir dengan detail petugas dan nomor dokumen.
- **Material Alert List**: Deteksi dini item yang mendekati stok minimum atau habis.

### 2. Material Monitoring & Stock Movement History
- Fitur pencarian instan berdasarkan Kode Material, Deskripsi Barang, atau Kategori.
- Penelusuran saldo real-time, lokasi rak/bin gudang, dan batas toleransi minimum/maksimum.
- Riwayat pergerakan fisik barang (*Stock Movement Card*) yang terhubung atomik dengan nomor transaksi.
- Grafik fluktuasi saldo fisik material.

### 3. Scan QR Code Bin Card (Core Digitalization)
- **Scanner Kamera Real-Time**: Mendukung kamera belakang smartphone maupun webcam laptop.
- **Fallback Input Manual**: Memungkinkan pencarian manual jika barcode fisik di rak kotor atau kamera terkendala.
- **Kartu Informasi Material**: Menampilkan nama barang, lokasi bin, dan saldo aktual langsung dari database (tidak pernah membaca saldo dari payload QR agar tidak kedaluwarsa).
- **Transaksi GR & GI**:
  - **Goods Receipt (GR)**: Penerimaan barang dari vendor / PO (saldo bertambah).
  - **Goods Issue (GI)**: Pengeluaran barang untuk maintenance atau operasional afdeling (saldo berkurang).
- **Validasi Bisnis Ketat**:
  - Kuantitas transaksi wajib > 0.
  - Pengeluaran (GI) **tidak boleh melebihi stok tersedia**.
  - Pencegahan double submission.
  - Dialog konfirmasi saldo sebelum & sesudah transaksi.

### 4. Integrasi Real-Time (Server-Sent Events / SSE)
- Setiap transaksi GR maupun GI yang berhasil disimpan langsung memicu broadcast event melalui endpoint `/api/realtime`.
- Dashboard monitoring, grafik, dan tabel transaksi akan langsung diperbarui seketika tanpa perlu me-refresh halaman secara manual.

### 5. Pengelolaan QR Code Bin Card & Format Cetak Label
- Pembuatan token QR unik untuk setiap material (`/scan/[qrToken]`).
- Preview dan Download QR Code format gambar PNG beresolusi tinggi.
- Fitur **Cetak Label Bin Card Fisik**:
  - **Format Karton A6**: Standar kartu gantung Bin Card pada rak gudang perkebunan.
  - **Format Stiker Rak**: Label berperekat kecil untuk laci suku cadang kecil.
  - Dilengkapi identitas PT Muaratoyu Subur Lestari, kode barang, lokasi rak, QR barcode, dan instruksi "SCAN TO UPDATE STOCK".

### 6. Master Data Material
- Pengelolaan katalog material lengkap dengan pencarian, filter kategori, filter status stok, dan penomoran halaman (pagination).
- Modal tambah dan edit material dengan validasi schema Zod.
- Fitur penonaktifan (*deactivate*) material secara aman.

### 7. Riwayat Transaksi & Pelaporan (Immutable & Audit Trail)
- Riwayat transaksi yang bersifat *immutable* untuk menjaga integritas audit gudang.
- Fitur ekspor data ke format **Excel (.xlsx)** dan **CSV**.
- Cetak PDF laporan posisi persediaan, rekapitulasi penerimaan, dan pengeluaran.

### 8. Role-Based Access Control (RBAC) & Keamanan
- Autentikasi berbasis token JWT terenkripsi dengan HTTP-Only Cookie.
- Password hashing menggunakan **Bcrypt**.
- **Admin Gudang**: Akses penuh ke seluruh dashboard, CRUD master material, cetak/regenerasi QR Code, transaksi GR/GI, pelaporan, dan Manajemen Pengguna.
- **Petugas Gudang**: Akses dashboard monitoring, scan QR Code, pencatatan transaksi GR/GI, dan riwayat transaksi. Dibatasi dari menu Manajemen Pengguna.

---

## 🛠 TECH STACK

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Enterprise Dark Green `#14532D` Palma Theme)
- **Database & ORM**: Prisma ORM dengan SQLite (zero-setup lokal) & siap migrasi ke PostgreSQL
- **Icons**: Lucide React
- **QR Code Engine**: `qrcode` & `html5-qrcode`
- **Visualisasi Grafik**: Recharts
- **Validasi Form**: React Hook Form + Zod
- **Autentikasi**: Jose (JWT) + Bcryptjs
- **Notifikasi**: Sonner Toast
- **Spreadsheet Engine**: XLSX (SheetJS)

---

## 🚀 PANDUAN MENJALANKAN APLIKASI SECARA LOKAL

### 1. Prasyarat Sistem
- **Node.js**: Versi 18 ke atas (Direkomendasikan Node.js v20 atau v26)
- **NPM**: Versi 9 ke atas

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Generate Prisma Client & Inisialisasi Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Seeding Data Demo (Material Gudang Sawit & Akun)
Jalankan perintah berikut untuk mengisi database dengan material suku cadang kelapa sawit (`T-04371-0K120`, egrek, dodos, pupuk NPK, oli meditran, dll.) serta akun pengguna:
```bash
node prisma/seed.js
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser dan akses: **`http://localhost:3000`**

---

## 🔐 AKUN DEMO LOGIN (DEVELOPMENT)

| Role | Username | Password | Keterangan Hak Akses |
|---|---|---|---|
| **Admin Gudang** | `admin` | `admin123` | Akses penuh (Dashboard, Master Data, QR Code, Transaksi, Laporan, Manajemen User) |
| **Petugas Gudang** | `petugas` | `petugas123` | Akses operasional lapangan (Monitoring, Scan QR Bin Card, Catat GR/GI, Riwayat) |

*Tersedia tombol Quick Login 1-klik di halaman login untuk kemudahan pengujian.*

---

## 📋 VERIFIKASI ACCEPTANCE CRITERIA (10 SKENARIO)

- **SCENARIO 1**: Admin menambahkan material baru &rarr; Sistem otomatis membuat QR Code Bin Card unik.
- **SCENARIO 2**: Petugas melakukan scan QR Code &rarr; Sistem menampilkan detail material, nama, UOM, dan saldo stok langsung dari database.
- **SCENARIO 3**: Petugas mencatat transaksi GR 10 unit &rarr; Saldo material otomatis bertambah 10 unit secara atomik.
- **SCENARIO 4**: Petugas mencatat transaksi GI 3 unit &rarr; Saldo material otomatis berkurang 3 unit.
- **SCENARIO 5**: Saldo awal 20 unit, dilakukan GR 10 unit dan GI 3 unit &rarr; Saldo akhir terverifikasi konsisten menjadi 27 unit.
- **SCENARIO 6**: Petugas mencoba melakukan GI melebihi stok yang tersedia &rarr; Sistem menolak transaksi dan menampilkan pesan error.
- **SCENARIO 7**: Setelah transaksi berhasil disimpan &rarr; Dashboard Monitoring dan grafik otomatis terupdate secara real-time melalui SSE tanpa refresh halaman.
- **SCENARIO 8**: Riwayat transaksi mencatat saldo awal (*previous balance*), kuantitas transaksi, saldo akhir (*new balance*), identitas user, dan referensi dokumen secara akurat.
- **SCENARIO 9**: Pengguna dengan role Petugas Gudang yang mencoba mengakses menu `/users` akan otomatis ditolak dan dialihkan.
- **SCENARIO 10**: Seluruh perubahan stok dibungkus dalam *database transaction* atomik sehingga kegagalan koneksi tidak menyebabkan saldo parsial atau inkonsisten.
