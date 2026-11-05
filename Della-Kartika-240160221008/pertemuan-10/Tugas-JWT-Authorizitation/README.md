# TUGAS PERTEMUAN 10: JSON WEB TOKEN (JWT) DAN AUTHORIZATION
## SISTEM INFORMASI ABSENSI MAHASISWA

---

### IDENTITAS MAHASISWA & PROYEK
- **Nama Mahasiswa:** Della Kartika
- **NIM:** 240160221008
- **Kelas:** SI-VA
- **Program Studi:** Sistem Informasi
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Absensi Mahasiswa
- **Nama Package:** `jwt-auth-absensi-della`
- **Lokasi Direktori:** `Della-Kartika-240160221008/pertemuan-10/Tugas-JWT-Authorizitation/`

---

## 1. PENDAHULUAN & TUJUAN PEMBELAJARAN
Proyek ini mengimplementasikan mekanisme otorisasi modern berbasis *JSON Web Token* (JWT) dan *Role-Based Access Control* (RBAC) pada Express.js dan Prisma ORM dengan basis data SQLite (`better-sqlite3`). Melanjutkan modul autentikasi pada Pertemuan 9, sistem ini memastikan bahwa setiap request menuju endpoint presensi terlindungi wajib membawa Access Token yang valid dan memiliki hak akses (*role privilege*) yang sesuai dengan operasi kehadiran yang diminta.

Capaian pembelajaran:
1. Menerbitkan access token JWT (`HS256`) dengan masa berlaku terukur (`15m`) saat pengguna berhasil melakukan login.
2. Membangun middleware autentikasi terpusat (`authenticateToken`) untuk memvalidasi header `Authorization: Bearer <token>`, tanda tangan digital (*signature*), dan status kedaluwarsa klaim `exp`.
3. Membangun middleware otorisasi berbasis role (`authorizeRoles`) untuk menegakkan pembatasan wewenang presensi: `ADMIN`, `DOSEN`, `STAF`, dan `MAHASISWA`.
4. Mengembalikan kode status HTTP standar RFC: `200` (OK), `201` (Created), `400` (Bad Request), `401` (Unauthorized - gagal autentikasi), dan `403` (Forbidden - tidak memiliki izin).
5. Mempertahankan kesinambungan domain bisnis presensi mahasiswa (`Absensi`) tanpa membocorkan data sensitif.

---

## 2. STRUKTUR DIREKTORI PROYEK
```text
Della-Kartika-240160221008/pertemuan-10/Tugas-JWT-Authorizitation/
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
    │   ├── absensi.controller.ts
    │   ├── auth.controller.ts
    │   └── protected.controller.ts
    ├── middleware/
    │   └── auth.middleware.ts
    ├── routes/
    │   ├── absensi.routes.ts
    │   ├── auth.routes.ts
    │   └── protected.routes.ts
    └── service/
        ├── absensi.service.ts
        ├── auth.service.ts
        └── token.service.ts
```

---

## 3. PENGELOLAAN SECRET & ENVIRONMENT VARIABLES
Kunci rahasia JWT dibaca secara dinamis dari file `.env` dan tidak pernah di-hardcode ke dalam kode sumber:
```env
DATABASE_URL="file:./prisma/jwt-auth-della.db"
PORT=3010
JWT_SECRET="della_absensi_jwt_secret_key_super_secure_2026_unsap"
JWT_EXPIRES_IN="15m"
```
Template `.env.example` disediakan untuk deployment dengan nilai placeholder yang aman. File `.env` dan database `.db` diabaikan oleh `.gitignore`.

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

## 5. MATRIKS HAK AKSES ROLE & ENDPOINT TERLINDUNGI

| Endpoint | Metode | Role yang Diizinkan | Status Tanpa Token / Token Expired | Status Role Tidak Sesuai |
|---|:---:|---|:---:|:---:|
| `POST /auth/register` | `POST` | *Publik* | N/A | N/A |
| `POST /auth/login` | `POST` | *Publik* | N/A | N/A |
| `GET /health` | `GET` | *Publik* | N/A | N/A |
| `GET /auth/me` | `GET` | `MAHASISWA`, `DOSEN`, `STAF`, `ADMIN` | `401 Unauthorized` | N/A |
| `GET /api/absensi` | `GET` | `MAHASISWA`, `DOSEN`, `STAF`, `ADMIN` | `401 Unauthorized` | `403 Forbidden` |
| `GET /api/absensi/:id` | `GET` | `MAHASISWA`, `DOSEN`, `STAF`, `ADMIN` | `401 Unauthorized` | `403 Forbidden` |
| `POST /api/absensi` | `POST` | `MAHASISWA`, `DOSEN`, `STAF`, `ADMIN` | `401 Unauthorized` | `403 Forbidden` |
| `PUT /api/absensi/:id` | `PUT` | `ADMIN`, `DOSEN`, `STAF` | `401 Unauthorized` | `403 Forbidden` (Mahasiswa) |
| `DELETE /api/absensi/:id`| `DELETE`| `ADMIN` | `401 Unauthorized` | `403 Forbidden` (Dosen, Staf, Mahasiswa) |
| `GET /protected/staf/rekap`| `GET` | `STAF`, `ADMIN` | `401 Unauthorized` | `403 Forbidden` (Dosen, Mahasiswa) |
| `GET /protected/admin/audit`| `GET` | `ADMIN` | `401 Unauthorized` | `403 Forbidden` (Staf, Dosen, Mahasiswa) |

---

## 6. PANDUAN INSTALASI & PENGUJIAN

### A. Instalasi Dependensi
```bash
npm install
```

### B. Migrasi Basis Data SQLite
```bash
npx prisma migrate dev --name init_jwt_auth
npx prisma generate
```

### C. Menjalankan Server API
```bash
npm start
```
Server akan aktif pada `http://localhost:3010`.

### D. Pengujian Manual Menggunakan cURL

**1. Login Pengguna (Mendapatkan Token):**
```bash
curl -X POST http://localhost:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"della.mhs@absensi.id","password":"passwordDella#2026"}'
```

**2. Mengakses Endpoint Terlindungi Profil Pribadi:**
```bash
curl -X GET http://localhost:3010/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**3. Mencoba Mengubah Status Presensi Menggunakan Akun Mahasiswa (Uji 403 Forbidden):**
```bash
curl -X PUT http://localhost:3010/api/absensi/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_MAHASISWA>" \
  -d '{"status":"HADIR","keterangan":"Koreksi sepihak"}'
```

---

## 7. HASIL PENGUJIAN OTOMATIS (TEST REPORT)

Pengujian otomatis dieksekusi menggunakan script:
```bash
npm test
```

| No | Skenario Pengujian | Endpoint | Target Status | Hasil Status | Status Kelulusan | Verifikasi Respons |
|:--:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Pemeriksaan kesehatan server API JWT absensi | `GET /health` | 200 | 200 | **PASS** | Server aktif |
| 2 | Pendaftaran akun pengguna dengan default role MAHASISWA | `POST /auth/register` | 201 | 201 | **PASS** | Role MAHASISWA terpasang |
| 3 | Pendaftaran akun dengan wewenang role ADMIN | `POST /auth/register` | 201 | 201 | **PASS** | Role ADMIN terpasang |
| 4 | Pendaftaran akun dengan wewenang role STAF | `POST /auth/register` | 201 | 201 | **PASS** | Role STAF terpasang |
| 5 | Login Mahasiswa menghasilkan Access Token JWT | `POST /auth/login` | 200 | 200 | **PASS** | Token Bearer terbit |
| 6 | Login Admin menghasilkan Access Token JWT | `POST /auth/login` | 200 | 200 | **PASS** | Token Admin terbit |
| 7 | Login Staf menghasilkan Access Token JWT | `POST /auth/login` | 200 | 200 | **PASS** | Token Staf terbit |
| 8 | Akses endpoint terproteksi profil dengan token valid | `GET /auth/me` | 200 | 200 | **PASS** | Data profil aman tanpa hash |
| 9 | Penolakan akses endpoint terproteksi tanpa token | `GET /auth/me` | 401 | 401 | **PASS** | 401 Unauthorized |
| 10 | Penolakan akses dengan token bertanda-tangan palsu | `GET /auth/me` | 401 | 401 | **PASS** | Signature verification gagal |
| 11 | Penolakan akses dengan skema otorisasi salah (Basic) | `GET /auth/me` | 401 | 401 | **PASS** | Skema wajib 'Bearer' |
| 12 | Penolakan akses dengan token yang telah kedaluwarsa | `GET /auth/me` | 401 | 401 | **PASS** | Token expired terdeteksi |
| 13 | Role STAF diizinkan mengakses panel rekap staf absensi | `GET /protected/staf/rekap` | 200 | 200 | **PASS** | Otorisasi staf sukses |
| 14 | Role MAHASISWA ditolak mengakses panel rekap staf absensi | `GET /protected/staf/rekap` | 403 | 403 | **PASS** | 403 Forbidden |
| 15 | Role ADMIN diizinkan mengakses audit absensi tingkat tinggi | `GET /protected/admin/audit` | 200 | 200 | **PASS** | Otorisasi admin sukses |
| 16 | Role STAF ditolak mengakses audit tingkat admin | `GET /protected/admin/audit` | 403 | 403 | **PASS** | 403 Forbidden |
| 17 | Endpoint domain data absensi terproteksi dari akses anonim | `GET /api/absensi` | 401 | 401 | **PASS** | 401 Unauthorized |
| 18 | Pengguna terautentikasi dapat membaca koleksi data absensi | `GET /api/absensi` | 200 | 200 | **PASS** | Koleksi absensi tampil |
| 19 | Role MAHASISWA berhak mengisi presensi kehadiran mandiri | `POST /api/absensi` | 201 | 201 | **PASS** | Presensi baru berhasil dibuat |
| 20 | Role MAHASISWA dilarang mengoreksi/mengubah status presensi | `PUT /api/absensi/:id` | 403 | 403 | **PASS** | 403 Forbidden |
| 21 | Role STAF berhak mengoreksi status presensi mahasiswa | `PUT /api/absensi/:id` | 200 | 200 | **PASS** | Status kehadiran terkoreksi |
| 22 | Role ADMIN berhasil mengeksekusi penghapusan catatan absensi | `DELETE /api/absensi/:id` | 200 | 200 | **PASS** | Data terhapus oleh admin |

**Tingkat Keberhasilan Pengujian:** 100% (22 dari 22 skenario pengujian lulus).

---

## 8. REFLEKSI & PEMANFAATAN AI ASSISTANT
Penerapan otorisasi JWT pada Sistem Informasi Absensi Mahasiswa membuktikan pentingnya pengamanan lapis ganda:
1. Pemisahan middleware autentikasi (`authenticateToken`) dan otorisasi (`authorizeRoles`) menjaga agar kode tetap bersih dan setiap rute memiliki aturan akses yang transparan.
2. Penegakan status code `401 Unauthorized` versus `403 Forbidden` menjamin integritas alur kerja presensi: mahasiswa dapat mengisi kehadiran secara mandiri, namun tidak memiliki wewenang untuk merekayasa atau menghapus status presensi yang telah diverifikasi.
3. Seluruh rekomendasi AI Coding Assistant diverifikasi langsung melalui dokumentasi resmi `jsonwebtoken`, standar Express middleware, dan suite uji otomatis yang lulus 100%.

