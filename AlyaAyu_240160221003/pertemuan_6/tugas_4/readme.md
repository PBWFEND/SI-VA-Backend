# REST API Sistem Informasi Perpustakaan

## 1. Deskripsi Proyek

REST API Sistem Informasi Perpustakaan merupakan aplikasi backend untuk mengelola data buku dan anggota perpustakaan. Aplikasi ini dikembangkan menggunakan Node.js, Express.js, dan Prisma ORM dengan database SQLite.

API menyediakan operasi CRUD (Create, Read, Update, Delete) untuk mengelola data buku dan anggota, serta dilengkapi validasi data dan penanganan error.

## 2. Teknologi yang Digunakan

- Node.js
- Express.js
- TypeScript / JavaScript
- Prisma ORM
- SQLite
- Postman
- dotenv

## 3. Fitur API

### A. Manajemen Buku
- Menampilkan seluruh data buku.
- Menampilkan buku berdasarkan ID.
- Menambahkan data buku.
- Mengganti seluruh data buku.
- Memperbarui sebagian data buku.
- Menghapus data buku.
- Filter buku berdasarkan judul dan penulis.

### B. Manajemen Anggota
- Menampilkan seluruh data anggota.
- Menampilkan anggota berdasarkan ID.
- Menambahkan data anggota.
- Mengganti seluruh data anggota.
- Memperbarui sebagian data anggota.
- Menghapus data anggota.

### C. Fitur Pendukung
- Validasi input menggunakan pengecekan tipe data.
- Middleware untuk mencatat request.
- Penanganan endpoint yang tidak ditemukan.
- Penanganan error Prisma.
- Pemeriksaan status API.

## 4. Daftar Endpoint

### A. Endpoint Utama

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Informasi API |
| GET | `/health` | Tidak tersedia pada implementasi kode terlampir |

### B. Endpoint Buku

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/buku` | Menampilkan semua buku |
| GET | `/buku/:id` | Detail buku berdasarkan ID |
| POST | `/buku` | Menambahkan buku |
| PUT | `/buku/:id` | Mengganti seluruh data buku |
| PATCH | `/buku/:id` | Memperbarui sebagian data buku |
| DELETE | `/buku/:id` | Menghapus buku |

Filter buku:
- `/buku?judul=...`
- `/buku?penulis=...`

### C. Endpoint Anggota

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/anggota` | Menampilkan semua anggota |
| GET | `/anggota/:id` | Detail anggota berdasarkan ID |
| POST | `/anggota` | Menambahkan anggota |
| PUT | `/anggota/:id` | Mengganti seluruh data anggota |
| PATCH | `/anggota/:id` | Memperbarui sebagian data anggota |
| DELETE | `/anggota/:id` | Menghapus anggota |

## 5. Struktur Data

### A. Data Buku

| Field | Tipe Data | Keterangan |
|---|---|---|
| judul | String | Judul buku |
| penulis | String | Nama penulis |
| tahun | Integer | Tahun terbit |
| stok | Integer | Jumlah stok buku |

### B. Data Anggota

| Field | Tipe Data | Keterangan |
|---|---|---|
| nama | String | Nama anggota |
| nim | String | Nomor induk mahasiswa |
| jurusan | String | Jurusan anggota |

## 6. Instalasi dan Menjalankan Proyek

### A. Instalasi Dependencies

```bash
npm install
```

### B. Konfigurasi Environment

Buat file `.env` dan sesuaikan konfigurasi database:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3009
```

### C. Migrasi Database

```bash
npx prisma migrate dev
```

### D. Menjalankan Aplikasi

Jalankan aplikasi menggunakan script yang tersedia pada `package.json`.

```bash
npm start
```

API berjalan pada alamat:

```text
http://localhost:3009
```

## 7. Validasi dan Penanganan Error

API dilengkapi dengan validasi data dan penanganan kesalahan menggunakan beberapa HTTP status code:

| Status Code | Keterangan |
|---|---|
| 201 | Data berhasil ditambahkan |
| 204 | Data berhasil dihapus |
| 400 | Request atau input tidak valid |
| 404 | Data atau endpoint tidak ditemukan |
| 409 | Terjadi duplikasi data |
| 500 | Terjadi kesalahan pada server |

## 8. Pengujian API

Pengujian API dilakukan menggunakan Postman dengan alamat dasar:

```text
http://localhost:3009
```

Pengujian mencakup seluruh endpoint buku dan anggota, mulai dari menampilkan, menambahkan, memperbarui, hingga menghapus data.

## 9. Penutup

REST API Sistem Informasi Perpustakaan ini dibuat sebagai implementasi pembelajaran backend development dengan menerapkan Express.js, Prisma ORM, dan SQLite. Proyek ini mencakup pengelolaan data buku dan anggota, operasi CRUD, validasi input, middleware, serta penanganan error dalam pengembangan REST API.