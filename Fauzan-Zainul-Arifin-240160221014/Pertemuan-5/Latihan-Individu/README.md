# Pertemuan 5 — Latihan Individu

## Deskripsi

Latihan ini mengimplementasikan RESTful API untuk pengelolaan data mahasiswa menggunakan Node.js dan Express.js.

## Teknologi

- Node.js
- Express.js
- Postman untuk pengujian API

## Cara Menjalankan

1. Buka terminal pada folder Latihan-Individu.
2. Instal dependensi:

   ```bash
   npm install
   ```

3. Jalankan server:

   ```bash
   node latihan.js
   ```

4. Server berjalan pada `http://localhost:3007`.

## Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/mahasiswa` | Mengambil seluruh data mahasiswa |
| GET | `/mahasiswa?prodi=Sistem%20Informasi` | Memfilter mahasiswa berdasarkan prodi |
| GET | `/mahasiswa?angkatan=2024` | Memfilter mahasiswa berdasarkan angkatan |
| GET | `/mahasiswa/:nim` | Mengambil detail mahasiswa berdasarkan NIM |
| POST | `/mahasiswa` | Menambahkan mahasiswa baru |
| PATCH | `/mahasiswa/:nim` | Memperbarui sebagian data mahasiswa |

## Hasil Pengujian

| Method | URL | Status | Hasil |
|---|---|---|---|
| GET | `/mahasiswa` | 200 OK | Berhasil mengambil daftar mahasiswa |
| GET | `/mahasiswa?prodi=Sistem%20Informasi` | 200 OK | Berhasil memfilter berdasarkan prodi |
| GET | `/mahasiswa?angkatan=2024` | 200 OK | Berhasil memfilter berdasarkan angkatan |
| GET | `/mahasiswa/F1D022001` | 200 OK | Detail mahasiswa ditemukan |
| GET | `/mahasiswa/F1D099999` | 404 Not Found | Mahasiswa tidak ditemukan |
| POST | `/mahasiswa` | 201 Created | Mahasiswa berhasil ditambahkan |
| POST | `/mahasiswa` dengan field wajib tidak lengkap | 400 Bad Request | Validasi menolak data tidak lengkap |
| PATCH | `/mahasiswa/F1D022003` | 200 OK | Data mahasiswa berhasil diperbarui |
| PATCH | `/mahasiswa/F1D022003` dengan nama kosong | 400 Bad Request | Validasi menolak data tidak valid |

## Middleware Logger

Middleware logger digunakan untuk mencatat HTTP method dan URL setiap request yang masuk ke server.

## Catatan

Data mahasiswa disimpan sementara dalam array di memori. Data yang ditambahkan atau diperbarui melalui API akan kembali ke kondisi awal ketika server dimulai ulang.

Pengujian dilakukan menggunakan Postman.
