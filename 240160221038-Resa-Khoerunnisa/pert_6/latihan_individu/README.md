# Praktikum Back End — Pertemuan 6

## Latihan Individu Database dan ORM Prisma

**Nama:** Resa Khoerunnisa  
**NIM:** 240160221038  
**Program Studi:** Sistem Informasi

### 1. Deskripsi
Latihan ini merupakan implementasi Database dan ORM menggunakan Prisma ORM dengan database SQLite pada Node.js dan Express.js.

### 2. Teknologi
- Node.js
- Express.js 5
- Prisma ORM 7
- SQLite
- Postman

### 3. Fitur API
1. GET `/pengguna` — Menampilkan seluruh data pengguna.
2. GET `/pengguna/:nim` — Menampilkan pengguna berdasarkan NIM.
3. POST `/pengguna` — Menambahkan data pengguna.
4. PATCH `/pengguna/:nim` — Memperbarui data pengguna.
5. DELETE `/pengguna/:nim` — Menghapus data pengguna.

### 4. Cara Menjalankan
1. Instal dependensi menggunakan `npm install`.
2. Generate Prisma Client menggunakan `npx prisma generate`.
3. Jalankan migrasi database menggunakan `npx prisma migrate dev`.
4. Jalankan server menggunakan `node --experimental-strip-types latihan.ts`.

### 5. Pengujian
Pengujian API dilakukan menggunakan Postman dengan metode GET, POST, PATCH, dan DELETE.

Bukti hasil pengujian tersedia pada folder `hasil`.
