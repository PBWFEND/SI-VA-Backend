# Laporan Pengujian API Absensi Mahasiswa — Latihan Individu Pertemuan 8

Dokumentasi pengujian otomatis (*automated integration & persistence testing*) untuk memverifikasi fungsionalitas, validasi input, kepatuhan kode status HTTP, dan persistensi basis data fisik SQLite pada REST API Sistem Informasi Absensi Mahasiswa.

---

## 1. Identitas Tugas

* **Mata Kuliah:** Pengembangan Aplikasi Web Backend (SI-VA-Backend)
* **Pertemuan:** Pertemuan 8 — Pengujian REST API dan Persistensi Basis Data
* **Tugas:** Latihan Individu Pertemuan 8
* **Nama Mahasiswa:** Marsya Nurdrianti
* **NIM:** 240160221022
* **Kelas:** SI-VA
* **Direktori Tugas:** `Marsya-Nurdrianti-240160221022/Pertemuan-8/Latihan-Individu/`

---

## 2. Tujuan Pengujian

Tujuan dari pengujian pada Latihan Individu Pertemuan 8 adalah:
1. Memverifikasi seluruh endpoint utama API Absensi Mahasiswa bekerja sesuai spesifikasi standar RESTful API (kode status `200 OK`, `201 Created`, `204 No Content`, dan `404 Not Found`).
2. Menguji ketahanan gerbang validasi input (pengujian negatif) terhadap field kosong, kesalahan tipe data, nilai status di luar ketentuan (`Hadir`, `Izin`, `Sakit`, `Alpa`), injeksi field tidak dikenal, dan request body kosong dengan memastikan status HTTP `400 Bad Request` dikembalikan secara konsisten.
3. Menguji persistensi basis data fisik SQLite (`prisma/dev.db`) untuk membuktikan bahwa data yang dibuat melalui endpoint POST tetap tersimpan dan dapat diakses kembali setelah server Express dimatikan sepenuhnya dan di-restart pada port baru.
4. Memastikan integritas basis data tetap bersih tanpa meninggalkan artefak data sementara uji (*clean teardown*).

---

## 3. Objek Pengujian dan Lokasi Proyek

* **Lokasi Objek Pengujian:**  
  `Marsya-Nurdrianti-240160221022/Pertemuan-8/uts/240160221022-Marsya-Nurdrianti/`
* **Arsitektur API Objek Uji:**  
  Arsitektur berlapis (*Layered Architecture*) yang memisahkan tanggung jawab secara ketat:
  * `src/app.ts` & `src/server.ts`: Inisialisasi Express, middleware parsing JSON, routing utama `/api/absensi`, middleware 404, dan global error handler.
  * `src/routes/absensi.routes.ts`: Lapisan routing HTTP Express untuk resource absensi.
  * `src/controller/absensi.controller.ts`: Lapisan validasi tipe data gerbang `typeof`, validasi domain data, penolakan field tidak dikenal, dan penyusunan respon HTTP.
  * `src/service/absensi.service.ts`: Lapisan logika bisnis murni dan manipulasi data melalui Prisma ORM.
  * `src/client.ts`: Singleton instance PrismaClient dengan adapter SQLite (@prisma/adapter-libsql).
* **File Basis Data Fisik:**  
  `Marsya-Nurdrianti-240160221022/Pertemuan-8/uts/240160221022-Marsya-Nurdrianti/prisma/dev.db`

---

## 4. Teknologi yang Digunakan

| Komponen | Paket / Teknologi | Versi Deklarasi | Peran dalam Proyek & Pengujian |
|---|---|:---:|---|
| **Runtime** | Node.js | `>= 22.0.0` (uji pada `v24.15.0`) | Menjalankan server dan skrip pengujian via native TypeScript execution (`--experimental-strip-types`) |
| **Web Framework** | `express` | `^5.3.0` | Framework server HTTP dan routing API objek uji |
| **ORM Client** | `@prisma/client` | `^7.10.1` | Object-Relational Mapping untuk kueri data |
| **Database Adapter** | `@prisma/adapter-libsql` | `^7.10.1` | Driver adapter SQLite resmi untuk Prisma v7 |
| **Database Engine** | SQLite | `prisma/dev.db` | Basis data relasional persisten |
| **Konfigurasi Env** | `dotenv` | `^18.0.9` | Pemuat variabel lingkungan database dan port |
| **Bahasa Pemrograman** | `typescript` | `^7.0.2` | Compiler dan pemeriksaan tipe statis |
| **Type Definitions** | `@types/express` & `@types/node` | `^5.0.6` / `^26.6.6` | Definisi tipe statis Express dan Node.js |
| **CLI Perkakas** | `prisma` | `^7.10.1` | Prisma CLI untuk migrasi dan generate client |
| **HTTP Client Uji** | Native Fetch API | Bawaan Node.js | Mengirim HTTP request otomatis ke endpoint uji |

---

## 5. Daftar Skenario Pengujian Endpoint dan Validasi Negatif (25 Skenario)

Pengujian fungsional dan pengujian negatif diimplementasikan pada skrip [`test-latihan-8.ts`](file:///c:/Users/HP/OneDrive/Documents/SI-VA-Backend/Marsya-Nurdrianti-240160221022/Pertemuan-8/Latihan-Individu/test-latihan-8.ts) dengan mencakup 25 skenario uji:

### A. Pengujian Endpoint Utama (8 Skenario)
1. **GET `/api/health`** — Pemeriksaan kesehatan koneksi API dan basis data (Status `200 OK`).
2. **GET `/api/absensi`** — Mengambil seluruh daftar data absensi pada kondisi awal (Status `200 OK`).
3. **POST `/api/absensi`** — Menambahkan record absensi baru dengan payload data valid menggunakan NIM `TEST80000001` (Status `201 Created`).
4. **GET `/api/absensi/:id`** — Mengambil detail data absensi yang baru dibuat (Status `200 OK`).
5. **GET `/api/absensi/:id`** — Mengambil detail absensi dengan ID yang tidak terdaftar (Status `404 Not Found`).
6. **PATCH `/api/absensi/:id`** — Memperbarui sebagian field absensi secara valid (Status `200 OK`).
7. **DELETE `/api/absensi/:id`** — Menghapus data absensi uji (Status `204 No Content` tanpa body).
8. **GET `/api/absensi/:id`** — Memastikan data uji telah terhapus dari basis data (Status `404 Not Found`).

### B. Pengujian Negatif POST `/api/absensi` (12 Skenario - Status 400 Bad Request)
9. **Field `nim` tidak disertakan** pada payload body.
10. **Field `nim` bernilai string kosong** atau hanya berisi karakter spasi.
11. **Field `namaMahasiswa` tidak disertakan** pada payload body.
12. **Field `namaMahasiswa` berupa karakter spasi kosong**.
13. **Field `tanggal` tidak disertakan** pada payload body.
14. **Field `tanggal` bukan format tanggal valid** (misal `"bukan-tanggal-format"`).
15. **Field `status` tidak disertakan** pada payload body.
16. **Nilai `status` di luar daftar valid** (misal `"Bolos"`, hanya diperbolehkan `Hadir`, `Izin`, `Sakit`, `Alpa`).
17. **Tipe data `waktuMasuk` salah** (dikirim berupa number alih-alih string).
18. **Tipe data `keterangan` salah** (dikirim berupa boolean alih-alih string).
19. **Injeksi field asing/tidak dikenal** (payload ditolak jika terdapat field di luar skema).
20. **Payload body berupa format Array**, bukan objek JSON.

### C. Pengujian Negatif PATCH & Validasi ID (5 Skenario - Status 400 & 404)
21. **Payload body kosong `{}`**, tidak ada satu pun field yang dikirim untuk diperbarui (Status `400 Bad Request`).
22. **Field tidak dikenal pada PATCH**, ditolak dengan status `400 Bad Request`.
23. **Nilai status tidak valid pada PATCH**, ditolak dengan status `400 Bad Request`.
24. **ID berformat bukan angka pada URL** (misal `/api/absensi/karakter-bukan-angka`), ditolak dengan status `400 Bad Request`.
25. **PATCH pada ID yang tidak ditemukan**, ditolak dengan status `404 Not Found`.

---

## 6. Daftar Tahapan Pengujian Persistensi Basis Data (7 Tahapan)

Pengujian persistensi diimplementasikan pada skrip [`test-persistence.ts`](file:///c:/Users/HP/OneDrive/Documents/SI-VA-Backend/Marsya-Nurdrianti-240160221022/Pertemuan-8/Latihan-Individu/test-persistence.ts) untuk memverifikasi penyimpanan fisik SQLite melewati siklus mati-hidup server:

| Langkah | Tahap Pengujian | Skenario Tindakan | Ekspektasi | Hasil Aktual | Status |
|:---:|---|---|:---:|:---:|:---:|
| 1 | Pencatatan data awal | Membaca jumlah baris awal di `prisma/dev.db` | Valid | `0 baris` | **PASS** |
| 2 | Pembuatan data uji (Sesi 1) | `POST /api/absensi` pada Server Sesi 1 | `201 Created` | `201 Created` | **PASS** |
| 3 | Verifikasi sebelum shutdown | `GET /api/absensi/:id` pada Server Sesi 1 | `200 OK` | `200 OK` | **PASS** |
| 4 | **Simulasi Restart Server** | Server Sesi 1 dimatikan total via `server.close()`, lalu Server Sesi 2 dinyalakan pada port baru | Berhasil | Server Sesi 2 Aktif | **PASS** |
| 5 | **Verifikasi Persistensi Fisik** | `GET /api/absensi/:id` pada Server Sesi 2 tanpa memori Sesi 1 | `200 OK` | `200 OK` (Data utuh) | **PASS** |
| 6 | Pembersihan data uji | `DELETE /api/absensi/:id` pada Server Sesi 2 | `204 No Content` | `204 No Content` | **PASS** |
| 7 | Verifikasi integritas akhir | `GET /api/absensi/:id` menghasilkan 404 dan jumlah baris kembali ke awal | `0 baris` | `0 baris` | **PASS** |

---

## 7. Cara Menjalankan Skrip Pengujian

### Langkah 1: Masuk ke Direktori Latihan Pertemuan 8
```powershell
cd Marsya-Nurdrianti-240160221022/Pertemuan-8/Latihan-Individu
```

### Langkah 2: Menjalankan Pengujian Fungsional dan Negatif (25 Skenario)
```powershell
node --experimental-strip-types test-latihan-8.ts
```

### Langkah 3: Menjalankan Pengujian Persistensi dan Siklus Restart (7 Tahapan)
```powershell
node --experimental-strip-types test-persistence.ts
```

---

## 8. Kesimpulan

Berdasarkan seluruh hasil pengujian yang telah dilaksanakan pada Latihan Individu Pertemuan 8:
1. **Kepatuhan Kontrak API:** REST API Absensi Mahasiswa terbukti mematuhi standar perancangan RESTful API dengan kode status yang tepat (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).
2. **Ketahanan Validasi Input:** Lapisan Controller berhasil menolak seluruh data cacat (field kosong, tipe data salah, status tidak valid di luar Hadir/Izin/Sakit/Alpa, dan payload kosong) sebelum menyentuh lapisan database.
3. **Persistensi Terverifikasi:** Basis data SQLite terbukti bekerja secara persisten (*non-volatile storage*). Data berhasil disimpan ke file lokal `prisma/dev.db` dan tidak hilang saat server dimatikan secara total maupun di-restart.
4. **Kebersihan dan Integritas Basis Data:** Seluruh pengujian menggunakan identitas data khusus pengujian (`TEST80000001`, `TEST80000002`, `TEST80000003`) dan seluruhnya berhasil dibersihkan otomatis pada akhir pengujian, menjaga jumlah baris database tetap bersih.
