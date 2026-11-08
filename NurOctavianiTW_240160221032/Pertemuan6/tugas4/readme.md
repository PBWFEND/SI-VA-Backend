# Tugas 4 — REST API Sistem Informasi Perpustakaan dengan Prisma

**Nama:** Nur Octaviani Tri Wulandari  
**NIM:** 240160221032  
**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Pertemuan:** 6  
**Port:** `3008`

---

REST API untuk mengelola data perpustakaan menggunakan Node.js, Express.js, TypeScript, Prisma ORM 7, dan SQLite.

API menyediakan pengelolaan data buku dan anggota perpustakaan dengan operasi CRUD.

## Teknologi

- Node.js
- Express.js
- TypeScript
- Prisma ORM 7
- SQLite
- Postman untuk pengujian API

## Struktur Data

### Model Buku

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | Integer | Primary key, dibuat otomatis |
| `judul` | String | Judul buku |
| `penulis` | String | Nama penulis |
| `tahun` | Integer | Tahun terbit |
| `stok` | Integer | Jumlah stok buku |

### Model Anggota

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | Integer | Primary key, dibuat otomatis |
| `nama` | String | Nama anggota |
| `nim` | String | Nomor induk mahasiswa, harus unik |
| `jurusan` | String | Program studi anggota |

### Model Pengguna

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | Integer | Primary key, dibuat otomatis |
| `nim` | String | Nomor induk mahasiswa, harus unik |
| `nama` | String | Nama pengguna |
| `email` | String | Email pengguna, harus unik |
| `role` | String | Peran pengguna |

## Persyaratan

- Node.js yang mendukung `--experimental-strip-types`
- npm
- SQLite

## Instalasi

1. Clone atau unduh repository.
2. Masuk ke direktori project Sistem Informasi Perpustakaan.
3. Instal dependensi:

   ```bash
   npm install
   ```

4. Buat file `.env` dan sesuaikan konfigurasi database:

   ```env
   DATABASE_URL="file:./prisma/dev.db"
   PORT=3008
   ```

5. Buat dan terapkan migrasi database:

   ```bash
   npx prisma migrate dev --name init
   ```

6. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

7. Jalankan server dalam mode pengembangan:

   ```bash
   npm run dev
   ```

Server berjalan pada `http://localhost:3008`.

## Endpoint API

### Endpoint Buku

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/buku` | Mengambil semua data buku |
| GET | `/buku/:id` | Mengambil detail buku berdasarkan ID |
| POST | `/buku` | Menambahkan buku |
| PATCH | `/buku/:id` | Memperbarui data buku |
| DELETE | `/buku/:id` | Menghapus buku |

### Endpoint Anggota

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/anggota` | Mengambil semua data anggota |
| GET | `/anggota/:id` | Mengambil detail anggota berdasarkan ID |
| POST | `/anggota` | Menambahkan anggota |
| PATCH | `/anggota/:id` | Memperbarui data anggota |
| DELETE | `/anggota/:id` | Menghapus anggota |

## Contoh Request

### 1. POST — Menambahkan Buku

`POST /buku`

Header:

```http
Content-Type: application/json
```

Body:

```json
{
  "judul": "Belajar Node.js",
  "penulis": "Andi",
  "tahun": 2024,
  "stok": 5
}
```

### 2. PATCH — Memperbarui Buku

`PATCH /buku/1`

```json
{
  "stok": 10
}
```

Kirim hanya field yang ingin diperbarui.

### 3. DELETE — Menghapus Buku

`DELETE /buku/1`

Tidak memerlukan request body.

### 4. POST — Menambahkan Anggota

`POST /anggota`

Header:

```http
Content-Type: application/json
```

Body:

```json
{
  "nama": "Nur Octaviani Tri Wulandari",
  "nim": "240160221032",
  "jurusan": "Sistem Informasi"
}
```

### 5. PATCH — Memperbarui Anggota

`PATCH /anggota/1`

```json
{
  "jurusan": "Sistem Informasi"
}
```

Kirim hanya field yang ingin diperbarui.

### 6. DELETE — Menghapus Anggota

`DELETE /anggota/1`

Tidak memerlukan request body.

## Validasi dan Status HTTP

- `200 OK`: permintaan berhasil.
- `201 Created`: data berhasil ditambahkan.
- `204 No Content`: data berhasil dihapus tanpa response body.
- `400 Bad Request`: input tidak valid atau field wajib tidak lengkap.
- `404 Not Found`: data buku atau anggota tidak ditemukan.
- `409 Conflict`: terjadi duplikasi