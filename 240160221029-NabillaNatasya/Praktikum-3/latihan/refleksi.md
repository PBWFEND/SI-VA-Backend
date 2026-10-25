# Refleksi Pertemuan 3

**Nama:** Nabilla Natasya Putri

**NPM:** 240160221029

## 1. Tiga Konsep yang Dipelajari

### a. HTTP Server dan Routing

HTTP server memungkinkan aplikasi menerima dan memberikan respons terhadap permintaan dari client. Saya menggunakan modul bawaan `node:http` untuk membuat server tanpa Express. Saya juga mempelajari routing sederhana untuk membedakan endpoint `/`, `/health`, dan `/students` berdasarkan method dan URL yang diminta.

### b. Environment Variable

Environment variable digunakan untuk menyimpan konfigurasi aplikasi, seperti nama aplikasi, port server, dan kode mata kuliah. Saya menggunakan `COURSE_CODE` dengan nilai default `CPMK115`. Dari praktikum ini, saya memahami bahwa nilai konfigurasi dapat diubah melalui environment variable tanpa harus mengubah kode program secara langsung.

### c. Membaca File JSON dan Penanganan Error

Saya mempelajari cara membaca file JSON menggunakan `readFile` dari modul `node:fs/promises`, kemudian mengubah isinya menjadi data JavaScript menggunakan `JSON.parse()`. Saya menerapkannya melalui fungsi `bacaJSON(namaFile)` untuk mengambil data mahasiswa pada endpoint `/students`. Saya juga menggunakan `try/catch` untuk menangani kesalahan ketika proses pembacaan file gagal.

## 2. Hal yang Masih Membingungkan

Hal yang masih cukup membingungkan bagi saya adalah penanganan error pada proses asynchronous, terutama ketika file JSON tidak ditemukan. Saya masih perlu memahami lebih dalam bagaimana error diteruskan menggunakan `throw`, ditangkap oleh `try/catch`, dan dikembalikan sebagai respons HTTP yang sesuai. Selain itu, saya perlu lebih memahami perbedaan status HTTP 200 OK dan 404 Not Found saat melakukan pengujian endpoint.