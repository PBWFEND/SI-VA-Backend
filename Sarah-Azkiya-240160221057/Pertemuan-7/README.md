# Tugas 5 — Refactoring REST API Perpustakaan dengan Pola Route–Controller–Service

## 1. Identitas Mahasiswa
- **Nama:** Sarah Azkiya  
- **NIM:** 240160221057  
- **Program Studi:** Sistem Informasi  
- **Kelompok:** 6 (Raihan Anugrah Pratama, Yosep Adipura Herdi, Sarah Azkiya)  
- **Mata Kuliah:** Pemrograman Berbasis Web Back End  

---

## 2. Studi Kasus
**Sistem Informasi Perpustakaan**  
Resource utama yang dikelola adalah **Buku** (`/buku`), dengan field data:
- `id` (Int, Primary Key, Auto-increment)
- `judul` (String, Wajib)
- `penulis` (String, Wajib)
- `tahun` (Int, Wajib, Rentang 1000–2100)
- `stok` (Int, Default 0, Minimal 0)

---

## 3. Tujuan Pertemuan 7
Melakukan refactoring terhadap REST API dari Pertemuan 6 yang semula berbasis *inline handler* menjadi arsitektur berlapis (*layered architecture*) dengan pola **Route–Controller–Service**. Pola ini memisahkan tanggung jawab penanganan HTTP, validasi masukan, logika bisnis, dan interaksi basis data untuk meningkatkan keterbacaan, keterujian, dan kemudahan pemeliharaan kode (*maintainability*).

---

## 4. Struktur Folder Proyek

```text
Pertemuan-7/
├── app.ts                    # Inisialisasi Express, middleware global, router, 404 & error handler
├── server.ts                 # HTTP Server entry point dan graceful shutdown
├── client.ts                 # Singleton instance PrismaClient dengan better-sqlite3 adapter
├── prisma.config.ts          # Konfigurasi datasource Prisma 7
├── package.json              # Definisi dependensi dan skrip proyek
├── tsconfig.json             # Konfigurasi compiler TypeScript
├── .env.example              # Template variabel lingkungan
├── .env                      # Variabel lingkungan lokal (diabaikan Git)
├── .gitignore                # Pengecualian berkas Git
├── README.md                 # Dokumentasi komprehensif proyek
├── test-runner.ts            # Skrip pengujian otomatis menyeluruh
├── prisma/
│   ├── schema.prisma         # Skema model Prisma (Buku dan Pengguna)
│   └── migrations/           # Riwayat migrasi database SQL
│       └── 20261108151751_init_buku/
│           └── migration.sql # File SQL migrasi tabel buku & pengguna
├── src/
│   ├── routes/
│   │   └── buku.routes.ts     # Layer Route: Pemetaan URL ke Controller
│   ├── controller/
│   │   └── buku.controller.ts # Layer Controller: Request, Response, Validasi input
│   └── service/
│       └── buku.service.ts    # Layer Service: Logika bisnis dan query Prisma Client
├── aktivitas-kelompok/
│   └── aktivitas-kelompok.md  # Dokumentasi Aktivitas Kelompok §10
└── latihan-individu/
    ├── package.json
    ├── tsconfig.json
    ├── client.ts
    ├── latihan.ts             # Implementasi 4 TODO Latihan Individu §11
    ├── test-runner.ts         # Pengujian otomatis Latihan Individu
    └── prisma/
        └── schema.prisma
```

---

## 5. Penjelasan Layer Route (`src/routes/buku.routes.ts`)
Layer Route bertanggung jawab mengelompokkan endpoint menggunakan `express.Router()` dan memetakan metode HTTP (GET, POST, PATCH, DELETE) ke handler controller terkait.
- **Aturan Ketat:** Route tidak boleh memanggil Prisma Client langsung dan tidak boleh melakukan validasi bisnis detail.

---

## 6. Penjelasan Layer Controller (`src/controller/buku.controller.ts`)
Layer Controller bertindak sebagai jembatan antara protokol HTTP dan aplikasi:
- Membaca parameter URL (`req.params`) dan body request (`req.body`).
- Melakukan verifikasi tipe data dan validasi kelengkapan masukan.
- Menentukan HTTP status code yang tepat (200, 201, 204, 400, 404, 500).
- Memanggil fungsi Service dan membentuk struktur respons JSON standar.
- **Aturan Ketat:** Controller tidak boleh menulis kueri Prisma langsung.

---

## 7. Penjelasan Layer Service (`src/service/buku.service.ts`)
Layer Service bertindak sebagai pengelola domain dan akses data:
- Mengeksekusi kueri Prisma Client (`findMany`, `findUnique`, `create`, `update`, `delete`).
- Menjalankan logika pencarian dan penyaringan data (*filtering*).
- Melempar error domain murni (seperti `NotFoundError`) jika entitas yang dicari tidak ada.
- **Aturan Ketat:** Service tidak boleh mengetahui status code HTTP atau objek respons Express (`res.status`, `res.json`).

---

## 8. Alur Request Berjenjang (*Request Flow*)

```text
Client ──► Route ──► Controller ──► Service ──► Prisma Client ──► SQLite (dev.db)
  ▲          │             │            │              │
  └──────────┴─────────────┴────────────┴──────────────┘ (HTTP Response via Controller)
```

1. **Client** mengirimkan HTTP request ke server.
2. **Route** menerima request dan mencocokkan URL path ke handler Controller yang sesuai.
3. **Controller** mengekstrak payload, melakukan validasi tipe dan kelengkapan data.
4. Jika valid, **Controller** memanggil fungsi pada **Service**.
5. **Service** mengeksekusi operasi database melalui **Prisma Client**.
6. **Prisma Client** membaca/menulis ke database fisik **SQLite** (`dev.db`).
7. **Service** mengembalikan data domain ke **Controller**.
8. **Controller** membungkus data ke dalam format JSON standar dan mengirimkan status code HTTP ke **Client**.

---

## 9. Database Prisma ORM & SQLite
- Menggunakan **Prisma ORM 7** dengan database lokal **SQLite**.
- Adapter koneksi menggunakan `@prisma/adapter-better-sqlite3` dan driver `better-sqlite3` untuk stabilitas dan performa tinggi pada runtime Node.js modern.
- Konfigurasi URL datasource diarahkan ke variabel lingkungan `DATABASE_URL="file:./prisma/dev.db"`.

---

## 10. Daftar Endpoint API

| HTTP Method | Endpoint | Status Sukses | Deskripsi |
|---|---|---|---|
| GET | `/` | 200 OK | Informasi umum API dan daftar endpoint |
| GET | `/api/health` | 200 OK | Pemeriksaan kesehatan API dan koneksi database SQLite |
| GET | `/buku` | 200 OK | Mengambil seluruh daftar buku (mendukung filter query) |
| GET | `/buku/:id` | 200 OK | Mengambil detail buku berdasarkan ID (404 jika tidak ditemukan) |
| POST | `/buku` | 201 Created | Menambahkan buku baru dengan validasi data ketat |
| PATCH | `/buku/:id` | 200 OK | Memperbarui data buku secara parsial (404 jika tidak ditemukan) |
| DELETE | `/buku/:id` | 204 No Content | Menghapus buku (status 204 tanpa response body) |

---

## 11. Status Code HTTP yang Digunakan
- **200 OK:** Pengambilan data (GET) atau pembaruan (PATCH) berhasil.
- **201 Created:** Data baru berhasil dibuat (POST).
- **204 No Content:** Penghapusan data berhasil (DELETE) tanpa menyertakan response body.
- **400 Bad Request:** Masukan tidak valid, parameter ID bukan angka, atau kesalahan format JSON.
- **404 Not Found:** Resource data atau endpoint URL tidak ditemukan.
- **500 Internal Server Error:** Terjadi kesalahan internal yang tidak terduga pada server.

---

## 12. Penguatan Validasi (Validation Hardening)
Validasi dipusatkan pada Controller:
1. **POST `/buku`:**
   - `judul`: wajib diisi, bertipe string, tidak boleh kosong setelah trim.
   - `penulis`: wajib diisi, bertipe string, tidak boleh kosong setelah trim.
   - `tahun`: wajib diisi, berupa angka integer dalam rentang 1000 hingga 2100.
   - `stok`: jika diisi, harus berupa bilangan bulat non-negatif (`>= 0`).
   - Seluruh pesan kesalahan dikumpulkan dalam array `details: []` sehingga client mengetahui seluruh kesalahan masukan sekaligus.
2. **PATCH `/buku/:id`:**
   - Parameter `:id` diverifikasi dengan `typeof rawId === "string"` sebelum dikonversi dengan `Number()`. Jika bukan angka bulat positif -> mengembalikan 400.
   - Request body tidak boleh kosong (minimal satu field: `judul`, `penulis`, `tahun`, atau `stok` harus diisi).
   - Setiap field yang dikirim divalidasi dengan aturan yang sama seperti POST.
3. **Filter Query `GET /buku`:**
   - Mendukung filter `?penulis=...`, `?tahun=...`, `?minStok=...`, dan `?q=...`. Tipe query diperiksa sebelum digunakan dalam query Prisma.

---

## 13. Cara Instalasi

```bash
cd Sarah-Azkiya-240160221057/Pertemuan-7
npm install
```

---

## 14. Cara Konfigurasi Environment Variable (`.env`)

Salin berkas template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi di dalam `.env`:
```dotenv
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

---

## 15. Cara Migrasi Database

Jalankan perintah migrasi Prisma untuk membuat tabel database SQLite:
```bash
npm run prisma:migrate
# atau:
npx prisma migrate dev --name init_buku
```

---

## 16. Cara Generate Prisma Client

Generate Prisma Client bertipe kuat:
```bash
npm run prisma:generate
# atau:
npx prisma generate
```

---

## 17. Cara Menjalankan Server

### Mode Produksi / Eksekusi Langsung:
```bash
npm start
```

### Mode Pengembangan (Watch Mode):
```bash
npm run dev
```

Server aktif pada: `http://localhost:3008`

---

## 18. Contoh Request cURL untuk Setiap Endpoint

### 18.1 Pemeriksaan Koneksi Database
```bash
curl -X GET http://localhost:3008/api/health
```

### 18.2 Mengambil Seluruh Buku
```bash
curl -X GET http://localhost:3008/buku
```

### 18.3 Menambahkan Buku Baru (POST)
```bash
curl -X POST http://localhost:3008/buku \
  -H "Content-Type: application/json" \
  -d '{"judul": "Pemrograman Backend Modern", "penulis": "Sarah Azkiya", "tahun": 2024, "stok": 15}'
```

### 18.4 Mengambil Detail Buku (GET by ID)
```bash
curl -X GET http://localhost:3008/buku/1
```

### 18.5 Filter Buku Berdasarkan Penulis & Tahun
```bash
curl -X GET "http://localhost:3008/buku?penulis=Sarah&tahun=2024"
```

### 18.6 Memperbarui Buku Parsial (PATCH)
```bash
curl -X PATCH http://localhost:3008/buku/1 \
  -H "Content-Type: application/json" \
  -d '{"stok": 20}'
```

### 18.7 Menghapus Buku (DELETE)
```bash
curl -X DELETE http://localhost:3008/buku/1
```

---

## 19. Hasil Pengujian Otomatis

Pengujian dijalankan melalui skrip otomatis `test-runner.ts` mencakup seluruh skenario (23 skenario uji):
- `GET /` & `GET /api/health`: 200 OK
- `GET /buku`: 200 OK
- `GET /buku/:id` valid & tidak ditemukan: 200 OK & 404 Not Found
- `GET /buku/id-invalid`: 400 Bad Request
- `POST /buku` valid: 201 Created
- `POST /buku` judul kosong, penulis kosong, tahun invalid, stok negatif: 400 Bad Request
- `PATCH /buku/:id` valid, invalid, body kosong, tidak ditemukan: 200 OK, 400 Bad Request, 404 Not Found
- `DELETE /buku/:id` valid & tidak ditemukan: 204 No Content & 404 Not Found
- Endpoint acak: 404 Not Found
- Persistensi data SQLite terverifikasi persisten setelah operasi restart.

**Hasil Eksekusi:** **33 uji lolos, 0 uji gagal (100% Passed).**

---

## 20. Refleksi Pembagian Tanggung Jawab Layer
Pemisahan kode ke dalam tiga lapisan (Route, Controller, Service) memberikan dampak langsung pada kualitas kode backend:
1. **Modularitas:** Setiap lapisan hanya memikirkan satu aspek masalah (*Single Responsibility*).
2. **Keterujian (*Testability*):** Logika query pada Service dapat diuji tanpa bergantung pada protokol HTTP Express, sementara Controller dapat diuji fokus pada validasi input.
3. **Ketahanan Error:** Validasi ketat pada Controller menyaring data kotor sebelum menyentuh Prisma Client sehingga mencegah runtime exception yang tidak terduga.

---

## 21. Bantuan AI yang Digunakan
Pengembangan Pertemuan 7 ini didampingi oleh asisten AI (Antigravity/DeepMind) untuk:
- Merancang pemisahan kode lama menjadi pola Route–Controller–Service secara disiplin dan presisi.
- Menerapkan penguatan validasi (*validation hardening*) pada Controller dengan pengumpulan pesan kesalahan ke dalam array `details`.
- Menyusun skrip pengujian otomatis komprehensif untuk memverifikasi kepatuhan status code dan persistensi database SQLite.

