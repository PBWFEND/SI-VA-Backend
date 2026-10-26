# Refleksi Tugas 3

**Nama:** Alya Ayu Meysha
**NPM:** 240160221003

## 1. Hal yang Dipelajari

Pada tugas ini saya mempelajari cara membuat API sederhana menggunakan Node.js Native HTTP. Saya belajar membuat HTTP server, menentukan endpoint, membaca data dari file JSON, dan mengirimkan response dalam format JSON.

Saya juga menerapkan konsep asynchronous dengan menggunakan `readFile` dari `node:fs/promises` untuk membaca data buku dan anggota.

## 2. Implementasi yang Dilakukan

Saya membuat API untuk Sistem Informasi Perpustakaan dengan dua resource, yaitu Buku dan Anggota.

Endpoint yang dibuat meliputi:

* `GET /` untuk informasi API.
* `GET /health` untuk mengecek status server.
* `GET /buku` untuk mengambil data buku dari `buku.json`.
* `GET /anggota` untuk mengambil data anggota dari `anggota.json`.

Saya juga menambahkan penanganan error menggunakan status code `404` jika endpoint tidak ditemukan dan `500` jika terjadi kesalahan saat membaca data.

## 3. Hal yang Masih Membingungkan

Hal yang masih cukup membingungkan bagi saya adalah proses asynchronous ketika membaca file menggunakan `readFile` dan penggunaan `async/await`. Saya masih perlu memahami lebih dalam bagaimana proses tersebut bekerja ketika server menerima beberapa request.

## 4. Kesimpulan

Melalui tugas ini saya menjadi lebih memahami dasar pembuatan API menggunakan Node.js Native HTTP. Saya juga memahami bagaimana backend dapat membaca data dari file JSON dan mengirimkannya kepada client dalam bentuk response JSON.

Tugas ini membantu saya memahami hubungan antara endpoint, HTTP method, status code, dan data yang digunakan dalam sebuah API.