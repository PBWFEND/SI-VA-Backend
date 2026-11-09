# TUGAS PERTEMUAN 10: JSON WEB TOKEN (JWT) DAN AUTHORIZATION
## SISTEM INFORMASI AKADEMIK / MANAJEMEN DATA MAHASISWA

---

### IDENTITAS MAHASISWA & PROYEK
- **Nama Mahasiswa:** Sandika Yusuf Permana
- **NIM:** 240160221044
- **Kelas:** SI-VA
- **Program Studi:** Sistem Informasi
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Akademik / Manajemen Data Mahasiswa
- **Nama Package:** `jwt-auth-mahasiswa-sandika`
- **Lokasi Direktori:** `SandikaYusuf-240160221044/Pertemuan-10/Tugas-JWT-Authorizitation/`

---

## 1. PENDAHULUAN & TUJUAN PEMBELAJARAN
Proyek ini mengimplementasikan mekanisme otorisasi modern berbasis *JSON Web Token* (JWT) dan *Role-Based Access Control* (RBAC) pada Express.js dan Prisma ORM dengan basis data SQLite (`better-sqlite3`). Melanjutkan modul autentikasi pada Pertemuan 9, sistem ini memastikan bahwa setiap request menuju endpoint terlindungi wajib membawa Access Token yang valid dan memiliki hak akses (*role privilege*) yang sesuai dengan operasi yang diminta.

Capaian pembelajaran:
1. Menerbitkan access token JWT (`HS256`) dengan masa berlaku terukur (`15m`) saat pengguna berhasil melakukan login.
2. Membangun middleware autentikasi terpusat (`authenticateToken`) untuk memvalidasi header `Authorization: Bearer <token>`, tanda tangan digital (*signature*), dan status kedaluwarsa klaim `exp`.
3. Membangun middleware otorisasi berbasis role (`authorizeRoles`) untuk menegakkan pemisahan wewenang secara granular: `ADMIN`, `DOSEN`, `STAF`, dan `MAHASISWA`.
4. Mengembalikan kode status HTTP standar RFC: `200` (OK), `201` (Created), `400` (Bad Request), `401` (Unauthorized - gagal autentikasi), dan `403` (Forbidden - tidak memiliki izin).
5. Menjaga kerahasiaan kredensial dan payload agar tidak membocorkan data sensitif seperti password atau hash.

---

## 2. STRUKTUR DIREKTORI PROYEK
```text
SandikaYusuf-240160221044/Pertemuan-10/Tugas-JWT-Authorizitation/
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
    │   ├── mahasiswa.controller.ts
    │   └── protected.controller.ts
    ├── middleware/
    │   └── auth.middleware.ts
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── mahasiswa.routes.ts
    │   └── protected.routes.ts
    └── service/
        ├── auth.service.ts
        ├── mahasiswa.service.ts
        └── token.service.ts
```

---

## 3. PENGELOLAAN SECRET & ENVIRONMENT VARIABLES
Kunci rahasia JWT dibaca secara dinamis dari file `.env` dan tidak pernah di-hardcode ke dalam kode sumber:
```env
DATABASE_URL="file:./prisma/jwt-auth-sandika.db"
PORT=3010
JWT_SECRET="sandika_academic_jwt_secret_key_super_secure_2026_unsap"
JWT_EXPIRES_IN="15m"
```
Template `.env.example` disediakan untuk deployment dengan nilai placeholder yang aman. File `.env` dan database `.db` diabaikan oleh `.gitignore`.

---

## 4. SKEMA BASIS DATA (PRISMA SCHEMA)
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client"
  output   = "./generated"
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

model Mahasiswa {
  id        Int      @id @default(autoincrement())
  nim       String   @unique
  nama      String
  prodi     String
  angkatan  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("mahasiswa")
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
| `GET /api/mahasiswa` | `GET` | `MAHASISWA`, `DOSEN`, `STAF`, `ADMIN` | `401 Unauthorized` | `403 Forbidden` |
| `GET /api/mahasiswa/:id` | `GET` | `MAHASISWA`, `DOSEN`, `STAF`, `ADMIN` | `401 Unauthorized` | `403 Forbidden` |
| `POST /api/mahasiswa` | `POST` | `ADMIN`, `DOSEN`, `STAF` | `401 Unauthorized` | `403 Forbidden` (Mahasiswa) |
| `PUT /api/mahasiswa/:id` | `PUT` | `ADMIN`, `DOSEN`, `STAF` | `401 Unauthorized` | `403 Forbidden` (Mahasiswa) |
| `DELETE /api/mahasiswa/:id`| `DELETE`| `ADMIN` | `401 Unauthorized` | `403 Forbidden` (Dosen, Staf, Mahasiswa) |
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
  -d '{"email":"sandika.mhs@akademik.id","password":"passwordSandika#2026"}'
```

**2. Mengakses Endpoint Terlindungi Profil Pribadi:**
```bash
curl -X GET http://localhost:3010/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**3. Mencoba Menambah Data Mahasiswa Menggunakan Akun Mahasiswa (Uji 403 Forbidden):**
```bash
curl -X POST http://localhost:3010/api/mahasiswa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_MAHASISWA>" \
  -d '{"nim":"240160221099","nama":"Uji Coba","prodi":"Sistem Informasi","angkatan":2026}'
```

---

## 7. HASIL PENGUJIAN OTOMATIS (TEST REPORT)

Pengujian otomatis dieksekusi menggunakan script:
```bash
npm test
```

| No | Skenario Pengujian | Endpoint | Target Status | Hasil Status | Status Kelulusan | Verifikasi Respons |
|:--:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Pemeriksaan kesehatan server API JWT | `GET /health` | 200 | 200 | **PASS** | Server aktif |
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
| 13 | Role STAF diizinkan mengakses panel rekap staf | `GET /protected/staf/rekap` | 200 | 200 | **PASS** | Otorisasi staf sukses |
| 14 | Role MAHASISWA ditolak mengakses panel rekap staf | `GET /protected/staf/rekap` | 403 | 403 | **PASS** | 403 Forbidden |
| 15 | Role ADMIN diizinkan mengakses audit tingkat tinggi | `GET /protected/admin/audit` | 200 | 200 | **PASS** | Otorisasi admin sukses |
| 16 | Role STAF ditolak mengakses audit tingkat admin | `GET /protected/admin/audit` | 403 | 403 | **PASS** | 403 Forbidden |
| 17 | Endpoint domain data mahasiswa terproteksi dari akses anonim | `GET /api/mahasiswa` | 401 | 401 | **PASS** | 401 Unauthorized |
| 18 | Pengguna terautentikasi dapat membaca koleksi mahasiswa | `GET /api/mahasiswa` | 200 | 200 | **PASS** | Koleksi mahasiswa tampil |
| 19 | Role MAHASISWA dilarang menambah data mahasiswa baru | `POST /api/mahasiswa` | 403 | 403 | **PASS** | 403 Forbidden |
| 20 | Role STAF berhak menambah data mahasiswa baru | `POST /api/mahasiswa` | 201 | 201 | **PASS** | Mahasiswa baru berhasil dibuat |
| 21 | Role STAF dilarang menghapus data mahasiswa | `DELETE /api/mahasiswa/:id` | 403 | 403 | **PASS** | 403 Forbidden |
| 22 | Role ADMIN berhasil mengeksekusi penghapusan data mahasiswa | `DELETE /api/mahasiswa/:id` | 200 | 200 | **PASS** | Data terhapus oleh admin |

**Tingkat Keberhasilan Pengujian:** 100% (22 dari 22 skenario pengujian lulus).

---

## 8. REFLEKSI & PEMANFAATAN AI ASSISTANT
Penerapan otorisasi JWT pada Pertemuan 10 mempertegas pentingnya arsitektur keamanan bertingkat:
1. Pemisahan tugas antara middleware autentikasi (`authenticateToken`) dan otorisasi (`authorizeRoles`) menjaga kode tetap modular dan mudah diuji.
2. Penegakan status code `401 Unauthorized` versus `403 Forbidden` memberikan diferensiasi yang presisi antara ketiadaan identitas dengan pelanggaran wewenang.
3. Seluruh rekomendasi AI Coding Assistant diverifikasi langsung melalui spesifikasi RFC 7519, standar Express middleware, dan pengujian aktual pada lingkungan terisolasi.

