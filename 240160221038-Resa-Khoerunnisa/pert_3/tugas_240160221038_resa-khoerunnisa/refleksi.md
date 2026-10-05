# Refleksi Tugas 2

## Penggunaan AI

Dalam pengerjaan tugas ini, AI digunakan sebagai bantuan untuk memahami
konsep Node.js, module ESM, HTTP Server, routing, environment variable,
dan operasi file asynchronous.

AI juga membantu dalam memberikan contoh kode dan menjelaskan langkah
pengujian agar lebih mudah dipahami.

Kode tetap diperiksa dan diuji secara langsung menggunakan Node.js.

## Hasil Pengujian

Pengujian dilakukan terhadap beberapa endpoint:

1. `GET /` berhasil menampilkan informasi aplikasi.
2. `GET /health` berhasil menampilkan status server.
3. `GET /students` berhasil menampilkan data mahasiswa dari file JSON.
4. Endpoint yang tidak tersedia menghasilkan response 404.
5. Environment variable `COURSE_CODE` berhasil diubah.

## Hal yang Masih Perlu Dipahami

Saya masih perlu memahami lebih lanjut mengenai cara kerja HTTP Server,
routing, asynchronous programming, dan penggunaan environment variable
pada Node.js.

Saya juga perlu lebih memahami cara membaca dan menulis file menggunakan
module `node:fs/promises`.

## Kesimpulan

Melalui tugas ini saya memahami dasar pembuatan HTTP Server sederhana
menggunakan Node.js tanpa Express.js. Saya juga memahami penggunaan
module ESM, konfigurasi aplikasi, endpoint GET, response JSON, response
404, serta operasi file asynchronous.