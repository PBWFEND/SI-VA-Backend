# TUGAS PERTEMUAN 9: IMPLEMENTASI AUTENTIKASI BACKEND
## SISTEM INFORMASI ABSENSI MAHASISWA

---

### IDENTITAS MAHASISWA & PROYEK
- **Nama Mahasiswa:** Della Kartika
- **NIM:** 240160221008
- **Kelas:** SI-VA
- **Program Studi:** Sistem Informasi
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Absensi Mahasiswa
- **Nama Package:** `auth-absensi-della`
- **Lokasi Direktori:** `Della-Kartika-240160221008/pertemuan-9/Tugas-Authentication/`

---

## 1. PENDAHULUAN & TUJUAN PEMBELAJARAN
Proyek ini mengimplementasikan mekanisme autentikasi pengguna (*User Authentication*) berbasis Express.js, TypeScript, dan Prisma ORM dengan SQLite engine (`better-sqlite3`). Fokus utama dari praktikum ini adalah keamanan kredensial pengguna, kepatuhan arsitektur berlapis (*layered architecture*), serta pemisahan concern antara modul autentikasi dan modul domain bisnis absensi yang telah dibangun sebelumnya.

Tujuan pembelajaran:
1. Menerapkan pengacakan dan penguncian kata sandi (*password hashing*) menggunakan algoritma KDF modern (`scrypt`) yang tahan terhadap serangan GPU/ASIC.
2. Mencegah serangan *Timing Attack* pada proses verifikasi hash menggunakan `crypto.timingSafeEqual`.
3. Mengamankan data sensitif agar hash maupun plain-text kata sandi tidak pernah bocor ke lapisan respons client (*Data Sanitization*).
4. Menyediakan endpoint pendaftaran akun (`/auth/register`) dan otentikasi login (`/auth/login`) dengan validasi input yang ketat.
5. Mempertahankan kesinambungan domain utama Sistem Informasi Absensi Mahasiswa (`Absensi`).

---

## 2. ARSITEKTUR KEAMANAN & TEKNIS

### A. Algoritma Hashing: Scrypt KDF
Algoritma `scrypt` dipilih sebagai KDF (*Key Derivation Function*) standar Node.js `node:crypto`. `scrypt` dirancang khusus untuk memakan memori komputasi (*memory-hard*) secara terukur, sehingga sangat tangguh menghalau serangan *brute-force* atau serangan *rainbow table* berbasis perangkat keras keras (GPU/ASIC).
- **Salt:** 16 byte kriptografis acak (`randomBytes(16)`).
- **Key Length:** 64 byte.
- **Format Penyimpanan:** `salt:derivedKeyHex` (misal: `a1b2c3d4...:e5f6...`).

### B. Pencegahan Timing Attack: `timingSafeEqual`
Pada saat verifikasi password:
```typescript
const isMatch = timingSafeEqual(storedHashBuffer, derivedHashBuffer);
```
Perbandingan karakter demi karakter secara konvensional (`===`) dapat dianalisis durasi eksekusinya oleh penyerang untuk menebak awalan string. `timingSafeEqual` mengeksekusi perbandingan dengan waktu konstan (*constant-time*), memitigasi celah eksploitasi timing.

### C. Alur Data (Layered Architecture)
Sistem memisahkan tanggung jawab kode menjadi 4 lapisan utama:
1. **Routes Layer (`src/routes/`):** Mendefinisikan endpoint URL dan memetakan ke handler controller terkait.
2. **Controller Layer (`src/controller/`):** Mengelola siklus Request-Response, sanitasi tipe data, validasi field input, serta penentuan kode status HTTP (200, 201, 400, 401, 409, 500).
3. **Service Layer (`src/service/`):** Pusat aturan bisnis (*business logic*), proses hashing kata sandi, transaksi database via Prisma, serta pelemparan *custom error*.
4. **Data Access Layer (`prisma/`):** Interaksi basis data melalui Prisma Client yang terhubung ke SQLite adapter `better-sqlite3`.

---

## 3. STRUKTUR DIREKTORI
```text
Della-Kartika-240160221008/pertemuan-9/Tugas-Authentication/
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
    │   └── auth.controller.ts
    ├── routes/
    │   ├── absensi.routes.ts
    │   └── auth.routes.ts
    └── service/
        ├── absensi.service.ts
        └── auth.service.ts
```

---

## 4. SKEMA BASIS DATA (PRISMA SCHEMA)
Tabel data dikelola menggunakan Prisma ORM dengan dua model:
1. **`Pengguna`**: Menyimpan kredensial otentikasi pengguna sistem absensi.
2. **`Absensi`**: Menyimpan data rekaman presensi mahasiswa (mempertahankan domain UTS).

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
  role         String   @default("MAHASISWA")
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

## 5. SPESIFIKASI API ENDPOINT

### 1. Registrasi Akun Pengguna
- **Method & URL:** `POST /auth/register`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "nim": "240160221008",
    "nama": "Della Kartika",
    "email": "della@absensi.id",
    "password": "passwordDella#2026"
  }
  ```
- **Response Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Pendaftaran akun berhasil",
    "data": {
      "id": 1,
      "nim": "240160221008",
      "nama": "Della Kartika",
      "email": "della@absensi.id",
      "role": "MAHASISWA",
      "createdAt": "2026-11-04T13:28:00.000Z",
      "updatedAt": "2026-11-04T13:28:00.000Z"
    }
  }
  ```
- **Response Error Duplikasi (409 Conflict):**
  ```json
  {
    "success": false,
    "message": "Email sudah terdaftar dalam sistem"
  }
  ```
- **Response Error Validasi (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Password minimal harus 8 karakter"
  }
  ```

### 2. Login Pengguna
- **Method & URL:** `POST /auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "della@absensi.id",
    "password": "passwordDella#2026"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Autentikasi berhasil",
    "data": {
      "id": 1,
      "nim": "240160221008",
      "nama": "Della Kartika",
      "email": "della@absensi.id",
      "role": "MAHASISWA",
      "createdAt": "2026-11-04T13:28:00.000Z",
      "updatedAt": "2026-11-04T13:28:00.000Z"
    }
  }
  ```
- **Response Error Kredensial Salah (401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Email atau kata sandi salah"
  }
  ```

### 3. Pemeriksaan Kesehatan Server
- **Method & URL:** `GET /health`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Server dan layanan autentikasi absensi aktif"
  }
  ```

### 4. Integrasi Domain Absensi
- **Method & URL:** `GET /absensi`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Data absensi berhasil diambil",
    "total": 0,
    "data": []
  }
  ```

---

## 6. PANDUAN INSTALASI & MENJALANKAN SISTEM

### A. Persiapan Dependensi
```bash
npm install
```

### B. Migrasi Basis Data SQLite
```bash
npx prisma migrate dev --name init_auth
npx prisma generate
```

### C. Menjalankan Server
```bash
npm start
```
Server akan aktif pada `http://localhost:3009`.

### D. Pengujian Manual via cURL

**1. Registrasi Akun:**
```bash
curl -X POST http://localhost:3009/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nim":"240160221008","nama":"Della Kartika","email":"della@absensi.id","password":"passwordDella#2026"}'
```

**2. Login Berhasil:**
```bash
curl -X POST http://localhost:3009/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"della@absensi.id","password":"passwordDella#2026"}'
```

**3. Login Password Salah (Menguji 401 Unauthorized):**
```bash
curl -X POST http://localhost:3009/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"della@absensi.id","password":"salahPassword"}'
```

---

## 7. HASIL PENGUJIAN OTOMATIS (TEST REPORT)

Pengujian otomatis dijalankan dengan script:
```bash
npm test
```

| No | Skenario Pengujian | Endpoint | Target Status | Hasil Status | Status Kelulusan | Catatan Verifikasi |
|---|---|---|---|---|---|---|
| 1 | Pemeriksaan kesehatan server API absensi | `GET /health` | 200 | 200 | **PASS** | Server aktif dan merespons JSON standar |
| 2 | Pendaftaran akun pengguna baru dengan kredensial valid | `POST /auth/register` | 201 | 201 | **PASS** | Akun terdaftar, field password & hash tidak bocor ke client |
| 3 | Penolakan pendaftaran duplikasi email | `POST /auth/register` | 409 | 409 | **PASS** | Konflik terdeteksi: pesan 'Email sudah terdaftar' |
| 4 | Penolakan pendaftaran duplikasi NIM | `POST /auth/register` | 409 | 409 | **PASS** | Konflik terdeteksi: pesan 'NIM sudah terdaftar' |
| 5 | Penolakan registrasi dengan password kurang dari 8 karakter | `POST /auth/register` | 400 | 400 | **PASS** | Validasi panjang karakter password bekerja |
| 6 | Penolakan registrasi dengan injeksi role mandiri | `POST /auth/register` | 400 | 400 | **PASS** | Upaya eskalasi hak akses role ditolak |
| 7 | Login pengguna dengan email dan password valid | `POST /auth/login` | 200 | 200 | **PASS** | Login sukses, kredensial hash aman terproteksi |
| 8 | Penolakan login saat kata sandi salah | `POST /auth/login` | 401 | 401 | **PASS** | 401 Unauthorized: 'Email atau kata sandi salah' |
| 9 | Penolakan login saat email tidak terdaftar | `POST /auth/login` | 401 | 401 | **PASS** | 401 Unauthorized: pesan identik demi privasi akun |
| 10 | Penolakan login dengan payload kosong/tidak valid | `POST /auth/login` | 400 | 400 | **PASS** | 400 Bad Request: validasi body |
| 11 | Verifikasi endpoint domain bisnis data absensi tetap aktif | `GET /absensi` | 200 | 200 | **PASS** | Domain utama presensi mahasiswa tetap berfungsi |

**Tingkat Keberhasilan Pengujian:** 100% (11 dari 11 skenario lulus).

---

## 8. KESIMPULAN & REFLEKSI PEMBELAJARAN
Implementasi autentikasi pada Pertemuan 9 ini membuktikan pentingnya pengamanan lapis ganda pada sistem backend:
1. Penggunaan fungsi `scrypt` memastikan kata sandi disimpan dalam bentuk hash yang aman dari komputasi akselerasi GPU.
2. Penerapan `crypto.timingSafeEqual` menutup celah *side-channel timing attacks* yang rentan pada perbandingan string standar.
3. Sanitasi output data menjamin kerahasiaan informasi pengguna.
4. Arsitektur berlapis mempermudah perluasan sistem ke Pertemuan 10 (JWT & Authorization) dan Pertemuan 11 (API Security) tanpa merusak domain bisnis inti Sistem Informasi Absensi Mahasiswa.

