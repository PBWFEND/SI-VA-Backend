# Refleksi Tugas 2

## 1. Penggunaan AI

Dalam pengerjaan tugas ini, saya menggunakan AI sebagai coding assistant untuk membantu memahami konsep Node.js, ES Module (ESM), HTTP server, routing sederhana, response JSON, serta pembacaan file secara asynchronous.

AI juga membantu memberikan contoh struktur kode, menjelaskan error yang muncul, dan membantu menyusun perintah `curl` untuk melakukan pengujian endpoint.

Kode yang digunakan tetap saya pelajari dan verifikasi dengan menjalankannya secara langsung melalui terminal.

## 2. Hasil Pengujian

Pengujian dilakukan menggunakan `curl` pada server yang berjalan di port 3003.

Hasil pengujian:

- `GET /` → berhasil menampilkan pesan utama dan daftar endpoint.
- `GET /health` → berhasil menampilkan status server `up`.
- `GET /students` → berhasil menampilkan data mahasiswa dari file `data/students.json`.
- `GET /tidak-ada` → berhasil memberikan response endpoint tidak ditemukan.

Selain itu, endpoint `/students` berhasil membaca file JSON menggunakan proses asynchronous.


## 3. Hal yang Masih Perlu Saya Pahami

Saya masih perlu memperdalam cara kerja asynchronous programming pada Node.js, khususnya bagaimana `async/await` bekerja ketika server menangani beberapa request secara bersamaan. Saya juga masih perlu memahami pengelolaan routing yang lebih kompleks dan pemisahan kode server menjadi beberapa module agar project dapat lebih mudah dikembangkan.