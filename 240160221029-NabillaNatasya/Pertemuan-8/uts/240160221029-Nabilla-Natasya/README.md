# UTS Mini Project Backend: REST API Sistem Absensi

Repositori ini berisi implementasi resmi **UTS Mini Project Backend** berupa layanan RESTful API untuk **Sistem Absensi**. Proyek ini dibangun dengan menerapkan arsitektur berlapis (*layered architecture*: Route, Controller, dan Service) menggunakan Express.js, TypeScript, dan Prisma ORM dengan basis data fisik SQLite.

---

## 1. Identitas Mahasiswa

* **Nama Lengkap:** Nabilla Natasya
* **Nomor Induk Mahasiswa (NIM):** 240160221029
* **Program Studi:** Sistem Informasi
* **Kelas:** SI-VA
* **Mata Kuliah:** Praktikum Backend Web Development
* **Tugas:** UTS Mini Project Backend
* **Studi Kasus:** Sistem Absensi (Resource Tunggal: Absensi)

---

## 2. Deskripsi Sistem Absensi

Sistem Absensi adalah layanan backend RESTful API yang dirancang untuk mengelola data pencatatan kehadiran mahasiswa secara terstruktur, akurat, dan persisten. Sistem ini berfokus pada **satu resource utama (`Absensi`)** yang menyimpan identitas mahasiswa (`nim`, `nama`), tanggal absensi, status kehadiran (`Hadir`, `Izin`, `Sakit`, `Alpa`), dan keterangan opsional.

Layanan ini mendukung seluruh operasi dasar manajemen data (CRUD) dengan validasi input ketat di lapisan Controller, pemisahan logika bisnis di lapisan Service, pengelolaan query melalui Prisma ORM 7, penanganan error terpusat (*central error handler*), serta penyimpanan data fisik ke dalam basis data SQLite (`prisma/dev.db`).

---

## 3. Teknologi yang Digunakan

| Komponen / Pustaka | Versi | Peran dan Fungsi |
|---|:---:|---|
| **Node.js** | `>= 22.6.0` (LTS) | Runtime JavaScript dengan native TypeScript execution (`--experimental-strip-types`) |
| **npm** | `>= 10.0.0` | Package manager resmi pengelolaan dependensi proyek |
| **Express.js** | `^5.3.0` | Framework web minimalis untuk routing HTTP, middleware, dan REST API |
| **TypeScript** | `^7.0.2` | Bahasa pemrograman dengan pemeriksaan tipe statis *type-safety* |
| **Prisma ORM** | `^7.10.1` | Object-Relational Mapping generasi ke-7 untuk pemodelan data dan migrasi |
| **@prisma/client** | `^7.10.1` | Client Prisma yang digenerate untuk eksekusi query data |
| **@prisma/adapter-better-sqlite3** | `^7.10.1` | Driver adapter resmi SQLite untuk Prisma v7 |
| **better-sqlite3** | `^13.0.3` | Mesin driver SQLite berkinerja tinggi (*synchronous & fast*) |
| **dotenv** | `^18.0.9` | Pemuat variabel lingkungan dari berkas `.env` ke `process.env` |

---

## 4. Prasyarat Sistem

Sebelum menjalankan proyek, pastikan perangkat komputer Anda memenuhi prasyarat berikut:
* **Node.js:** Versi `22.6.0` atau yang lebih baru (mendukung flag `--experimental-strip-types`).
* **npm:** Versi `10.0.0` atau yang lebih baru.
* **Sistem Operasi:** Windows 10/11, macOS, atau Linux.

Periksa versi yang terpasang di terminal Anda:
```bash
node -v
npm -v
```

---

## 5. Panduan Instalasi Dependensi

1. Buka terminal dan masuk ke direktori proyek UTS ini:
   ```bash
   cd D:\SI-VA-Backend\240160221029-NabillaNatasya\Pertemuan-8\uts\240160221029-Nabilla-Natasya
   ```
2. Jalankan perintah instalasi dependensi menggunakan npm:
   ```bash
   npm install
   ```

---

## 6. Konfigurasi Variabel Lingkungan (`.env`)

Proyek ini memerlukan berkas `.env` untuk menentukan port server dan lokasi basis data SQLite. Template konfigurasi telah disediakan pada berkas `.env.example`.

Salin berkas template menjadi `.env`:
* **Windows PowerShell:**
  ```powershell
  Copy-Item .env.example .env
  ```
* **Linux / macOS / Bash:**
  ```bash
  cp .env.example .env
  ```

Pastikan isi berkas `.env` memuat:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

---

## 7. Cara Menjalankan Prisma dan Server Aplikasi

### A. Sinkronisasi Basis Data & Generate Prisma Client
Pastikan skema model `Absensi` telah termigrasi dan Prisma Client telah digenerate:
```bash
npx prisma migrate dev --name init_absensi
npx prisma generate
```

### B. Menjalankan Server Mode Produksi (Start)
Menjalankan server menggunakan native strip types Node.js:
```bash
npm start
```

### C. Menjalankan Server Mode Pengembangan (Watch / Dev)
Menjalankan server dengan *file watcher* aktif (otomatis me-restart server saat kode disimpan):
```bash
npm run dev
```

Saat server berhasil berjalan, terminal akan menampilkan banner:
```text
REST API Sistem Absensi aktif di http://localhost:3008 — Nabilla Natasya (240160221029)
```

---

## 8. Struktur Direktori Proyek

Arsitektur direktori proyek mengadopsi standar resmi berlapis (*layered architecture*):

```text
240160221029-Nabilla-Natasya/
├── app.ts                  # Konfigurasi middleware Express, routing, 404, dan central error handler
├── server.ts               # Inisialisasi HTTP server, startup banner, dan graceful shutdown
├── client.ts               # Facade singleton PrismaClient di root proyek
├── prisma.config.ts        # Konfigurasi Prisma 7 (schema path, migrations, datasource URL)
├── package.json            # Definisi dependensi, devDependencies, dan executable scripts
├── package-lock.json       # Kunci versi paket dependensi
├── tsconfig.json           # Konfigurasi compiler TypeScript (Node16 module resolution)
├── .env                    # Berkas variabel lingkungan aktif (PORT, DATABASE_URL)
├── .env.example            # Template variabel lingkungan
├── .gitignore              # Proteksi pengabaian file node_modules, .env, dan dev.db
├── README.md               # Dokumentasi resmi proyek UTS
├── _archive/               # Arsip aman berkas cadangan data lama (tidak ikut dikompilasi)
├── generated/              # Artefak Prisma Client hasil generate
│   └── prisma/
│       ├── client.ts
│       └── models/Absensi.ts
├── prisma/
│   ├── schema.prisma       # Definisi model tunggal Absensi & datasource SQLite
│   ├── dev.db              # Berkas basis data fisik SQLite lokal
│   └── migrations/         # Riwayat migrasi Prisma DDL
│       ├── 20261031090506_init_mahasiswa/
│       └── 20261102103749_init_absensi/
│           └── migration.sql
└── src/
    ├── config/
    │   └── client.ts       # Singleton PrismaClient dengan adapter better-sqlite3
    ├── controller/
    │   └── absensi.controller.ts # Validasi HTTP request, parsing payload, dan format response
    ├── routes/
    │   └── absensi.routes.ts     # Pendaftaran rute endpoint HTTP /absensi
    └── service/
        └── absensi.service.ts    # Logika bisnis, kueri Prisma ORM, dan custom error
```

---

## 9. Daftar Seluruh Endpoint RESTful API

| Method | Endpoint URL | Fungsi Controller | Status Sukses | Deskripsi |
|:---:|---|---|:---:|---|
| **GET** | `/` | inline `app.ts` | `200 OK` | Informasi status API dan identitas mahasiswa |
| **GET** | `/api/health` | inline `app.ts` | `200 OK` | Health check koneksi aktif ke basis data SQLite |
| **GET** | `/absensi` | `absensiController.getAll` | `200 OK` | Mengambil seluruh data absensi (opsi query: `status`, `nim`, `tanggal`) |
| **GET** | `/absensi/:id` | `absensiController.getById` | `200 OK` | Mengambil detail satu data absensi berdasarkan ID |
| **POST** | `/absensi` | `absensiController.create` | `201 Created` | Menambahkan rekaman absensi baru dengan payload tervalidasi |
| **PATCH** | `/absensi/:id` | `absensiController.update` | `200 OK` | Memperbarui sebagian atribut data absensi berdasarkan ID |
| **PUT** | `/absensi/:id` | `absensiController.update` | `200 OK` | Memperbarui atribut data absensi berdasarkan ID |
| **DELETE** | `/absensi/:id` | `absensiController.delete` | `204 No Content` | Menghapus rekaman absensi berdasarkan ID (tanpa response body) |

---

## 10. Contoh Request dan Response JSON

### A. GET `/` — Root Status API
* **Response (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "REST API Sistem Absensi dengan Pola Service/Controller berjalan",
    "project": "UTS Mini Project Backend",
    "mahasiswa": {
      "nama": "Nabilla Natasya",
      "nim": "240160221029",
      "mataKuliah": "Praktikum Backend"
    }
  }
  ```

### B. GET `/api/health` — Pemeriksaan Kesehatan Database
* **Response (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "API dan database terhubung"
  }
  ```

### C. POST `/absensi` — Tambah Absensi Baru
* **Request Body:**
  ```json
  {
    "nim": "240160221029",
    "nama": "Nabilla Natasya",
    "tanggal": "2026-11-05T08:00:00.000Z",
    "status": "Hadir",
    "keterangan": "Hadir tepat waktu praktikum"
  }
  ```
* **Response (HTTP 201 Created):**
  ```json
  {
    "success": true,
    "message": "Data absensi berhasil ditambahkan",
    "data": {
      "id": 1,
      "nim": "240160221029",
      "nama": "Nabilla Natasya",
      "tanggal": "2026-11-05T08:00:00.000Z",
      "status": "Hadir",
      "keterangan": "Hadir tepat waktu praktikum",
      "createdAt": "2026-11-05T07:00:00.000Z",
      "updatedAt": "2026-11-05T07:00:00.000Z"
    }
  }
  ```

### D. GET `/absensi` — Daftar Semua Absensi
* **Response (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "Daftar absensi berhasil diambil",
    "total": 1,
    "data": [
      {
        "id": 1,
        "nim": "240160221029",
        "nama": "Nabilla Natasya",
        "tanggal": "2026-11-05T08:00:00.000Z",
        "status": "Hadir",
        "keterangan": "Hadir tepat waktu praktikum",
        "createdAt": "2026-11-05T07:00:00.000Z",
        "updatedAt": "2026-11-05T07:00:00.000Z"
      }
    ]
  }
  ```

### E. GET `/absensi/:id` — Detail Absensi
* **Response (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "Detail absensi berhasil diambil",
    "data": {
      "id": 1,
      "nim": "240160221029",
      "nama": "Nabilla Natasya",
      "tanggal": "2026-11-05T08:00:00.000Z",
      "status": "Hadir",
      "keterangan": "Hadir tepat waktu praktikum",
      "createdAt": "2026-11-05T07:00:00.000Z",
      "updatedAt": "2026-11-05T07:00:00.000Z"
    }
  }
  ```

### F. PATCH `/absensi/:id` — Pembaruan Parsial Absensi
* **Request Body:**
  ```json
  {
    "status": "Sakit",
    "keterangan": "Surat keterangan dokter terlampir"
  }
  ```
* **Response (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "Data absensi berhasil diperbarui",
    "data": {
      "id": 1,
      "nim": "240160221029",
      "nama": "Nabilla Natasya",
      "tanggal": "2026-11-05T08:00:00.000Z",
      "status": "Sakit",
      "keterangan": "Surat keterangan dokter terlampir",
      "createdAt": "2026-11-05T07:00:00.000Z",
      "updatedAt": "2026-11-05T07:15:00.000Z"
    }
  }
  ```

### G. DELETE `/absensi/:id` — Hapus Absensi
* **Response (HTTP 204 No Content):**
  *(Kosong / Tidak ada konten body sesuai spesifikasi RESTful API)*

---

## 11. Contoh Perintah cURL Lengkap

Berikut perintah pengujian menggunakan `curl` yang dapat langsung disalin ke terminal:

### 1. Root Service Information
```bash
curl -X GET http://localhost:3008/
```

### 2. Health Check Basis Data
```bash
curl -X GET http://localhost:3008/api/health
```

### 3. Mengambil Semua Data Absensi
```bash
curl -X GET http://localhost:3008/absensi
```

### 4. Mengambil Data Absensi dengan Filter Query
```bash
curl -X GET "http://localhost:3008/absensi?status=Hadir&nim=240160221029"
```

### 5. Menambahkan Data Absensi Baru (POST)
```bash
curl -X POST http://localhost:3008/absensi \
  -H "Content-Type: application/json" \
  -d '{
    "nim": "240160221029",
    "nama": "Nabilla Natasya",
    "tanggal": "2026-11-05T08:00:00.000Z",
    "status": "Hadir",
    "keterangan": "Hadir tepat waktu praktikum"
  }'
```

### 6. Menambahkan Data Absensi Tanpa Keterangan (Opsional)
```bash
curl -X POST http://localhost:3008/absensi \
  -H "Content-Type: application/json" \
  -d '{
    "nim": "240160221008",
    "nama": "Della Kartika",
    "tanggal": "2026-11-05",
    "status": "Izin"
  }'
```

### 7. Mengambil Detail Absensi Berdasarkan ID (GET by ID)
```bash
curl -X GET http://localhost:3008/absensi/1
```

### 8. Memperbarui Data Absensi Secara Parsial (PATCH)
```bash
curl -X PATCH http://localhost:3008/absensi/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Sakit",
    "keterangan": "Surat dokter terlampir"
  }'
```

### 9. Memperbarui Data Absensi (PUT)
```bash
curl -X PUT http://localhost:3008/absensi/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Izin",
    "keterangan": "Izin keperluan keluarga"
  }'
```

### 10. Menghapus Data Absensi (DELETE)
```bash
curl -i -X DELETE http://localhost:3008/absensi/1
```

---

## 12. Validasi Input dan HTTP Status Code

API ini menerapkan perlindungan gerbang validasi ketat pada lapisan Controller:

| Skenario Pengujian | HTTP Status Code | Contoh Pesan Respon |
|---|:---:|---|
| **Data Berhasil Dibuat** | `201 Created` | `"Data absensi berhasil ditambahkan"` |
| **Data Berhasil Diambil / Diperbarui** | `200 OK` | `"Data absensi berhasil diperbarui"` |
| **Data Berhasil Dihapus** | `204 No Content` | *(Body kosong)* |
| **ID Bukan Angka Positif** | `400 Bad Request` | `"ID absensi harus berupa bilangan bulat positif"` |
| **Payload Body Kosong** | `400 Bad Request` | `"Request body harus berupa objek JSON yang valid"` |
| **Field `nim` Kosong / Spasi** | `400 Bad Request` | `"Field 'nim' wajib berupa teks dan tidak boleh kosong"` |
| **Field `nama` Kosong / Spasi** | `400 Bad Request` | `"Field 'nama' wajib berupa teks dan tidak boleh kosong"` |
| **Format `tanggal` Tidak Valid** | `400 Bad Request` | `"Field 'tanggal' wajib berupa format tanggal yang valid..."` |
| **Nilai `status` Di Luar Domain** | `400 Bad Request` | `"Field 'status' wajib salah satu dari: Hadir, Izin, Sakit, Alpa"` |
| **Tipe Data `keterangan` Salah** | `400 Bad Request` | `"Field 'keterangan' harus berupa teks jika disertakan"` |
| **Data Absensi Tidak Ada** | `404 Not Found` | `"Data absensi dengan ID 999999 tidak ditemukan"` |
| **URL / Rute Tidak Ditemukan** | `404 Not Found` | `"Endpoint tidak ditemukan"` |
| **Kesalahan Internal Server** | `500 Internal Server Error` | `"Terjadi kesalahan pada server"` |

---

## 13. Informasi SQLite dan Persistensi Basis Data

* **Driver Database:** Driver basis data menggunakan pustaka `better-sqlite3` berkecepatan tinggi yang dihubungkan ke Prisma melalui `@prisma/adapter-better-sqlite3`.
* **Penyimpanan Fisik:** Berkas database disimpan secara persisten di `prisma/dev.db`.
* **Karakteristik Persistensi:** Setiap transaksi `POST`, `PATCH`, `PUT`, atau `DELETE` langsung dikomit secara sinkron (*ACID compliant*) ke piringan disk lokal.
* **Uji Siklus Restart:** Terbukti melalui pengujian otomatis bahwa saat server dimatikan total (`SIGINT`/`server.close()`) dan dinyalakan kembali pada proses terpisah, seluruh data rekaman absensi tetap utuh dan dapat diakses kembali tanpa kehilangan satu bit pun.

---

## 14. Cara Menjalankan Skrip Pengujian Otomatis

Pengujian otomatis komprehensif (pengujian CRUD, 28 skenario validasi negatif, dan uji persistensi siklus restart) tersedia pada folder `Latihan-Individu`:

1. Buka terminal dan masuk ke direktori Latihan Individu:
   ```bash
   cd D:\SI-VA-Backend\240160221029-NabillaNatasya\Pertemuan-8\Latihan-Individu
   ```

2. Jalankan Pengujian Endpoint CRUD & Validasi Input (28 Skenario):
   ```powershell
   $env:DATABASE_URL = "file:../uts/240160221029-Nabilla-Natasya/prisma/dev.db"
   node --experimental-strip-types test-latihan-8.ts
   ```

3. Jalankan Pengujian Persistensi Basis Data (9 Tahapan Siklus Restart):
   ```powershell
   $env:DATABASE_URL = "file:../uts/240160221029-Nabilla-Natasya/prisma/dev.db"
   node --experimental-strip-types test-persistence.ts
   ```

Seluruh pengujian dirancang secara mandiri (*self-cleaning*), membersihkan data uji secara otomatis pada akhir eksekusi sehingga database kembali ke kondisi bersih (*0 baris data sementara uji*).
