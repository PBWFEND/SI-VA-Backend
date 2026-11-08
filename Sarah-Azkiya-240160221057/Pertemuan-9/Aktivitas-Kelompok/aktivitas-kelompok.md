# Aktivitas Kelompok — Perancangan & Security Review Authentication (Pertemuan 9)

## Identitas Kelompok

**Kelompok:** 6

### Anggota Kelompok
1. **Raihan Anugrah Pratama** (NIM: 240160221036)
2. **Yosep Adipura Herdi** (NIM: 240160221048)
3. **Sarah Azkiya** (NIM: 240160221057)

**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Topik:** Authentication: Register, Login, dan Password Hashing  
**Studi Kasus:** Sistem Informasi Perpustakaan  
**Teknologi:** Node.js 24, Express.js 5, Prisma ORM 7, SQLite (`better-sqlite3`), `node:crypto` (`scrypt`)

---

## 1. Perancangan Kontrak API Authentication

Dalam Sistem Informasi Perpustakaan, authentication mengelola identitas pemustaka dan staf perpustakaan.

### A. Tabel Perancangan Endpoint Register (`POST /auth/register`)

| Komponen | Spesifikasi & Detail Implementasi |
|---|---|
| **Endpoint & Method** | `POST /auth/register` |
| **Input Payload (JSON)** | `nama`, `nim`, `email`, `password`, `role` (opsional) |
| **Tipe Data Input** | - `nama`: `string`<br>- `nim`: `string`<br>- `email`: `string`<br>- `password`: `string`<br>- `role`: `string` (opsional, default `"user"`) |
| **Aturan Validasi** | 1. Body harus objek JSON non-null.<br>2. `nama`: teks non-empty setelah trim.<br>3. `nim`: string angka dengan panjang 8–15 digit (`/^\d{8,15}$/`).<br>4. `email`: format alamat email standar (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).<br>5. `password`: string dengan panjang minimal 8 karakter.<br>6. `email` belum terdaftar di database.<br>7. `nim` belum terdaftar di database. |
| **Operasi Database** | 1. `prisma.pengguna.findUnique({ where: { email } })`<br>2. `prisma.pengguna.findUnique({ where: { nim } })`<br>3. `scryptAsync(password, salt, 64)`<br>4. `prisma.pengguna.create({ data: { nama, nim, email, passwordHash, role } })` |
| **Response Sukses** | **HTTP 201 Created**<br>```json\n{\n  "success": true,\n  "message": "Registrasi pengguna berhasil",\n  "data": {\n    "id": 1,\n    "nama": "Sarah Azkiya",\n    "nim": "240160221057",\n    "email": "sarah@example.test"\n  }\n}\n``` |
| **Response Gagal** | - **400 Bad Request**: Validasi field gagal / tipe tidak sesuai.<br>- **409 Conflict**: Email atau NIM sudah terdaftar.<br>- **500 Internal Error**: Kesalahan server / database. |

### B. Tabel Perancangan Endpoint Login (`POST /auth/login`)

| Komponen | Spesifikasi & Detail Implementasi |
|---|---|
| **Endpoint & Method** | `POST /auth/login` |
| **Input Payload (JSON)** | `email`, `password` |
| **Tipe Data Input** | - `email`: `string`<br>- `password`: `string` |
| **Aturan Validasi** | 1. Body harus objek JSON non-null.<br>2. `email`: teks non-empty dengan format email valid.<br>3. `password`: teks non-empty. |
| **Operasi Database** | 1. `prisma.pengguna.findUnique({ where: { email } })`<br>2. Ekstraksi salt dari `passwordHash`<br>3. Hashing ulang password input dengan salt tersebut.<br>4. `crypto.timingSafeEqual(originalKeyBuffer, derivedKeyBuffer)` |
| **Response Sukses** | **HTTP 200 OK**<br>```json\n{\n  "success": true,\n  "message": "Login berhasil",\n  "data": {\n    "id": 1,\n    "nama": "Sarah Azkiya",\n    "nim": "240160221057",\n    "email": "sarah@example.test"\n  }\n}\n``` *(Catatan: Sesuai scope P9, tidak menerbitkan JWT atau token)* |
| **Response Gagal** | - **400 Bad Request**: Format email / password tidak valid.<br>- **401 Unauthorized**: Email tidak ditemukan ATAU password salah (pesan generik: `"Email atau password salah"`).<br>- **500 Internal Error**: Kesalahan server / database. |

---

## 2. Security Review & Analisis Keamanan

Kelompok 6 melakukan telaah mendalam terkait prinsip keamanan pada implementasi Authentication:

### 1. Bahaya Plaintext Password
Menyimpan kata sandi dalam bentuk teks terbuka (*plaintext*) adalah pelanggaran fatal keamanan. Jika file database SQLite bocor atau diakses oleh pihak tidak berwenang, seluruh akun pemustaka langsung terkompromi. Bahkan hash cepat seperti `MD5` atau `SHA-256` tanpa salt mudah dibobol melalui *Rainbow Tables* atau serangan *Brute Force* berbasis GPU modern. Oleh karena itu, digunakan fungsi penurunan kunci (*Key Derivation Function* / KDF) lambat dan aman: **`scrypt`** dari modul resmi `node:crypto`.

### 2. Mengapa `passwordHash` Dilarang Masuk ke Response API
`passwordHash` adalah rahasia internal server yang digunakan sebagai pembanding saat autentikasi. Jika `passwordHash` dikirimkan ke client pada response `POST /auth/register` atau `POST /auth/login`:
- Hash tersebut dapat disimpan di cache peramban, log jaringan proxy, atau diinspeksi oleh penyerang.
- Penyerang dapat melakukan serangan pemecahan hash offline (*offline dictionary attack*) tanpa memicu limitasi laju (*rate limiting*) server.
- Pada sistem tertentu, hash yang bocor dapat dimanfaatkan untuk serangan *Pass-the-Hash*.
Oleh karena itu, layer Controller dan Service secara tegas memfilter objek pengguna sehingga hanya atribut publik (`id`, `nama`, `nim`, `email`) yang dikembalikan.

### 3. Risiko Duplikasi Email & Fungsi Database Unique Constraint
Jika dua akun memiliki email yang sama, terjadi ambiguitas saat login: akun mana yang harus dicocokkan kata sandinya? Serangan pengambilalihan akun (*account takeover*) juga dapat terjadi. Pengecekan di tingkat aplikasi saja tidak cukup karena adanya potensi kondisi balapan (*race condition* / permintaan konkuren). Oleh karena itu, **Unique Constraint** (`@unique` pada level skema Prisma dan SQLite) bertindak sebagai benteng pertahanan terakhir yang menjamin tidak ada duplikasi data di tingkat penyimpanan fisik.

### 4. Alasan Pesan Error Login Gagal Dibuat Seragam (Pesan Generik)
Jika server mengembalikan pesan spesifik seperti *"Email belum terdaftar"* ketika email tidak ditemukan, dan *"Kata sandi salah"* ketika email ditemukan:
- Penyerang dapat memanfaatkan perbedaan respons tersebut untuk melakukan *User Enumeration Attack* (menebak daftar email mahasiswa/pengguna yang valid di sistem perpustakaan).
- Dengan merespons pesan generik `"Email atau password salah"` pada status HTTP `401 Unauthorized` untuk kedua kondisi kegagalan, sistem tidak membocorkan keberadaan akun kepada penyerang.

### 5. Perbedaan Mendasar Antara Authentication dan Authorization
- **Authentication (Autentikasi):** Menjawab pertanyaan *"Siapakah Anda?"* (Membuktikan identitas pengguna melalui kredensial seperti email/NIM dan password).
- **Authorization (Otorisasi):** Menjawab pertanyaan *"Apa yang boleh Anda lakukan?"* (Menentukan hak akses pengguna setelah identitasnya terbukti, misalnya role admin berhak menghapus buku, sedangkan role anggota hanya berhak meminjam).

### 6. Mengapa Pertemuan 9 Belum Menerapkan Authorization / JWT
Pertemuan 9 berfokus pada fondasi terpenting: keamanan penyimpanan identitas, pemanfaatan salt kriptografis unik, algoritma hashing `scrypt`, dan pencegahan serangan *timing attack* via `timingSafeEqual`. Penambahan token bearer (JWT), session cookies, maupun role middleware berada pada domain materi Pertemuan 10. Memasukkan JWT di luar instruksi resmi akan menambah kompleksitas yang tidak relevan dengan rubrik evaluasi Pertemuan 9.

---

## 3. Dokumentasi Alur Operasi (Request Flow)

### A. Alur Register
```text
[Client]
   │
   │  1. POST /auth/register { nama, nim, email, password }
   ▼
[Route: auth.routes.ts]
   │
   │  2. Meneruskan request ke controller
   ▼
[Controller: auth.controller.ts]
   │
   │  3. Validasi tipe data, format NIM, regex email, min length password
   ▼
[Service: auth.service.ts]
   │
   │  4. Cek keunikan email & NIM di database via Prisma
   │  5. Generate salt acak 16-byte (crypto.randomBytes)
   │  6. Komputasi hash scrypt (scryptAsync) -> scrypt$salt$derivedKey
   ▼
[Database SQLite via Prisma Client]
   │
   │  7. Simpan record pengguna ke tabel Pengguna
   ▼
[Service & Controller]
   │
   │  8. Sanitasi data (hapus passwordHash)
   ▼
[Client]
      9. Response 201 Created { id, nama, nim, email }
```

### B. Alur Login
```text
[Client]
   │
   │  1. POST /auth/login { email, password }
   ▼
[Route: auth.routes.ts]
   │
   │  2. Meneruskan request ke controller
   ▼
[Controller: auth.controller.ts]
   │
   │  3. Validasi format email dan keberadaan password
   ▼
[Service: auth.service.ts]
   │
   │  4. Query user berdasarkan email (prisma.pengguna.findUnique)
   │     ├─ Jika user TIDAK ADA ──────> Lempar UnauthorizedError (401)
   │     └─ Jika user DITEMUKAN:
   │          5. Ekstraksi salt dari passwordHash
   │          6. Komputasi ulang scrypt dari password input dengan salt tersebut
   │          7. Bandingkan derived key via crypto.timingSafeEqual()
   │             ├─ Jika TIDAK COCOK ─> Lempar UnauthorizedError (401)
   │             └─ Jika COCOK:
   ▼
[Client]
      8. Response 200 OK { id, nama, nim, email }
```

---

## 4. Kesimpulan Diskusi Kelompok 6

Kelompok 6 menyimpulkan bahwa rancangan autentikasi telah memenuhi seluruh standar keamanan industri dan pedoman resmi Pertemuan 9. Pemisahan Route–Controller–Service menjamin kode modular, pengujian otomatis membuktikan zero vulnerability terhadap kebocoran kata sandi, dan integritas basis data SQLite terjamin melalui unique constraint pada email dan NIM.

