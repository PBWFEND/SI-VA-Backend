# Tugas 3 — Perancangan dan Implementasi RESTful API Sistem Informasi Perpustakaan

**Nama:** Nur Octaviani Tri Wulandari  
**NIM:** 240160221032  
**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Project:** Sistem Informasi Perpustakaan  
**Port:** `3008`

---

## 1. Deskripsi

Tugas ini mengimplementasikan RESTful API untuk pengelolaan data perpustakaan menggunakan Node.js, Express.js, TypeScript, Prisma ORM, dan SQLite.

API menyediakan fitur pengelolaan data buku dan anggota perpustakaan, mulai dari mengambil seluruh data, melihat detail berdasarkan ID, menambahkan data baru, memperbarui sebagian data, hingga menghapus data.

Data disimpan menggunakan database SQLite yang dikelola melalui Prisma ORM sehingga data dapat tersimpan secara permanen.

## 2. Teknologi

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- Postman untuk pengujian API

## 3. Cara Menjalankan Project

Pastikan Node.js sudah terpasang.

1. Buka terminal pada folder project Sistem Informasi Perpustakaan.
2. Instal dependensi:

   ```bash
   npm install
   ```

3. Siapkan konfigurasi database pada file `.env`:

   ```env
   DATABASE_URL="file:./prisma/dev.db"
   PORT=3008
   ```

4. Jalankan migrasi database:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

6. Jalankan server:

   ```bash
   npm run dev
   ```

7. Server berjalan di:

   `http://localhost:3008`

## 4. Kontrak Endpoint

### A. Endpoint Buku

| Method | Endpoint | Fungsi | Status sukses |
|---|---|---|---|
| GET | `/buku` | Mengambil seluruh data buku | 200 OK |
| GET | `/buku/:id` | Mengambil detail buku berdasarkan ID | 200 OK |
| POST | `/buku` | Menambahkan data buku baru | 201 Created |
| PATCH | `/buku/:id` | Memperbarui sebagian data buku | 200 OK |
| DELETE | `/buku/:id` | Menghapus buku berdasarkan ID | 204 No Content |

### B. Endpoint Anggota

| Method | Endpoint | Fungsi | Status sukses |
|---|---|---|---|
| GET | `/anggota` | Mengambil seluruh data anggota | 200 OK |
| GET | `/anggota/:id` | Mengambil detail anggota berdasarkan ID | 200 OK |
| POST | `/anggota` | Menambahkan anggota baru | 201 Created |
| PATCH | `/anggota/:id` | Memperbarui sebagian data anggota | 200 OK |
| DELETE | `/anggota/:id` | Menghapus anggota berdasarkan ID | 204 No Content |

## 5. Spesifikasi Model Data

Model data didefinisikan pada file `prisma/schema.prisma`.

### A. Model Buku

| Field | Tipe Data | Keterangan |
|---|---|---|
| id