# Refleksi Tugas 2 — Node.js Fundamentals

**Nama:** Della Kartika
**NIM:** 240160221008

## 1. Hal yang Dipelajari

Pada tugas ini saya mempelajari cara membuat HTTP Server sederhana menggunakan Node.js tanpa menggunakan Express.js. Saya juga memahami penggunaan module ESM, konfigurasi aplikasi, environment variable, routing, JSON response, dan HTTP status code.

## 2. Implementasi yang Dilakukan

Saya membuat aplikasi **Sistem Informasi Absensi** dengan tiga endpoint GET, yaitu:

* `GET /`
* `GET /health`
* `GET /students`

Data mahasiswa pada endpoint `/students` dibaca dari file `students.json` menggunakan operasi asynchronous dengan `readFile()`.

Saya juga membuat helper `sendJSON()` agar response dari server dapat dikirim dalam format JSON.

## 3. Penanganan Error

Endpoint yang tidak tersedia akan menghasilkan status `404 Not Found`. Selain itu, kesalahan saat membaca file `students.json` ditangani dengan `try...catch` dan menghasilkan status `500`.

## 4. Kendala

Kendala yang saya temui adalah memahami hubungan antara file konfigurasi, server, dan file JSON. Saya juga perlu memastikan path file `students.json` sesuai agar dapat dibaca oleh server.

## 5. Pemanfaatan AI

Dalam pengerjaan tugas ini, AI digunakan sebagai bantuan untuk memahami struktur project, konsep Node.js, dan membantu menyusun kode. Kode yang digunakan tetap diperiksa, dijalankan, dan dipahami kembali sebelum digunakan.

## 6. Kesimpulan

Melalui tugas ini saya menjadi lebih memahami dasar pembuatan HTTP Server menggunakan Node.js, terutama mengenai module ESM, routing, environment variable, pembacaan file asynchronous, response JSON, dan penanganan error.
