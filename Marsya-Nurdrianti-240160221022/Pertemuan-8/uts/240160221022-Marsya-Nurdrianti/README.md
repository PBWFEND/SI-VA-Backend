# SISTEM INFORMASI ABSENSI MAHASISWA — UTS MINI PROJECT BACKEND

Dokumentasi resmi RESTful API **Sistem Informasi Absensi Mahasiswa** yang dibangun menggunakan arsitektur berlapis (*Layered Architecture*) berbasis **Node.js**, **Express.js 5**, **TypeScript**, **Prisma ORM**, dan **SQLite**.

---

## 1. Identitas Mahasiswa

| Keterangan | Detail |
|---|---|
| **Nama Lengkap** | Marsya Nurdrianti |
| **NIM** | 240160221022 |
| **Kelas** | SI-VA |
| **Mata Kuliah** | Praktikum Backend Development |
| **Tugas** | UTS Mini Project Backend |
| **Studi Kasus** | Sistem Informasi Absensi Mahasiswa |
| **Direktori Proyek** | `Marsya-Nurdrianti-240160221022/Pertemuan-8/uts/240160221022-Marsya-Nurdrianti/` |

---

## 2. Deskripsi Proyek

Proyek ini merupakan implementasi RESTful API untuk pengelolaan pencatatan kehadiran mahasiswa (*Sistem Informasi Absensi Mahasiswa*). API ini menyediakan operasi *Create, Read, Update, and Delete* (CRUD) secara persisten ke database fisik SQLite melalui Prisma ORM v7.

Fitur utama yang diimplementasikan:
- Pencatatan absensi baru mahasiswa dengan validasi status kehadiran (`Hadir`, `Izin`, `Sakit`, `Alpa`).
- Pengambilan seluruh data absensi dilengkapi parameter penyaringan (*query filter*) berdasarkan NIM, Status, dan Tanggal.
- Pengambilan detail satu rekaman absensi berdasarkan ID dengan respon `404 Not Found` jika data tidak ditemukan.
- Pembaruan sebagian data (*partial update*) secara aman menggunakan HTTP `PATCH` dengan proteksi penolakan *payload* kosong dan *field* tidak dikenal.
- Penghapusan data absensi menggunakan HTTP `DELETE` dengan kode status standar `204 No Content` tanpa *response body*.
- Arsitektur berlapis yang memisahkan tanggung jawab rute, validasi kontroler, dan logika manipulasi basis data pada *service layer*.

---

## 3. Teknologi yang Digunakan

| Komponen | Paket / Runtime | Versi | Peran & Deskripsi |
|---|---|:---:|---|
| **Runtime** | Node.js | `>= 22.0.0` (uji pada `v24.15.0`) | Eksekusi TypeScript native via flag `--experimental-strip-types` |
| **Framework HTTP** | `express` | `^5.3.0` | Routing HTTP, manajemen middleware, dan penanganan permintaan |
| **ORM** | `@prisma/client` & `prisma` | `^7.10.1` | Object-Relational Mapping dan manajemen migrasi skema |
| **Database Adapter** | `@prisma/adapter-libsql` | `^7.10.1` | Driver adapter database SQLite modern untuk Prisma v7 |
| **Database Engine** | SQLite (`prisma/dev.db`) | File lokal | Penyimpanan basis data relasional persisten |
| **Environment Loader**| `dotenv` | `^18.0.9` | Pemuat konfigurasi variabel lingkungan `.env` |
| **Language Compiler** | `typescript` | `^7.0.2` | Pengecekan tipe statis (*static type checking*) |
| **HTTP Client Uji** | Native Fetch API | Bawaan Node.js | Pengujian integrasi otomatis dan persistensi server |

---

## 4. Struktur Folder Proyek

```text
240160221022-Marsya-Nurdrianti/
├── .env                           # Konfigurasi environment lokal (PORT, DATABASE_URL)
├── .env.example                   # Contoh konfigurasi environment
├── .gitignore                     # Aturan pengabaian file Git (node_modules, dev.db, .env)
├── README.md                      # Dokumentasi komprehensif proyek
├── package.json                   # Metadata proyek, scripts, dan deklarasi dependency
├── package-lock.json              # Penguncian versi dependency
├── tsconfig.json                  # Konfigurasi kompilator TypeScript
├── prisma.config.ts               # Konfigurasi Prisma v7 (schema, migrations, datasource)
├── client.ts                      # Root facade PrismaClient singleton
├── app.ts                         # Root facade Express app
├── server.ts                      # Root entry point eksekusi server
├── test-api.ts                    # Skrip pengujian otomatis 22 skenario integrasi REST API
├── test-persistence.ts            # Skrip pengujian otomatis persistensi SQLite restart siklus
├── prisma/
│   ├── dev.db                     # File database SQLite fisik lokal
│   ├── schema.prisma              # Definisi model data Prisma
│   └── migrations/                # Riwayat migrasi database
│       └── 20261102101455_init/
│           └── migration.sql
├── generated/                     # Kode klien hasil Prisma generate
└── src/
    ├── client.ts                  # Singleton PrismaClient dengan adapter SQLite
    ├── app.ts                     # Inisialisasi Express, middleware 404, dan global error handler
    ├── server.ts                  # HTTP listener dengan penanganan graceful shutdown
    ├── routes/
    │   └── absensi.routes.ts      # Definisi rute Express untuk endpoint /api/absensi
    ├── controller/
    │   └── absensi.controller.ts  # Validasi input typeof, penyusunan status code, & response
    └── service/
        └── absensi.service.ts     # Logika bisnis dan komunikasi data via Prisma ORM
```

---

## 5. Model Prisma (`schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated"
}

datasource db {
  provider = "sqlite"
}

model Absensi {
  id            Int      @id @default(autoincrement())
  nim           String
  namaMahasiswa String
  tanggal       DateTime
  waktuMasuk    String?
  status        String
  keterangan    String?

  @@map("absensi")
}
```

### Aturan Nilai Bidang:
- `id`: Bilangan bulat positif unik terbuat otomatis (*autoincrement*).
- `nim`: Nomor Induk Mahasiswa berupa string wajib diisi.
- `namaMahasiswa`: Nama lengkap mahasiswa berupa string wajib diisi.
- `tanggal`: Tanggal kehadiran mahasiswa format ISO / string tanggal valid.
- `waktuMasuk`: Jam absensi (misal `"08:00"`), opsional / bernilai null.
- `status`: Status kehadiran, wajib bernilai salah satu dari:
  - `Hadir`
  - `Izin`
  - `Sakit`
  - `Alpa`
- `keterangan`: Catatan tambahan (misal alasan izin atau sakit), opsional / string.

---

## 6. Petunjuk Instalasi dan Menjalankan Proyek

### A. Masuk ke Direktori Proyek
Buka terminal dan arahkan ke folder proyek UTS:
```powershell
cd Marsya-Nurdrianti-240160221022/Pertemuan-8/uts/240160221022-Marsya-Nurdrianti
```

### B. Konfigurasi Environment (`.env`)
Salin file template `.env.example` menjadi `.env` jika belum tersedia:
```powershell
Copy-Item .env.example .env
```
Isi konfigurasi pada file `.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
```

### C. Instalasi Dependency
Instal paket yang diperlukan:
```powershell
npm install
```

### D. Migrasi Database dan Generate Prisma Client
Jalankan migrasi skema database SQLite dan generate client:
```powershell
npm run prisma:migrate
npm run prisma:generate
```

### E. Pemeriksaan Tipe TypeScript
Pastikan tidak ada kesalahan kompilasi tipe data:
```powershell
npx tsc --noEmit
```

### F. Menjalankan Server
Jalankan server aplikasi pada mode produksi atau pengembangan:
```powershell
# Menjalankan server
npm start

# Atau menjalankan dengan auto-reload (watch mode)
npm run dev
```
Server akan aktif pada `http://localhost:3000`.

---

## 7. Dokumentasi Endpoint REST API

Base URL API: `http://localhost:3000/api/absensi`

| Metode | URL Endpoint | Deskripsi | Status Berhasil | Status Error |
|---|---|---|:---:|:---:|
| **GET** | `/` | Informasi status API dan identitas mahasiswa | `200 OK` | - |
| **GET** | `/api/health` | Pemeriksaan konektivitas server & database | `200 OK` | `500 Internal Server Error` |
| **GET** | `/api/absensi` | Mengambil seluruh data absensi (opsi filter query) | `200 OK` | `400 Bad Request` |
| **GET** | `/api/absensi/:id` | Mengambil detail absensi berdasarkan ID | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **POST** | `/api/absensi` | Menambahkan rekaman absensi baru | `201 Created` | `400 Bad Request` |
| **PATCH** | `/api/absensi/:id` | Memperbarui data absensi secara parsial | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **DELETE**| `/api/absensi/:id` | Menghapus rekaman absensi berdasarkan ID | `204 No Content`| `400 Bad Request`, `404 Not Found` |

---

## 8. Contoh Format Request, Response, dan cURL

### 1. GET `/api/health` — Pemeriksaan Kesehatan Sistem
**Contoh cURL:**
```bash
curl -X GET http://localhost:3000/api/health
```
**Contoh Respon (200 OK):**
```json
{
  "success": true,
  "message": "API dan database terhubung"
}
```

---

### 2. POST `/api/absensi` — Menambahkan Data Absensi Baru
**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/api/absensi \
  -H "Content-Type: application/json" \
  -d '{
    "nim": "240160221022",
    "namaMahasiswa": "Marsya Nurdrianti",
    "tanggal": "2026-11-02",
    "waktuMasuk": "07:55",
    "status": "Hadir",
    "keterangan": "Hadir tepat waktu di kelas Praktikum Backend"
  }'
```
**Contoh Respon (201 Created):**
```json
{
  "success": true,
  "message": "Data absensi berhasil ditambahkan",
  "data": {
    "id": 1,
    "nim": "240160221022",
    "namaMahasiswa": "Marsya Nurdrianti",
    "tanggal": "2026-11-02T00:00:00.000Z",
    "waktuMasuk": "07:55",
    "status": "Hadir",
    "keterangan": "Hadir tepat waktu di kelas Praktikum Backend"
  }
}
```

---

### 3. GET `/api/absensi` — Mengambil Semua Data Absensi
**Contoh cURL:**
```bash
# Mengambil seluruh data
curl -X GET http://localhost:3000/api/absensi

# Mengambil data dengan filter query
curl -X GET "http://localhost:3000/api/absensi?status=Hadir&nim=240160221022"
```
**Contoh Respon (200 OK):**
```json
{
  "success": true,
  "message": "Daftar absensi berhasil diambil",
  "total": 1,
  "data": [
    {
      "id": 1,
      "nim": "240160221022",
      "namaMahasiswa": "Marsya Nurdrianti",
      "tanggal": "2026-11-02T00:00:00.000Z",
      "waktuMasuk": "07:55",
      "status": "Hadir",
      "keterangan": "Hadir tepat waktu di kelas Praktikum Backend"
    }
  ]
}
```

---

### 4. GET `/api/absensi/:id` — Mengambil Detail Absensi
**Contoh cURL:**
```bash
curl -X GET http://localhost:3000/api/absensi/1
```
**Contoh Respon (200 OK):**
```json
{
  "success": true,
  "message": "Detail absensi berhasil diambil",
  "data": {
    "id": 1,
    "nim": "240160221022",
    "namaMahasiswa": "Marsya Nurdrianti",
    "tanggal": "2026-11-02T00:00:00.000Z",
    "waktuMasuk": "07:55",
    "status": "Hadir",
    "keterangan": "Hadir tepat waktu di kelas Praktikum Backend"
  }
}
```
**Jika ID Tidak Ditemukan (404 Not Found):**
```json
{
  "success": false,
  "message": "Data absensi dengan ID 999 tidak ditemukan"
}
```

---

### 5. PATCH `/api/absensi/:id` — Memperbarui Data Parsial
**Contoh cURL:**
```bash
curl -X PATCH http://localhost:3000/api/absensi/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Izin",
    "keterangan": "Izin menghadiri seminar akademik kampus"
  }'
```
**Contoh Respon (200 OK):**
```json
{
  "success": true,
  "message": "Data absensi berhasil diperbarui",
  "data": {
    "id": 1,
    "nim": "240160221022",
    "namaMahasiswa": "Marsya Nurdrianti",
    "tanggal": "2026-11-02T00:00:00.000Z",
    "waktuMasuk": "07:55",
    "status": "Izin",
    "keterangan": "Izin menghadiri seminar akademik kampus"
  }
}
```
**Jika Body Kosong (400 Bad Request):**
```json
{
  "success": false,
  "message": "Request body tidak boleh kosong. Minimal satu field harus disertakan untuk pembaruan"
}
```

---

### 6. DELETE `/api/absensi/:id` — Menghapus Data Absensi
**Contoh cURL:**
```bash
curl -i -X DELETE http://localhost:3000/api/absensi/1
```
**Respon (204 No Content):**
- HTTP Header Status: `204 No Content`
- Body: Kosong (*empty body*) sesuai spesifikasi standar RFC HTTP.

---

## 9. Penjelasan Kode Status HTTP (*HTTP Status Codes*)

| Kode Status | Kategori | Keterangan Penggunaan dalam Proyek |
|---|---|---|
| **`200 OK`** | Sukses | Permintaan `GET` atau `PATCH` berhasil diproses dan mengembalikan data yang diminta. |
| **`201 Created`** | Sukses Buat Data | Permintaan `POST` berhasil menyimpan entitas absensi baru ke database. |
| **`204 No Content`** | Sukses Tanpa Konten | Permintaan `DELETE` berhasil menghapus entitas tanpa perlu mengembalikan payload body. |
| **`400 Bad Request`** | Kesalahan Klien | Input request tidak lolos gerbang validasi (tipe data salah, nilai di luar ketentuan, field kosong, atau field tidak dikenal). |
| **`404 Not Found`** | Tidak Ditemukan | ID absensi yang dicari/diubah/dihapus tidak ditemukan di basis data atau endpoint URL tidak terdaftar. |
| **`500 Internal Server Error`** | Kesalahan Server | Terjadi kegagalan tak terduga pada server atau basis data tanpa membocorkan trace sensitif ke pengguna. |

---

## 10. Hasil Pengujian Otomatis (*Automated Testing*)

Proyek ini telah lulus verifikasi pengujian otomatis dengan dua skrip pengujian:

### A. Pengujian Integrasi API (22 Skenario)
Jalankan pengujian:
```powershell
node --experimental-strip-types test-api.ts
```
**Hasil:** `22/22 BERHASIL (PASS)` mencakup:
- Pengujian fungsional seluruh rute dasar dan CRUD (`/`, `/api/health`, `/api/absensi`).
- Pengujian negatif field kosong, format salah, status di luar ketentuan, payload asing, dan body kosong.
- Pengujian query filter (`status`, `nim`).
- Pengujian kebersihan status `204 No Content` dan verifikasi `404 Not Found` pasca penghapusan.

### B. Pengujian Persistensi Basis Data SQLite Siklus Restart (6 Tahap)
Jalankan pengujian:
```powershell
node --experimental-strip-types test-persistence.ts
```
**Hasil:** `6/6 TAHAP BERHASIL (PASS)` membuktikan:
- Data yang ditambahkan melalui `POST` tersimpan secara fisik ke file `prisma/dev.db`.
- Server Express sesi 1 dimatikan secara total (`server.close()`).
- Server Express sesi 2 dinyalakan ulang pada port baru.
- Data yang telah diinput sebelumnya **tetap utuh dan dapat diakses** pada server sesi 2, membuktikan basis data bersifat non-volatile.

