# Tugas Pertemuan 9 — Layanan Autentikasi dan Manajemen Data Mahasiswa

Repositori ini berisi implementasi resmi **Tugas Pertemuan 9 (Authentication)** mata kuliah Praktikum Backend Web Framework oleh **Sandika Yusuf**. Layanan ini mengintegrasikan sistem autentikasi pengguna berbasis kata sandi yang aman menggunakan algoritma `scrypt` dan salt unik dengan basis data SQLite serta Prisma ORM.

---

## 1. Identitas Pengembang & Proyek

| Atribut | Keterangan |
|---|---|
| **Nama Mahasiswa** | Sandika Yusuf Permana |
| **NIM** | 240160221044 |
| **Kelas** | SI-VA |
| **Mata Kuliah** | Praktikum Backend Web Framework |
| **Pertemuan** | Pertemuan 9 — Authentication: Register, Login, dan Password Hashing |
| **Studi Kasus** | Sistem Informasi Akademik / Manajemen Data Mahasiswa |
| **Paket Aplikasi** | `auth-mahasiswa-sandika` |

---

## 2. Fitur Utama & Kepatuhan Keamanan

1. **Registrasi Akun Baru (`POST /auth/register`)**:
   - Menerima `nim`, `nama`, `email`, dan `password`.
   - Menjamin keunikan `email` dan `nim` (menghasilkan status HTTP `409 Conflict` jika terjadi duplikasi).
   - Menolak field `role` dari klien (role publik default adalah `mahasiswa`).
   - Validasi ketat format email, format NIM numerik, dan password minimal 8 karakter.
2. **Password Hashing dengan `scrypt`**:
   - Membangkitkan salt acak 16 byte (`randomBytes(16)`).
   - Menghasilkan kunci turunan (*derived key*) 64 byte melalui `scrypt`.
   - Menyimpan hash berformat `scrypt$<salt-hex>$<derived-key-hex>`.
   - Kata sandi asli tidak pernah disimpan pada basis data maupun dicatat dalam log server.
3. **Login & Verifikasi Kredensial (`POST /auth/login`)**:
   - Memverifikasi kunci turunan secara aman menggunakan `timingSafeEqual` untuk mencegah *timing attacks*.
   - Mengembalikan pesan kegagalan seragam `"Email atau kata sandi salah"` (HTTP `401 Unauthorized`) untuk mencegah kebocoran keberadaan email (*User Enumeration*).
4. **Proteksi Respons API**:
   - Seluruh endpoint respons autentikasi hanya mengembalikan profil publik (`id`, `nim`, `nama`, `email`, `role`, `createdAt`).
   - Field `password` dan `passwordHash` tidak pernah dibocorkan ke client.
5. **Preservasi Resource Domain Mahasiswa**:
   - Endpoint CRUD domain `/mahasiswa` tetap aktif dan terintegrasi pada model database.

---

## 3. Struktur Direktori

```text
Tugas-Authentication/
├── app.ts                  # Konfigurasi middleware Express, routing, dan error handling
├── server.ts               # Inisialisasi HTTP server dan graceful shutdown
├── client.ts               # Facade singleton PrismaClient
├── prisma.config.ts        # Konfigurasi Prisma 7
├── package.json            # Definisi dependensi dan scripts
├── tsconfig.json           # Konfigurasi compiler TypeScript
├── .env.example            # Template variabel lingkungan
├── .env                    # Variabel lingkungan lokal
├── .gitignore              # Proteksi file rahasia dan database
├── README.md               # Dokumentasi resmi
├── test.ts                 # Suite pengujian otomatis (11 skenario)
├── prisma/
│   ├── schema.prisma       # Definisi model Pengguna dan Mahasiswa
│   └── migrations/         # Riwayat migrasi DDL database
└── src/
    ├── config/
    │   └── client.ts       # Adapter better-sqlite3 dan singleton PrismaClient
    ├── controller/
    │   ├── auth.controller.ts       # Validasi dan response HTTP autentikasi
    │   └── mahasiswa.controller.ts  # Controller domain mahasiswa
    ├── routes/
    │   ├── auth.routes.ts           # Rute /auth/register dan /auth/login
    │   └── mahasiswa.routes.ts      # Rute CRUD /mahasiswa
    └── service/
        ├── auth.service.ts          # Hashing scrypt, verifikasi timing-safe, & Prisma query
        └── mahasiswa.service.ts     # Logika bisnis domain mahasiswa
```

---

## 4. Panduan Menjalankan Aplikasi

### 1. Masuk ke Direktori Proyek
```bash
cd SandikaYusuf-240160221044/Pertemuan-9/Tugas-Authentication
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Siapkan Lingkungan
Salin berkas template environment:
```bash
cp .env.example .env
```

### 4. Eksekusi Migrasi & Generate Prisma Client
```bash
npx prisma migrate dev --name init_auth
npx prisma generate
```

### 5. Jalankan Server
- Mode pengembangan: `npm run dev`
- Mode standar: `npm start`
Server akan aktif di `http://localhost:3009`.

---

## 5. Dokumentasi Endpoint & Contoh cURL

### A. Registrasi Pengguna Baru (`POST /auth/register`)
```bash
curl -i -X POST http://localhost:3009/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nim": "240160221044",
    "nama": "Sandika Yusuf Permana",
    "email": "Yusuf@akademik.id",
    "password": "passwordKuat#2026"
  }'
```

**Respons (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Pendaftaran akun berhasil",
  "data": {
    "id": 1,
    "nim": "240160221044",
    "nama": "Sandika Yusuf Permana",
    "email": "Yusuf@akademik.id",
    "role": "mahasiswa",
    "createdAt": "2026-11-04T12:00:00.000Z"
  }
}
```

### B. Login Pengguna (`POST /auth/login`)
```bash
curl -i -X POST http://localhost:3009/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Yusuf@akademik.id",
    "password": "passwordKuat#2026"
  }'
```

**Respons (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Autentikasi berhasil",
  "data": {
    "id": 1,
    "nim": "240160221044",
    "nama": "Sandika Yusuf",
    "email": "Yusuf@akademik.id",
    "role": "mahasiswa",
    "createdAt": "2026-11-04T12:00:00.000Z"
  }
}
```

### C. Login Gagal — Kredensial Salah (HTTP 401 Unauthorized)
```bash
curl -i -X POST http://localhost:3009/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Yusuf@akademik.id",
    "password": "passwordSalah123"
  }'
```

**Respons:**
```json
{
  "success": false,
  "message": "Email atau kata sandi salah"
}
```

---

## 6. Hasil Pengujian Otomatis (`npm test`)

Suite pengujian otomatis dijalankan melalui perintah `npm test` (`node --experimental-strip-types test.ts`):

| No | Skenario Pengujian | Endpoint / Target | Status Target | Status Aktual | Hasil |
|:---:|---|---|:---:|:---:|:---:|
| 1 | Pemeriksaan kesehatan server | `GET /health` | 200 | 200 | **PASS** |
| 2 | Pendaftaran akun pengguna valid | `POST /auth/register` | 201 | 201 | **PASS** |
| 3 | Penolakan pendaftaran duplikasi email | `POST /auth/register` | 409 | 409 | **PASS** |
| 4 | Penolakan pendaftaran duplikasi NIM | `POST /auth/register` | 409 | 409 | **PASS** |
| 5 | Penolakan password kurang dari 8 karakter | `POST /auth/register` | 400 | 400 | **PASS** |
| 6 | Penolakan registrasi publik dengan role | `POST /auth/register` | 400 | 400 | **PASS** |
| 7 | Login pengguna kredensial benar | `POST /auth/login` | 200 | 200 | **PASS** |
| 8 | Penolakan login password salah | `POST /auth/login` | 401 | 401 | **PASS** |
| 9 | Penolakan login email tidak terdaftar | `POST /auth/login` | 401 | 401 | **PASS** |
| 10 | Penolakan login body kosong | `POST /auth/login` | 400 | 400 | **PASS** |
| 11 | Verifikasi endpoint domain data mahasiswa | `GET /mahasiswa` | 200 | 200 | **PASS** |

**Tingkat Keberhasilan:** 11 dari 11 pengujian lulus (**100% PASS**).

---

## 7. Refleksi & Etika Pemanfaatan AI Coding Assistant

Sesuai ketentuan dosen pada Poin 20 silabus:
1. **Pemanfaatan AI**: AI digunakan untuk mengaudit alur derivasi kunci kriptografi `scrypt`, meninjau format penyimpanan hash `scrypt$<salt>$<derivedKey>`, serta menyusun skenario uji kegagalan kredensial secara komprehensif.
2. **Kepatuhan Etika Keamanan**: Tidak ada kredensial nyata, token rahasia, maupun data pribadi yang dikirimkan ke layanan AI.
3. **Tanggung Jawab Teknis**: Seluruh keputusan teknis, validasi tipe data, kode status HTTP, dan struktur database diuji secara mandiri pada lingkungan lokal dan dibuktikan melalui eksekusi pengujian otomatis.

