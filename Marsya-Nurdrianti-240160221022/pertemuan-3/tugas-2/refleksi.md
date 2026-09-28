# Refleksi Tugas 2 — Node.js Fundamentals

**Nama:** Marsya Nurdrianti
**NIM:** 240160221022

## 1. Pemahaman yang Diperoleh
Melalui Tugas 2 ini, saya belajar menerapkan Node.js untuk membuat HTTP Server sederhana tanpa menggunakan Express.js. Saya juga mempelajari cara menggunakan module ESM, mengatur konfigurasi melalui environment variable, membuat routing, memberikan response dalam format JSON, serta menggunakan status code HTTP.

## 2. Hasil Pengerjaan
Pada tugas ini saya membuat aplikasi sederhana **Sistem Informasi Absensi** dengan beberapa endpoint, yaitu:

* `GET /`
* `GET /health`
* `GET /students`

Endpoint `/students` mengambil data mahasiswa dari file `students.json`. Proses pembacaan file dilakukan secara asynchronous menggunakan `readFile()` dari module `node:fs/promises`.

Selain itu, saya menggunakan function `sendJSON()` untuk membantu mengatur response agar data yang dikirim server memiliki format JSON yang konsisten.

## 3. Penanganan Kesalahan
Saya menerapkan status `404 Not Found` ketika client mengakses alamat endpoint yang tidak tersedia. Untuk proses pembacaan file JSON, saya menggunakan `try...catch` sehingga apabila file tidak ditemukan atau terjadi kesalahan saat membaca file, server dapat memberikan response error dengan status `500`.

## 4. Kendala yang Dihadapi
Selama mengerjakan tugas, saya masih perlu memahami keterkaitan antara konfigurasi pada `config.js`, proses routing pada `server.js`, dan data yang tersimpan dalam file JSON. Selain itu, penentuan lokasi file menggunakan path juga perlu diperhatikan agar `students.json` dapat ditemukan oleh server.

## 5. Penggunaan AI
Saya menggunakan AI sebagai pendamping dalam memahami materi Node.js, terutama mengenai struktur project, environment variable, routing, pembacaan file JSON, dan penanganan error. Setiap kode yang digunakan tetap saya jalankan dan periksa kembali agar saya memahami fungsi serta cara kerjanya.

## 6. Kesimpulan
Setelah menyelesaikan tugas ini, saya lebih memahami dasar penggunaan Node.js sebagai runtime untuk backend. Saya juga mendapatkan pemahaman mengenai ESM, routing HTTP, environment variable, filesystem asynchronous, JSON response, serta cara menangani error pada server.