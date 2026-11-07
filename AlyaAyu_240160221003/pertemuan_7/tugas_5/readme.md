# REST API Sistem Informasi Perpustakaan

## 1. Deskripsi Proyek

REST API Sistem Informasi Perpustakaan merupakan aplikasi backend yang digunakan untuk mengelola data buku pada sistem perpustakaan. Aplikasi ini dikembangkan menggunakan Node.js, Express.js, TypeScript, dan Prisma ORM dengan database SQLite.

API menyediakan operasi CRUD (*Create, Read, Update, Delete*) untuk menambahkan, menampilkan, memperbarui, dan menghapus data buku.

## 2. Teknologi yang Digunakan

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- Postman

## 3. Fitur API

- Menampilkan seluruh data buku.
- Menampilkan detail buku berdasarkan ID.
- Menambahkan data buku baru.
- Memperbarui data buku.
- Menghapus data buku.
- Memeriksa status API melalui endpoint health check.

## 4. Daftar Endpoint

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Informasi API |
| GET | `/health` | Memeriksa status API |
| GET | `/buku` | Menampilkan seluruh data buku |
| GET | `/buku/:id` | Menampilkan detail buku |
| POST | `/buku` | Menambahkan data buku |
| PATCH | `/buku/:id` | Memperbarui data buku |
| DELETE | `/buku/:id` | Menghapus data buku |

## 5. Instalasi dan Menjalankan Proyek

### A. Instalasi Dependencies

```bash
npm install
```

### B. Konfigurasi Environment

Buat file `.env` dan sesuaikan konfigurasi berikut:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3009
```

### C. Migrasi Database

Jalankan perintah berikut untuk menerapkan migrasi database:

```bash
npx prisma migrate dev
```

### D. Menjalankan Aplikasi

```bash
npm start
```

API berjalan pada alamat:

```text
http://localhost:3009
```

## 6. Pengujian API

Pengujian endpoint dilakukan menggunakan Postman dengan alamat dasar:

```text
http://localhost:3009
```

Endpoint yang dapat diuji:

- GET `/buku`
- GET `/buku/:id`
- POST `/buku`
- PATCH `/buku/:id`
- DELETE `/buku/:id`

## 7. Penanganan Error

API memiliki mekanisme penanganan error dengan beberapa HTTP status code:

- **400 Bad Request** – Request tidak valid.
- **404 Not Found** – Endpoint atau data tidak ditemukan.
- **500 Internal Server Error** – Terjadi kesalahan pada server.
- **204 No Content** – Data berhasil dihapus.

## 8. Penutup

REST API Sistem Informasi Perpustakaan ini dibuat sebagai implementasi pembelajaran backend development menggunakan Express.js, TypeScript, dan Prisma ORM. Proyek ini menerapkan konsep REST API, pengelolaan database, operasi CRUD, serta pengujian endpoint menggunakan Postman.