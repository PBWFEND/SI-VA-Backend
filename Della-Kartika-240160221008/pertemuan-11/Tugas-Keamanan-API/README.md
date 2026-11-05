# TUGAS PERTEMUAN 11: IMPLEMENTASI KEAMANAN BACKEND DAN API
## SISTEM INFORMASI ABSENSI MAHASISWA

---

### IDENTITAS MAHASISWA & PROYEK
- **Nama Mahasiswa:** Della Kartika
- **NIM:** 240160221008
- **Kelas:** SI-VA
- **Program Studi:** Sistem Informasi
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Absensi Mahasiswa
- **Nama Package:** `api-security-absensi-della`
- **Lokasi Direktori:** `Della-Kartika-240160221008/pertemuan-11/Tugas-Keamanan-API/`

---

## 1. PENDAHULUAN & PRINSIP KEAMANAN
Proyek ini mengimplementasikan sistem pertahanan berlapis (*Defense-in-Depth*) pada REST API Sistem Informasi Absensi Mahasiswa berbasis Node.js 22, Express.js 5, Prisma ORM 7, dan SQLite (`better-sqlite3`). Melanjutkan autentikasi (Pertemuan 9) dan otorisasi JWT (Pertemuan 10), praktikum Pertemuan 11 ini menambahkan pengamanan komprehensif terhadap berbagai vektor serangan:
1. **Security Headers (Helmet):** Mengaktifkan header keamanan modern seperti `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, serta menonaktifkan header pembocor teknologi `X-Powered-By`.
2. **CORS Selektif (Whitelist):** Membatasi akses peramban hanya dari domain resmi (`http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:5173`). Request dari origin ilegal ditolak tanpa menyertakan header izin.
3. **Audit Request & Correlation ID (`X-Request-Id`):** Setiap request diinjeksi dengan UUID v4 unik untuk penelusuran log yang transparan dan aman.
4. **Rate Limiting & Pembatasan Ukuran Body:** Melindungi endpoint publik dari serangan DoS dan Brute-Force (`express-rate-limit`) serta membatasi ukuran request payload maksimal 10KB (`express.json({ limit: "10kb" })`).
5. **Anti-Spoofing Identity Enforcement:** Saat mahasiswa (`MAHASISWA`) mencatat kehadiran (`POST /api/absensi`), backend **mengabaikan input `body.nim`** dan memaksakan data identitas dari payload token JWT terverifikasi (`req.user.nim` dan `req.user.nama`). Mahasiswa dilarang melakukan "titip absen" untuk orang lain.
6. **Validasi & Sanitasi Masukan:** Memeriksa format NIM (8–20 digit angka murni), status kehadiran (`HADIR`, `IZIN`, `SAKIT`, `ALPA`), dan membatasi panjang input sebelum masuk ke database.
7. **Parameterized Queries (Anti-SQLi):** Seluruh query pencarian dan manipulasi data dieksekusi melalui parameterized queries Prisma ORM sehingga payload SQL injection diperlakukan murni sebagai string harfiah.
8. **Role-Based Authorization (RBAC):** Operasi pengubahan dan penghapusan data absensi dibatasi ketat untuk peran `ADMIN`, `DOSEN`, atau `STAF`.
9. **Safe Error Handling:** Menangkap error secara tersentralisasi tanpa mengekspos *stack trace*, *query trace*, atau detail internal server ke client.

---

## 2. STRUKTUR DIREKTORI PROYEK
```text
Della-Kartika-240160221008/pertemuan-11/Tugas-Keamanan-API/
├── .env
├── .env.example
├── .gitignore
├── client.ts
├── package.json
├── prisma.config.ts
├── README.md
├── server.ts
├── app.ts
├── test.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── src/
    ├── config/
    │   └── client.ts
    ├── controller/
    │   ├── auth.controller.ts
    │   └── absensi.controller.ts
    ├── middleware/
    │   ├── auth.middleware.ts
    │   ├── security.middleware.ts
    │   └── validation.middleware.ts
    ├── routes/
    │   ├── auth.routes.ts
    │   └── absensi.routes.ts
    └── service/
        ├── auth.service.ts
        ├── absensi.service.ts
        └── token.service.ts
```

---

## 3. PENGELOLAAN SECRET & ENVIRONMENT VARIABLES
Seluruh konfigurasi sensitif dipisahkan dari source code dan dibaca dari file `.env` (diabaikan oleh `.gitignore`):
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./prisma/security-della.db"
JWT_SECRET="della_absensi_api_security_jwt_secret_2026_unsap"
JWT_EXPIRES_IN="15m"
CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"
```
Template tanpa nilai kredensial disediakan di [`.env.example`](file:///d:/SI-VA-Backend/Della-Kartika-240160221008/pertemuan-11/Tugas-Keamanan-API/.env.example).

---

## 4. SKEMA BASIS DATA (PRISMA SCHEMA)
```prisma
datasource db {
  provider = "sqlite"
}

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

model Pengguna {
  id           Int      @id @default(autoincrement())
  nim          String   @unique
  nama         String
  email        String   @unique
  passwordHash String
  role         String   @default("MAHASISWA") // ADMIN, DOSEN, STAF, MAHASISWA
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("pengguna")
}

model Absensi {
  id            Int      @id @default(autoincrement())
  nim           String
  namaMahasiswa String
  kelas         String
  tanggal       DateTime @default(now())
  status        String   // HADIR, IZIN, SAKIT, ALPA
  keterangan    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("absensi")
}
```

---

## 5. DAFTAR ENDPOINT API & LAPISAN KEAMANAN

| Method | Endpoint | Hak Akses (Role) | Lapisan Keamanan & Validasi | Keterangan |
|:---:|:---|:---:|:---|:---|
| `GET` | `/health` | Publik | Helmet, CORS, X-Request-Id, Global Rate Limit | Uji kesehatan server |
| `POST` | `/auth/register` | Publik | Auth Rate Limit, Validasi NIM angka & email | Registrasi pengguna baru |
| `POST` | `/auth/login` | Publik | Auth Rate Limit (10 req/15m), Anti-Brute Force | Penerbitan JWT Token |
| `GET` | `/auth/me` | Terautentikasi | JWT Auth, Token verification | Profil pengguna aktif |
| `GET` | `/api/absensi` | Terautentikasi | JWT Auth, BOLA filter (Mahasiswa hanya lihat datanya) | Rekap data absensi |
| `GET` | `/api/absensi/:id` | Terautentikasi | JWT Auth, ID integer check, BOLA ownership check | Detail absensi |
| `POST` | `/api/absensi` | Terautentikasi | **Anti-Spoofing Identity Enforcement**, Validasi Status & Kelas | Catat absensi kehadiran |
| `PUT` | `/api/absensi/:id` | `ADMIN`, `DOSEN`, `STAF` | JWT Auth, RBAC Authorization | Pembaruan status absensi |
| `DELETE` | `/api/absensi/:id` | `ADMIN` | JWT Auth, RBAC Admin Only | Penghapusan catatan absensi |

---

## 6. TABEL HASIL PENGUJIAN OTOMATIS (`test.ts`)

Seluruh skenario keamanan diuji secara otomatis dan terisolasi melalui perintah `npm test`:

| No | Skenario Pengujian | Endpoint | Target Status | Hasil Status | Hasil | Verifikasi Lapisan Keamanan |
|:--:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Pemeriksaan kesehatan server API | `GET /health` | 200 | 200 | **PASS** | Layanan server dan middleware aktif |
| 2 | Verifikasi Security Headers Helmet | `GET /health` | 200 | 200 | **PASS** | `nosniff`, `SAMEORIGIN`, `X-Powered-By` tersembunyi |
| 3 | Pemasangan header penjejak `X-Request-Id` | `GET /health` | 200 | 200 | **PASS** | UUID v4 unik tersemat pada header respon |
| 4 | Origin terdaftar diizinkan oleh CORS | `GET /health` | 200 | 200 | **PASS** | Header `Access-Control-Allow-Origin: http://localhost:3000` |
| 5 | Origin tidak terdaftar ditolak oleh CORS | `GET /health` | 200 | 200 | **PASS** | Header `Access-Control-Allow-Origin` ditiadakan |
| 6 | Penolakan payload melebihi batas 10KB | `POST /absensi` | 413 | 413 | **PASS** | `413 Payload Too Large` (Cegah Memory Exhaustion) |
| 7 | Validasi input registrasi (NIM non-angka) | `POST /auth/register` | 400 | 400 | **PASS** | Ditolak: NIM harus berupa 8-20 digit angka murni |
| 8 | Autentikasi akun & penerbitan token JWT | `POST /auth/login` | 200 | 200 | **PASS** | Token JWT Admin dan Mahasiswa sah diterbitkan |
| 9 | Validasi status absensi tidak valid | `POST /api/absensi` | 400 | 400 | **PASS** | Status `'BOLOS'` ditolak; hanya HADIR, IZIN, SAKIT, ALPA |
| 10 | Validasi pencatatan absensi tanpa kelas | `POST /api/absensi` | 400 | 400 | **PASS** | Ditolak: Field 'kelas' wajib diisi |
| 11 | **Anti-Spoofing: Pemalsuan NIM oleh Mahasiswa** | `POST /api/absensi` | 201 | 201 | **PASS** | **NIM palsu diabaikan, dipaksa sesuai JWT (Della)** |
| 12 | Netralisasi serangan SQL Injection | `GET /api/absensi?search=...` | 200 | 200 | **PASS** | Query `' OR '1'='1` dianggap string harfiah (0 bocor) |
| 13 | Proteksi endpoint tanpa token otentikasi | `GET /api/absensi` | 401 | 401 | **PASS** | `401 Unauthorized`: Header Authorization tidak ditemukan |
| 14 | Pembatasan role: Mahasiswa dilarang menghapus | `DELETE /api/absensi/:id` | 403 | 403 | **PASS** | `403 Forbidden`: Peran 'MAHASISWA' dilarang menghapus |
| 15 | Hak akses ADMIN mencatat absensi mahasiswa | `POST /api/absensi` | 201 | 201 | **PASS** | Admin berhak mencatat presensi mahasiswa lain |
| 16 | Hak akses ADMIN menghapus catatan absensi | `DELETE /api/absensi/:id` | 200 | 200 | **PASS** | Admin berhasil mengeksekusi penghapusan absensi |
| 17 | Error handler aman tanpa kebocoran stack trace | `POST /api/absensi` | 400 | 400 | **PASS** | Error JSON sintaks ditangani rapi tanpa `stack` trace |

**Hasil Akhir: 17 dari 17 Pengujian Lulus (100% PASS).**

---

## 7. CARA MENJALANKAN PROYEK

### A. Instalasi Dependensi
```bash
npm install
```

### B. Migrasi Basis Data & Generate Prisma Client
```bash
npx prisma migrate dev --name init_security
npx prisma generate
```

### C. Pemeriksaan Tipe Data (Typecheck)
```bash
npm run typecheck
```

### D. Menjalankan Seluruh Pengujian Otomatis
```bash
npm test
```

### E. Menjalankan Server Development
```bash
npm run dev
```
Server akan aktif di `http://localhost:3000`.

---

## 8. KESIMPULAN & REFLEKSI KEAMANAN
Penerapan arsitektur *defense-in-depth* pada Sistem Informasi Absensi Mahasiswa menjamin keandalan dan integritas data kehadiran kampus. Khususnya mekanisme *Anti-Spoofing Identity Enforcement*, sistem secara permanen menghilangkan celah kecurangan "titip absen" digital dengan mengunci identitas presensi langsung ke subjek yang telah diautentikasi secara kriptografis melalui JWT.

