# Laporan Pengujian API Sistem Absensi — Latihan Individu Pertemuan 8

Dokumentasi pengujian otomatis (*automated integration & persistence testing*) untuk memverifikasi fungsionalitas CRUD, validasi input, kepatuhan kode status HTTP, dan persistensi basis data fisik SQLite pada REST API Sistem Absensi.

---

## 1. Identitas Tugas

* **Mata Kuliah:** Praktikum Backend Web Development (SI-VA-Backend)
* **Pertemuan:** Pertemuan 8 — Pengujian REST API dan Persistensi Basis Data
* **Tugas:** Latihan Individu Pertemuan 8
* **Nama Mahasiswa:** Nabilla Natasya
* **NIM:** 240160221029
* **Program Studi:** Sistem Informasi
* **Kelas:** SI-VA
* **Direktori Tugas:** `240160221029-NabillaNatasya/Pertemuan-8/Latihan-Individu/`

---

## 2. Tujuan Pengujian

Tujuan dari pengujian pada Latihan Individu Pertemuan 8 adalah:
1. **Memverifikasi Kontrak RESTful API:** Memastikan seluruh endpoint utama API Absensi (`GET /`, `GET /api/health`, `GET /absensi`, `GET /absensi/:id`, `POST /absensi`, `PATCH /absensi/:id`, `PUT /absensi/:id`, dan `DELETE /absensi/:id`) bekerja sesuai standar HTTP (kode status 200, 201, 204, 400, dan 404).
2. **Ketahanan Gerbang Validasi Input:** Menguji ketahanan validasi pada lapisan Controller terhadap payload kosong, kesalahan tipe data, field kosong/spasi, string tanggal tidak valid, format status di luar domain (`Hadir`, `Izin`, `Sakit`, `Alpa`), dan ID tidak valid dengan memastikan status HTTP 400 Bad Request dikembalikan dengan pesan yang spesifik.
3. **Persistensi Basis Data Fisik SQLite (`prisma/dev.db`):** Membuktikan bahwa data yang dibuat melalui endpoint POST tetap tersimpan secara fisik di piringan disk lokal dan dapat diakses kembali secara utuh setelah server Express dimatikan sepenuhnya dan di-restart.
4. **Integritas Basis Data:** Memastikan integritas basis data tetap bersih tanpa meninggalkan artefak data sementara uji.

---

## 3. Objek Pengujian dan Lokasi Proyek

* **Lokasi Objek Pengujian:**  
  `240160221029-NabillaNatasya/Pertemuan-8/uts/240160221029-Nabilla-Natasya/`
* **Arsitektur API Objek Uji:**  
  Arsitektur berlapis (*Layered Architecture*) yang memisahkan tanggung jawab secara ketat:
  * `app.ts` & `server.ts`: Inisialisasi Express, middleware parsing JSON, routing utama, 404 handler, dan penanganan error global.
  * `src/routes/absensi.routes.ts`: Lapisan routing HTTP Express.
  * `src/controller/absensi.controller.ts`: Lapisan validasi tipe data gerbang `typeof`, validasi domain data absensi, dan penyusunan respon HTTP.
  * `src/service/absensi.service.ts`: Lapisan logika bisnis murni dan manipulasi data melalui Prisma ORM.
  * `src/config/client.ts` & `client.ts`: Singleton instance PrismaClient dengan driver `@prisma/adapter-better-sqlite3`.
* **File Basis Data Fisik:**  
  `240160221029-NabillaNatasya/Pertemuan-8/uts/240160221029-Nabilla-Natasya/prisma/dev.db`

---

## 4. Teknologi yang Digunakan

| Komponen | Paket / Teknologi | Versi | Peran dalam Proyek & Pengujian |
|---|---|:---:|---|
| Runtime | Node.js | `>= 22.6.0` | Menjalankan server dan skrip pengujian via native TypeScript execution (`--experimental-strip-types`) |
| Web Framework | `express` | `^5.3.0` | Framework server HTTP dan routing API objek uji |
| ORM Client | `@prisma/client` | `^7.10.1` | Object-Relational Mapping untuk kueri data |
| Database Adapter | `@prisma/adapter-better-sqlite3` | `^7.10.1` | Driver adapter SQLite resmi untuk Prisma v7 |
| Database Engine | `better-sqlite3` | `^13.0.3` | Driver SQLite berkinerja tinggi |
| Konfigurasi Env | `dotenv` | `^18.0.9` | Pemuat variabel lingkungan database dan port |
| Bahasa Pemrograman | `typescript` | `^7.0.2` | Compiler dan pemeriksaan tipe statis |
| CLI Perkakas | `prisma` | `^7.10.1` | Prisma CLI untuk migrasi dan generate client |

---

## 5. Daftar Skenario Pengujian Endpoint dan Validasi Negatif

Pengujian fungsional dan pengujian negatif diimplementasikan pada skrip [`test-latihan-8.ts`](./test-latihan-8.ts) dengan mencakup 28 skenario uji:

### Aturan Validasi Lapisan Controller (`absensi.controller.ts`)
* **ID:** Wajib bilangan bulat positif (`Number.isInteger(num) && num > 0`). Nilai string alfabet, negatif, atau nol ditolak (HTTP 400).
* **NIM:** Wajib berupa teks dan tidak boleh string kosong/spasi.
* **Nama:** Wajib berupa teks dan tidak boleh string kosong/spasi.
* **Tanggal:** Wajib string format tanggal yang valid (`!isNaN(Date.parse(tanggal))`).
* **Status:** Wajib bernilai salah satu dari domain: `["Hadir", "Izin", "Sakit", "Alpa"]`.
* **Keterangan:** Opsional, jika disertakan harus bertipe string.

### A. Pengujian Endpoint Utama & CRUD
1. **GET `/`** — Informasi status server API dan identitas mahasiswa (Status 200 OK).
2. **GET `/api/health`** — Pemeriksaan kesehatan koneksi API dan basis data SQLite (Status 200 OK).
3. **GET `/absensi`** — Mengambil seluruh daftar data absensi pada kondisi awal (Status 200 OK).
4. **POST `/absensi`** — Menambahkan record absensi baru lengkap dengan keterangan (Status 201 Created).
5. **POST `/absensi`** — Menambahkan record absensi dengan keterangan opsional / null (Status 201 Created).
6. **GET `/absensi/:id`** — Mengambil detail data absensi yang baru dibuat (Status 200 OK).
7. **PATCH `/absensi/:id`** — Memperbarui sebagian field absensi secara parsial (Status 200 OK).
8. **PUT `/absensi/:id`** — Memperbarui data absensi melalui PUT (Status 200 OK).
9. **DELETE `/absensi/:id`** — Menghapus data absensi uji (Status 204 No Content).
10. **GET `/absensi/:id`** — Memastikan data uji telah terhapus dari basis data (Status 404 Not Found).

### B. Pengujian Negatif POST `/absensi` (Status 400 Bad Request)
11. **Payload body kosong `{}`**.
12. **Field `nim` kosong atau hanya berisi spasi**.
13. **Field `nama` bernilai string kosong**.
14. **Field `tanggal` format tidak valid** (misal: `"bukan-tanggal-valid"`).
15. **Field `status` di luar domain resmi** (misal: `"Bolos"`).
16. **Field `keterangan` bertipe salah** (misal: number alih-alih string).

### C. Pengujian Negatif Parameter ID & Endpoint Tambahan
17. **GET `/absensi/:id`** — Parameter ID berupa teks alfabet (`/absensi/abc`) (Status 400).
18. **GET `/absensi/:id`** — Parameter ID berupa bilangan negatif (`/absensi/-10`) (Status 400).
19. **GET `/absensi/:id`** — Parameter ID berupa angka nol (`/absensi/0`) (Status 400).
20. **GET `/absensi/:id`** — ID tidak terdaftar di database (`/absensi/999999`) (Status 404 Not Found).
21. **PATCH `/absensi/:id`** — Payload body kosong `{}` (Status 400).
22. **PATCH `/absensi/:id`** — Nilai status di luar domain (`"Libur"`) (Status 400).
23. **PATCH `/absensi/:id`** — ID tidak terdaftar di database (Status 404).
24. **DELETE `/absensi/:id`** — Parameter ID berupa teks alfabet (Status 400).
25. **DELETE `/absensi/:id`** — ID tidak terdaftar / sudah terhapus (Status 404).
26. **GET `/rute-acak-tidak-ada`** — Middleware 404 untuk rute yang tidak terdaftar (Status 404).

### D. Pembersihan & Verifikasi Integritas
27. **DELETE `/absensi/:id`** — Pembersihan data uji kedua (Status 204).
28. **GET `/absensi`** — Verifikasi integritas jumlah baris database akhir kembali bersih (0 baris).

---

## 6. Daftar Tahapan Pengujian Persistensi Basis Data

Pengujian persistensi diimplementasikan pada skrip [`test-persistence.ts`](./test-persistence.ts) dengan mencakup 9 tahapan pengujian siklus restart server:

| Langkah | Tahap Pengujian | Status Diharapkan | Hasil |
|:---:|---|:---:|:---:|
| 1 | Pencatatan data awal basis data | `0 baris` | **PASS** |
| 2 | Pembuatan data absensi uji pada Server Sesi 1 (`POST /absensi`) | `201 Created` | **PASS** |
| 3 | Pembacaan data sebelum restart pada Server Sesi 1 (`GET /absensi/:id`) | `200 OK` | **PASS** |
| 4 | Shutdown server sesi 1 & diskoneksi koneksi basis data | *Server Closed* | **PASS** |
| 5 | Restart server sesi 2 (menjalankan server pada proses baru) | *Server Restarted* | **PASS** |
| 6 | Verifikasi data fisik tetap utuh pasca-restart (`GET /absensi/:id`) | `200 OK` | **PASS** |
| 7 | Pembersihan data uji sementara (`DELETE /absensi/:id`) | `204 No Content` | **PASS** |
| 8 | Verifikasi data sudah tidak ada (`GET /absensi/:id`) | `404 Not Found` | **PASS** |
| 9 | Verifikasi integritas jumlah baris database akhir | `0 baris` | **PASS** |

---

## 7. Cara Menjalankan Skrip Pengujian

### Langkah 1: Masuk ke Direktori Latihan Pertemuan 8
```powershell
cd D:\SI-VA-Backend\240160221029-NabillaNatasya\Pertemuan-8\Latihan-Individu
```

### Langkah 2: Menjalankan Pengujian Fungsional dan Validasi Negatif (28 Skenario)
* **PowerShell (Windows):**
  ```powershell
  $env:DATABASE_URL = "file:../uts/240160221029-Nabilla-Natasya/prisma/dev.db"
  node --experimental-strip-types test-latihan-8.ts
  ```

### Langkah 3: Menjalankan Pengujian Persistensi dan Siklus Restart (9 Tahapan)
* **PowerShell (Windows):**
  ```powershell
  $env:DATABASE_URL = "file:../uts/240160221029-Nabilla-Natasya/prisma/dev.db"
  node --experimental-strip-types test-persistence.ts
  ```

---

## 8. Kesimpulan

Berdasarkan seluruh hasil pengujian yang telah dilaksanakan pada Latihan Individu Pertemuan 8:
1. **Kepatuhan Kontrak REST API:** REST API Sistem Absensi terbukti mematuhi standar perancangan RESTful API dengan kode status yang tepat (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, dan `404 Not Found`).
2. **Ketahanan Validasi Input:** Lapisan Controller berhasil menolak seluruh data yang tidak valid (string kosong, ID non-numerik, format tanggal cacat, nilai status di luar domain, dan payload kosong) sebelum menyentuh lapisan database.
3. **Persistensi Terverifikasi Penuh:** Basis data SQLite terbukti bekerja secara persisten (*non-volatile storage*). Data berhasil tersimpan ke disk fisik (`dev.db`) dan tidak hilang saat proses server Express dimatikan secara total maupun di-restart.
4. **Kebersihan dan Integritas Basis Data:** Seluruh pengujian membersihkan data uji secara otomatis pada akhir pengujian, menjaga jumlah baris database tetap bersih (0 baris).
