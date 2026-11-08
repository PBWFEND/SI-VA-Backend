/**
 * ============================================================
 * AKTIVITAS KELOMPOK — PERTEMUAN 3
 * ============================================================
 * Mata Kuliah : Praktikum Backend
 *
 * Anggota Kelompok:
 * 1. Resa Khoerunnisa - 240160221038
 * 2. Aldi Restu Fauzi - 240160221001
 * 3. Khoirunnisa Shaleha - 240160221018
 * ============================================================
 */

/*
 * ============================================================
 * 1. ANALISIS RUNTIME
 * ============================================================
 *
 * API Browser:
 * - fetch()       : digunakan untuk melakukan request HTTP
 * - localStorage  : digunakan untuk menyimpan data di browser
 * - document      : digunakan untuk mengakses elemen HTML
 *
 * API Node.js:
 * - node:http          : digunakan untuk membuat HTTP Server
 * - node:fs/promises   : digunakan untuk membaca dan menulis file
 * - process            : digunakan untuk mengakses environment
 *                        dan informasi proses Node.js
 */


/*
 * ============================================================
 * 2. PERANCANGAN MODULE
 * ============================================================
 *
 * File dipisahkan agar kode lebih rapi dan mudah dikelola.
 *
 * Struktur module:
 *
 * project/
 * ├── config.js
 * ├── server.js
 * └── data/
 *     └── students.json
 *
 * Penjelasan:
 * - config.js
 *   Berisi konfigurasi aplikasi seperti nama aplikasi,
 *   port, environment, dan course code.
 *
 * - server.js
 *   Berisi HTTP Server, routing, endpoint, dan response JSON.
 *
 * - data/students.json
 *   Berisi data mahasiswa yang dibaca oleh server.
 */


/*
 * ============================================================
 * 3. UJI ENDPOINT
 * ============================================================
 *
 * Hasil pengujian endpoint:
 *
 * 1. GET /
 *    Status : 200
 *    Hasil  : Berhasil menampilkan informasi aplikasi.
 *
 * 2. GET /health
 *    Status : 200
 *    Hasil  : Berhasil menampilkan status server.
 *
 * 3. GET /students
 *    Status : 200
 *    Hasil  : Berhasil menampilkan data mahasiswa.
 *
 * 4. GET /tidak-ada
 *    Status : 404
 *    Hasil  : Endpoint tidak ditemukan.
 *
 * Status code 200 digunakan untuk menunjukkan bahwa request
 * berhasil diproses.
 *
 * Status code 404 digunakan ketika endpoint yang diminta
 * tidak tersedia.
 */


/*
 * ============================================================
 * 4. DISKUSI ERROR
 * ============================================================
 *
 * Contoh kesalahan:
 *
 * Nama file yang tersedia:
 * students.json
 *
 * Tetapi program mencoba membaca:
 * student.json
 *
 * Maka Node.js akan menghasilkan error karena file tersebut
 * tidak ditemukan.
 *
 * Kesalahan tersebut dapat ditangani menggunakan try-catch
 * agar program dapat memberikan pesan error yang jelas.
 *
 * Contoh:
 *
 * try {
 *   const data = await readFile("./data/students.json", "utf8");
 * } catch (error) {
 *   console.log("Gagal membaca file:", error.message);
 * }
 */


/*
 * ============================================================
 * KESIMPULAN
 * ============================================================
 *
 * Berdasarkan aktivitas kelompok, pemisahan module membuat
 * program Node.js menjadi lebih terstruktur dan mudah dipahami.
 *
 * config.js digunakan untuk menyimpan konfigurasi, server.js
 * digunakan untuk HTTP Server dan routing, sedangkan file JSON
 * digunakan untuk menyimpan data.
 *
 * Pengujian endpoint juga menunjukkan bahwa status 200
 * digunakan ketika request berhasil, sedangkan status 404
 * digunakan ketika endpoint tidak ditemukan.
 *
 * Penggunaan try-catch membantu menangani error, misalnya
 * ketika file yang ingin dibaca tidak tersedia.
 */