# TUGAS PERTEMUAN 11: IMPLEMENTASI KEAMANAN BACKEND DAN API
## SISTEM INFORMASI AKADEMIK / MANAJEMEN DATA MAHASISWA

---

### IDENTITAS MAHASISWA & PROYEK
- **Nama Mahasiswa:** Sandika Yusuf Permana
- **NIM:** 240160221044
- **Kelas:** SI-VA
- **Program Studi:** Sistem Informasi
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Akademik / Manajemen Data Mahasiswa
- **Nama Package:** `api-security-mahasiswa-sandika`
- **Lokasi Direktori:** `SandikaYusuf-240160221044/Pertemuan-11/Tugas-Keamanan-API/`

---

## 1. PENDAHULUAN & PRINSIP KEAMANAN
Proyek ini mengimplementasikan lapisan pertahanan menyeluruh (*Defense-in-Depth*) pada REST API Sistem Informasi Akademik berbasis Node.js 22, Express.js 5, Prisma ORM 7, dan SQLite (`better-sqlite3`). Melanjutkan autentikasi (Pertemuan 9) dan otorisasi JWT (Pertemuan 10), praktikum Pertemuan 11 ini menambahkan perlindungan komprehensif terhadap ancaman umum web siber:
1. **Security Headers:** Menggunakan `helmet` untuk mitigasi *Clickjacking*, *MIME-sniffing*, dan pembatasan konten (*Content-Security-Policy*), serta menyembunyikan header `X-Powered-By`.
2. **CORS Selektif:** Mengatur *origin whitelist* yang ketat sehingga hanya domain frontend resmi yang dapat memanggil API dari peramban.
3. **Rate Limiting & Pembatasan Sumber Daya:** Melindungi endpoint dari serangan *Denial of Service (DoS)* dan *Brute-Force* menggunakan `express-rate-limit` serta membatasi ukuran request payload maksimal 10KB.
4. **Validasi & Sanitasi Masukan:** Memvalidasi tipe, format, dan batasan panjang string sebelum request diteruskan ke controller.
5. **Anti-SQL Injection:** Seluruh query database dieksekusi melalui parameterized queries Prisma ORM.
6. **Error Handler Aman:** Menangkap error internal secara terpusat tanpa membocorkan rincian *stack trace* atau struktur database ke sisi klien.

---

## 2. STRUKTUR DIREKTORI PROYEK
```text
SandikaYusuf-240160221044/Pertemuan-11/Tugas-Keamanan-API/
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
    │   └── mahasiswa.controller.ts
    ├── middleware/
    │   ├── auth.middleware.ts
    │   ├── security.middleware.ts
    │   └── validation.middleware.ts
    ├── routes/
    │   ├── auth.routes.ts
    │   └── mahasiswa.routes.ts
    └── service/
        ├── auth.service.ts
        ├── mahasiswa.service.ts
        └── token.service.ts
```

---

## 3. PENGELOLAAN SECRET & ENVIRONMENT VARIABLES
Nilai kredensial dan konfigurasi keamanan dibaca murni dari environment variables (`.env`) yang diabaikan oleh `.gitignore`:
```env
DATABASE_URL="file:./prisma/security-sandika.db"
PORT=3011
JWT_SECRET="sandika_academic_api_security_jwt_secret_2026_unsap"
JWT_EXPIRES_IN="15m"
CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000,https://akademik.unsap.ac.id"
```
File template `.env.example` disediakan tanpa nilai rahasia untuk standarisasi deployment.

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

## 5. SECURITY CHECKLIST & MATRIKS PROTEKSI API

| Komponen Proteksi | Lapisan Pemeriksaan | Aturan / Konfigurasi | Status Respon Jika Melanggar |
|---|---|---|:---:|
| **Security Headers** | Global Middleware | `helmet({ xFrameOptions: "sameorigin", xContentTypeOptions: true, hidePoweredBy: true })` | Header browser aman terpasang |
| **CORS Whitelist** | Global Middleware | Whitelist: `localhost:3000`, `127.0.0.1:3000`, `akademik.unsap.ac.id` | Header `Access-Control-Allow-Origin` ditiadakan |
| **Request ID** | Global Middleware | Menempelkan UUID acak pada header respons `X-Request-Id` | Respon menyertakan ID pelacak audit |
| **Payload Size Limit** | Global Middleware | `express.json({ limit: "10kb" })` | `413 Payload Too Large` |
| **Rate Limit Auth** | Auth Routes | Maksimal 10 request per 15 menit per IP | `429 Too Many Requests` |
| **Rate Limit Global** | API Routes | Maksimal 200 request per 15 menit per IP | `429 Too Many Requests` |
| **Input Validation** | Route Middleware | Validasi regex angka NIM (8-20), nama (3-100 kar), angkatan (2000-2100) | `400 Bad Request` |
| **Query Sanitization** | Route Middleware | Batas maksimal panjang string parameter pencarian 100 karakter | `400 Bad Request` |
| **Anti-SQL Injection** | Service Layer | Prisma ORM parameter query binding (bukan string concatenation) | Query aman (payload diperlakukan harfiah) |
| **Autentikasi JWT** | Auth Middleware | Header `Authorization: Bearer <token>`, validasi secret & `exp` | `401 Unauthorized` |
| **Otorisasi RBAC** | Auth Middleware | `authorizeRoles("ADMIN", "DOSEN", "STAF")` | `403 Forbidden` |
| **Safe Error Handler**| Central Handler | Menangkap exception tanpa membocorkan database error / stack trace | `500 Internal Server Error` (Generik) |

---

## 6. PANDUAN INSTALASI & PENGUJIAN MANUAL

### A. Instalasi Dependensi
```bash
npm install
```

### B. Migrasi Basis Data SQLite
```bash
npx prisma migrate dev --name init_security
npx prisma generate
```

### C. Menjalankan Server API
```bash
npm start
```
Server akan aktif pada `http://localhost:3011`.

### D. Pengujian Manual via cURL

**1. Verifikasi Security Headers & Request ID:**
```bash
curl -I http://localhost:3011/health
```

**2. Uji CORS Origin Tidak Terdaftar:**
```bash
curl -I -H "Origin: http://malicious-site.com" http://localhost:3011/health
```

**3. Uji Penolakan Ukuran Body > 10KB:**
```bash
curl -X POST http://localhost:3011/mahasiswa \
  -H "Content-Type: application/json" \
  -d '{"large":"'$(head -c 15000 < /dev/zero | tr '\0' 'A')'"}'
```

**4. Uji Penolakan SQL Injection pada Pencarian:**
```bash
curl -X GET "http://localhost:3011/api/mahasiswa?search='%20OR%20'1'='1" \
  -H "Authorization: Bearer <TOKEN_JWT>"
```

---

## 7. HASIL PENGUJIAN OTOMATIS (TEST REPORT)

Pengujian otomatis dieksekusi menggunakan script:
```bash
npm test
```

| No | Skenario Pengujian | Endpoint | Target Status | Hasil Status | Status Kelulusan | Verifikasi Perilaku |
|:--:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Pemeriksaan kesehatan server API Keamanan | `GET /health` | 200 | 200 | **PASS** | Server aktif dan responsif |
| 2 | Verifikasi Security Headers Helmet (nosniff, SAMEORIGIN, no X-Powered-By) | `GET /health` | 200 | 200 | **PASS** | Header browser terpasang sempurna |
| 3 | Pemasangan header pelacak unik X-Request-Id | `GET /health` | 200 | 200 | **PASS** | X-Request-Id UUID tersemat |
| 4 | Origin terdaftar menerima header Access-Control-Allow-Origin | `GET /health` | 200 | 200 | **PASS** | CORS whitelist bekerja untuk localhost |
| 5 | Origin tidak terdaftar tidak menerima header Access-Control-Allow-Origin | `GET /health` | 200 | 200 | **PASS** | Origin berbahaya diblokir peramban |
| 6 | Penolakan payload request yang melebihi batas 10KB | `POST /mahasiswa` | 413 | 413 | **PASS** | 413 Payload Too Large |
| 7 | Validasi input menolak NIM yang mengandung karakter non-angka | `POST /auth/register` | 400 | 400 | **PASS** | 400 Bad Request: Format NIM angka |
| 8 | Autentikasi akun dan penerbitan token JWT aman | `POST /auth/login` | 200 | 200 | **PASS** | Token terbit tanpa kebocoran hash |
| 9 | Penolakan pembuatan mahasiswa dengan nama terlalu pendek (<3 karakter) | `POST /api/mahasiswa` | 400 | 400 | **PASS** | 400 Bad Request: Validasi panjang nama |
| 10 | Penolakan pembuatan mahasiswa dengan tahun angkatan tidak valid | `POST /api/mahasiswa` | 400 | 400 | **PASS** | 400 Bad Request: Validasi rentang angkatan |
| 11 | Pencarian dengan payload SQL Injection dinetralkan oleh query terparameterisasi | `GET /api/mahasiswa` | 200 | 200 | **PASS** | String harfiah, tidak terjadi SQL leak |
| 12 | Penolakan akses endpoint data mahasiswa tanpa token autentikasi | `GET /api/mahasiswa` | 401 | 401 | **PASS** | 401 Unauthorized |
| 13 | Role MAHASISWA ditolak saat mencoba menambah data mahasiswa baru | `POST /api/mahasiswa` | 403 | 403 | **PASS** | 403 Forbidden |
| 14 | Role ADMIN berhasil membuat data mahasiswa baru secara aman | `POST /api/mahasiswa` | 201 | 201 | **PASS** | 201 Created |
| 15 | Role ADMIN berhasil mengeksekusi penghapusan data mahasiswa | `DELETE /api/mahasiswa/:id`| 200 | 200 | **PASS** | 200 OK |
| 16 | Error handler menangani sintaks JSON buruk tanpa membocorkan stack trace | `POST /api/mahasiswa` | 400 | 400 | **PASS** | Stack trace dan internal path terlindungi |

**Tingkat Keberhasilan Pengujian:** 100% (16 dari 16 skenario pengujian lulus).

---

## 8. REFLEKSI & PEMANFAATAN AI ASSISTANT
Penerapan standar keamanan API pada Pertemuan 11 menyimpulkan bahwa:
1. Keamanan backend bukan sekadar satu fitur, melainkan rantai pertahanan berlapis (*Defense-in-Depth*).
2. Kegagalan satu lapisan (misalnya CORS yang tidak dipatuhi klien non-browser) tetap dapat ditahan oleh lapisan berikutnya (autentikasi JWT, validasi input, dan parameterisasi SQL).
3. Pemanfaatan AI Coding Assistant sangat membantu dalam merancang skenario uji negatif (*negative test cases*) dan memverifikasi kepatuhan header keamanan standar OWASP.

