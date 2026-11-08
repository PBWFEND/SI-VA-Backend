# Tugas 4 — REST API Mahasiswa dengan Prisma

**Nama:** Aldi Restu Fauzi
**NIM:** 240160221001  
**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Pertemuan:** 6  
**Port:** `3008`

---

REST API untuk mengelola data mahasiswa menggunakan Node.js, Express.js, Prisma ORM, dan SQLite.

## Teknologi

- Node.js
- Express.js
- Prisma ORM 7
- SQLite
- Postman untuk pengujian API

## Struktur Data Mahasiswa

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | Integer | Primary key, dibuat otomatis |
| `nim` | String | Nomor induk mahasiswa, harus unik |
| `nama` | String | Nama mahasiswa |
| `prodi` | String | Program studi |
| `angkatan` | Integer | Tahun angkatan |

## Persyaratan

- Node.js yang mendukung `--experimental-strip-types`
- npm

## Instalasi

1. Clone atau unduh repository.
2. Masuk ke direktori `Tugas-4`.
3. Instal dependensi:

   ```bash
   npm install
   ```

4. Salin `.env.example` menjadi `.env`, kemudian sesuaikan nilainya jika diperlukan.

5. Buat dan terapkan migrasi database:

   ```bash
   npm run prisma:migrate -- --name init_mahasiswa
   ```

6. Generate Prisma Client:

   ```bash
   npm run prisma:generate
   ```

7. Jalankan server dalam mode pengembangan:

   ```bash
   npm run dev
   ```

Server berjalan pada `http://localhost:3008`.

## Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Memeriksa server |
| GET | `/api/health` | Memeriksa koneksi database |
| GET | `/mahasiswa` | Mengambil semua mahasiswa |
| GET | `/mahasiswa/:nim` | Mengambil detail mahasiswa berdasarkan NIM |
| POST | `/mahasiswa` | Menambahkan mahasiswa |
| PATCH | `/mahasiswa/:nim` | Memperbarui data mahasiswa |
| DELETE | `/mahasiswa/:nim` | Menghapus mahasiswa |

### Filter daftar mahasiswa

Filter dapat digunakan secara terpisah atau bersamaan.

```http
GET /mahasiswa?prodi=Sistem%20Informasi
GET /mahasiswa?angkatan=2024
GET /mahasiswa?prodi=Sistem%20Informasi&angkatan=2024
```

### Contoh request POST

`POST /mahasiswa`

Header:

```http
Content-Type: application/json
```

Body:

```json
{
  "nim": "240160221001",
  "nama": "Aldi Restu Fauzi",
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}
```

### Contoh request PATCH

`PATCH /mahasiswa/240160221001`

```json
{
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}
```

Kirim hanya field yang ingin diperbarui.

### Contoh request DELETE

`DELETE /mahasiswa/240160221001`

Tidak memerlukan request body.

## Validasi dan Status HTTP

- `200 OK`: permintaan berhasil.
- `201 Created`: mahasiswa berhasil ditambahkan.
- `400 Bad Request`: input tidak valid atau field wajib tidak lengkap.
- `404 Not Found`: mahasiswa tidak ditemukan.
- `409 Conflict`: NIM sudah terdaftar.
- `500 Internal Server Error`: terjadi kesalahan pada server.

## Database dan Migrasi

Skema database berada di `prisma/schema.prisma`.

File migrasi tersimpan di `prisma/migrations/`. SQLite menggunakan database lokal yang dikonfigurasi melalui `DATABASE_URL` di `.env`.

Jangan mengunggah `.env`, `node_modules`, atau database lokal ke repository.

## Pengujian

API dapat diuji menggunakan Postman atau browser untuk endpoint GET.

Pastikan server berjalan sebelum mengirim request.

Hasil pengujian tersimpan pada folder `screenshot/`:
1. `01-post-mahasiswa.png` — Berhasil menambahkan data mahasiswa.
2. `02-patch-mahasiswa-240160221001.png` — Berhasil memperbarui data mahasiswa NIM 240160221001.
3. `03-delete-mahasiswa-240160221001.png` — Berhasil menghapus data mahasiswa NIM 240160221001.
4. `04-post-mahasiswa-validasi.png` — Validasi field wajib saat POST data mahasiswa.
5. `05-post-mahasiswa-validasi-2.png` — Validasi error format saat POST data mahasiswa.

