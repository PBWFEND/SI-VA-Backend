# Latihan Individu — Pertemuan 6

**Mahasiswa:** Sarah Azkiya  
**NIM:** 240160221057  

## Deskripsi
Latihan individu ini mengimplementasikan model `Pengguna` menggunakan Prisma ORM dan database SQLite sesuai §14 panduan praktikum.

## Model Pengguna
- `id` (Int, PK, Autoincrement)
- `nim` (String, Unique)
- `nama` (String)
- `email` (String, Unique)
- `role` (String, default "mahasiswa")

## Endpoint API Latihan
| Method | Endpoint | Status Sukses | Deskripsi |
|---|---|---|---|
| GET | `/pengguna` | 200 | Mengambil seluruh daftar pengguna |
| GET | `/pengguna/:nim` | 200 / 404 | Mengambil detail pengguna berdasarkan NIM (404 jika tidak ditemukan) |
| POST | `/pengguna` | 201 / 400 / 409 | Menambahkan data pengguna baru dengan validasi lengkap |
| PATCH | `/pengguna/:nim` | 200 / 400 / 404 / 409 | Memperbarui nama, email, atau role pengguna |
| DELETE | `/pengguna/:nim` | 204 / 404 | Menghapus data pengguna (status 204 tanpa body) |

## Cara Menjalankan
1. Instal dependensi:
   ```bash
   npm install
   ```
2. Salin `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
3. Jalankan migrasi:
   ```bash
   npx prisma migrate dev --name init_pengguna
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Jalankan server latihan:
   ```bash
   node --experimental-strip-types latihan.ts
   ```

