# Latihan Individu Pertemuan 4 — Express.js

## 1. Deskripsi
Latihan ini merupakan implementasi dasar REST API menggunakan Express.js dengan studi kasus pengelolaan data buku.

## 2. Fitur
- Middleware JSON untuk membaca data request.
- Middleware logger untuk mencatat aktivitas request.
- GET `/buku` untuk menampilkan seluruh data buku.
- GET `/buku/:id` untuk menampilkan detail buku berdasarkan ID.
- Query parameter untuk memfilter buku berdasarkan ketersediaan.
- POST `/buku` untuk menambahkan data buku baru.
- Handler 404 untuk menangani endpoint yang tidak ditemukan.


## 3. Cara Menjalankan
1. Buka terminal pada folder `latihan_individu`.
2. Jalankan perintah `npm install` jika Express belum terpasang.
3. Jalankan server menggunakan perintah `npm start`.
4. Buka `http://localhost:3005/buku` melalui browser.

## 4. Daftar Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/buku` | Menampilkan semua buku |
| GET | `/buku/:id` | Menampilkan detail buku |
| GET | `/buku?tersedia=true` | Filter buku tersedia |
| GET | `/buku?tersedia=false` | Filter buku tidak tersedia |
| POST | `/buku` | Menambahkan buku |

## 5. Pengujian
Pengujian dilakukan menggunakan browser dan Postman

Hasil pengujian:
- GET daftar buku berhasil.
- GET detail buku berhasil.
- Filter ketersediaan buku berhasil.
- POST penambahan buku berhasil.
- Server berjalan pada port 3005.

## 6. Kesimpulan
Latihan ini berhasil menerapkan dasar penggunaan Express.js untuk membuat REST API sederhana, menggunakan middleware, route parameter, query parameter, serta pengelolaan data buku.