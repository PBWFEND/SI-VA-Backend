# Tugas Authentication — Sistem Informasi Perpustakaan (Pertemuan 9)

## Identitas Mahasiswa
- **Nama:** Sarah Azkiya
- **NIM:** 240160221057
- **Kelas / Angkatan:** SI-VA / 2024
- **Mata Kuliah:** Pemrograman Berbasis Web Back End
- **Kelompok:** Kelompok 6
  1. Raihan Anugrah Pratama (240160221036)
  2. Yosep Adipura Herdi (240160221048)
  3. Sarah Azkiya (240160221057)
- **Studi Kasus:** Sistem Informasi Perpustakaan

---

## 1. Deskripsi Tugas

Tugas Pertemuan 9 berfokus pada implementasi sistem **Authentication** (Registrasi dan Login) yang aman untuk Sistem Informasi Perpustakaan menggunakan arsitektur Route–Controller–Service dengan teknologi:
- **Runtime & Bahasa:** Node.js (v24) & TypeScript
- **Framework Web:** Express.js 5
- **ORM & Database:** Prisma ORM 7 dengan SQLite (`better-sqlite3` driver adapter)
- **Kriptografi:** Modul bawaan `node:crypto` dengan fungsi KDF `scrypt` dan salt unik 16-byte (`randomBytes`)
- **Keamanan:** Perbandingan timing-safe via `crypto.timingSafeEqual` dan sanitasi respons publik

> [!IMPORTANT]
> Sesuai instruksi resmi Pertemuan 9, fokus tugas adalah **Authentication** (bukan authorization). Proyek ini secara sengaja **TIDAK** menggunakan JSON Web Token (JWT), session cookies, maupun role middleware, karena materi tersebut merupakan cakupan resmi Pertemuan 10.

---

## 2. Struktur Direktori

```text
tugas-authentication/
├── .env                       # Environment database URL
├── .env.example               # Template environment
├── .gitignore                 # File yang diabaikan git
├── package.json               # Dependensi & skrip proyek
├── tsconfig.json              # Konfigurasi TypeScript
├── app.ts                     # Inisialisasi Express & error handler terpusat
├── server.ts                  # Bootstrapping server
├── client.ts                  # Koneksi Prisma Client SQLite
├── test-runner.ts             # Test runner otomatis (26 skenario)
├── README.md                  # Dokumentasi teknis
└── src/
    ├── routes/
    │   └── auth.routes.ts     # Route mapping POST /register & POST /login
    ├── controller/
    │   └── auth.controller.ts # Validasi input request & HTTP status formatting
    └── service/
        └── auth.service.ts    # Hashing scrypt, verifikasi password & Prisma query
```

---

## 3. Spesifikasi Endpoint Authentication

### A. Registrasi Pengguna Baru (`POST /auth/register`)
- **URL:** `/auth/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "nama": "Sarah Azkiya",
    "nim": "240160221057",
    "email": "sarah@example.test",
    "password": "password-kuat-123"
  }
  ```
- **Validasi:**
  - `nama`: String non-empty.
  - `nim`: String numerik 8–15 digit (identitas unik kedua).
  - `email`: Format alamat email valid dan belum terdaftar (unik).
  - `password`: String minimal 8 karakter.
- **Response Sukses (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Registrasi pengguna berhasil",
    "data": {
      "id": 1,
      "nama": "Sarah Azkiya",
      "nim": "240160221057",
      "email": "sarah@example.test"
    }
  }
  ```
- **Response Error:**
  - `400 Bad Request`: Input tidak memenuhi kriteria validasi.
  - `409 Conflict`: Email atau NIM sudah terdaftar di database.

---

### B. Login Pengguna (`POST /auth/login`)
- **URL:** `/auth/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "sarah@example.test",
    "password": "password-kuat-123"
  }
  ```
- **Validasi & Verifikasi:**
  - Validasi keberadaan dan tipe data field `email` dan `password`.
  - Pencarian pengguna berdasarkan email di SQLite.
  - Ekstraksi salt dari `passwordHash` tersimpan (`scrypt$<salt>$<derivedKey>`).
  - Komputasi ulang `scrypt` dan verifikasi dengan `crypto.timingSafeEqual`.
- **Response Sukses (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "data": {
      "id": 1,
      "nama": "Sarah Azkiya",
      "nim": "240160221057",
      "email": "sarah@example.test"
    }
  }
  ```
- **Response Error:**
  - `400 Bad Request`: Format body tidak valid.
  - `401 Unauthorized`: Kredensial tidak valid (email tidak ditemukan atau password salah, pesan generik: `"Email atau password salah"`).

---

## 4. Mekanisme Password Hashing & Keamanan

1. **Algoritma `scrypt`:**
   - Menggunakan `node:crypto.scrypt` dengan salt acak 16 byte (`crypto.randomBytes(16)`).
   - Panjang kunci turunan: 64 byte (128 karakter heksadesimal).
   - Format penyimpanan: `scrypt$<salt-hex>$<derived-key-hex>`.
2. **Pencegahan Timing Attack:**
   - Verifikasi membandingkan buffer menggunakan `crypto.timingSafeEqual` setelah memastikan panjang buffer identik.
3. **Pencegahan User Enumeration:**
   - Endpoint login mengembalikan pesan error yang persis sama baik untuk akun yang tidak ada maupun kata sandi yang salah.
4. **Proteksi Kredensial:**
   - Field `password` dan `passwordHash` tidak pernah dikembalikan ke client pada respons API.

---

## 5. Contoh Perintah cURL

```bash
# 1. Registrasi Akun Baru
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Sarah Azkiya","nim":"240160221057","email":"sarah@example.test","password":"password-kuat-123"}'

# 2. Login Akun
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah@example.test","password":"password-kuat-123"}'

# 3. Percobaan Login dengan Password Salah (Mengembalikan 401)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah@example.test","password":"password-salah"}'
```

---

## 6. Cara Menjalankan & Menguji

```bash
# Pindah ke direktori tugas
cd Sarah-Azkiya-240160221057/Pertemuan-9/tugas-authentication

# Menjalankan test runner otomatis
node --experimental-strip-types test-runner.ts

# Memeriksa tipe data TypeScript
npx tsc --noEmit
```

---

## 7. Hasil Pengujian Aktual

- **Unit & Endpoint Test Runner:** 26/26 lolos (**100% Pass**).
- **TypeScript Typecheck:** 0 error (**Zero Compilation Errors**).
- **Database Status:** Terhubung dengan SQLite via Prisma ORM 7.
- **Pernyataan Penggunaan AI (§20):** AI digunakan sebagai alat bantu pair-programming untuk analisis kode, penyusunan test suite otomatis, dan penulisan dokumentasi teknis. Logika bisnis, algoritma `scrypt`, dan validasi data telah diaudit serta diuji langsung.

