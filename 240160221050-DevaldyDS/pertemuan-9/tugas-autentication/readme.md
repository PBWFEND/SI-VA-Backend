# Tugas Pertemuan 9 — Layanan Autentikasi dan Manajemen Data Buku

Repositori ini berisi implementasi Tugas Pertemuan 9 (Authentication) mata kuliah Praktikum Backend Web Framework. Proyek ini merupakan pengembangan dari mini project Pertemuan 8 dengan menambahkan sistem autentikasi pengguna menggunakan email dan password. Sistem menggunakan algoritma hashing `bcryptjs`, basis data SQLite, serta Prisma ORM.

---

## 1. Identitas Pengembang & Proyek

| Atribut            | Keterangan                                                          |
| ------------------ | ------------------------------------------------------------------- |
| **Nama Mahasiswa** | Devaldy Dzikri                                                      |
| **NIM**            | 240160221050                                                        |
| **Kelas**          | SI-VA                                                               |
| **Mata Kuliah**    | Praktikum Backend Web Framework                                     |
| **Pertemuan**      | Pertemuan 9 — Authentication: Register, Login, dan Password Hashing |
| **Studi Kasus**    | Sistem Autentikasi Pengguna dan Manajemen Data Buku                 |
| **Paket Aplikasi** | `mini-project-uts`                                                  |

---

## 2. Fitur Utama & Kepatuhan Keamanan

1. **Registrasi Akun Baru (`POST /auth/register`)**:
   - Menerima data `email` dan `password`.
   - Melakukan validasi tipe data dan format email.
   - Memastikan password memiliki panjang minimal 8 karakter.
   - Menjamin keunikan email menggunakan constraint `@unique` pada Prisma.
   - Menghasilkan status HTTP `409 Conflict` jika email sudah terdaftar.

2. **Password Hashing dengan `bcryptjs`**:
   - Menggunakan library `bcryptjs` untuk melakukan hashing password.
   - Menggunakan cost factor 10 pada proses hashing.
   - Menyimpan hasil hashing pada kolom `passwordHash` di database.
   - Password asli tidak disimpan secara langsung di database.

3. **Login dan Verifikasi Kredensial (`POST /auth/login`)**:
   - Memeriksa email pengguna pada database.
   - Membandingkan password yang dimasukkan dengan hash menggunakan `bcrypt.compare()`.
   - Menghasilkan status HTTP `401 Unauthorized` jika email atau password salah.
   - Menggunakan pesan kesalahan yang seragam untuk email dan password yang salah.

4. **Proteksi Respons API**:
   - Respons Register dan Login hanya mengembalikan informasi publik pengguna.
   - Data yang dikembalikan meliputi `id`, `email`, dan `createdAt`.
   - Field `password` dan `passwordHash` tidak dikirimkan kepada client.

5. **Preservasi Resource Domain Buku**:
   - Mempertahankan fitur manajemen data Buku dari Pertemuan 8.
   - Endpoint `/buku` tetap terintegrasi dengan database.
   - Menambahkan fitur Authentication tanpa menghilangkan fungsi CRUD Buku yang sudah tersedia.

---

## 3. Struktur Direktori

```text
tugas-autentication/
├── app.ts                  # Konfigurasi Express, middleware, dan routing
├── server.ts               # Inisialisasi HTTP server dan graceful shutdown
├── client.ts               # Instance PrismaClient
├── prisma.config.ts        # Konfigurasi Prisma
├── package.json            # Dependensi dan scripts aplikasi
├── package-lock.json       # Lockfile dependensi
├── tsconfig.json           # Konfigurasi TypeScript
├── .env                    # Variabel lingkungan lokal
├── .gitignore              # Daftar file yang diabaikan Git
├── readme.md               # Dokumentasi proyek
├── prisma/
│   ├── schema.prisma       # Definisi model Buku dan User
│   ├── dev.db              # Database SQLite lokal
│   └── migrations/         # Riwayat migrasi database
│       ├── 20261105131456_init/
│       └── 20261114132115_add_user_auth/
└── src/
    ├── auth/
    │   ├── auth.controller.ts  # Controller Register dan Login
    │   ├── auth.routes.ts      # Routing Authentication
    │   └── auth.service.ts     # Logika autentikasi dan password hashing
    ├── controller/
    │   └── buku.controller.ts  # Controller data Buku
    ├── routes/
    │   └── buku.routes.ts      # Routing data Buku
    └── service/
        └── buku.service.ts     # Logika bisnis data Buku
```

---

## 4. Panduan Menjalankan Aplikasi

### 1. Masuk ke Direktori Proyek

```bash
cd tugas-autentication
```

### 2. Pasang Dependensi

```bash
npm install
```

### 3. Siapkan Lingkungan

Pastikan file `.env` tersedia dan berisi konfigurasi database:

```env
DATABASE_URL="file:./dev.db"
```

### 4. Eksekusi Migrasi Database

```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Jalankan Server

Mode pengembangan:

```bash
npm run dev
```

Mode standar:

```bash
npm start
```

Server berjalan pada alamat:

```text
http://localhost:3008
```

---

## 5. Dokumentasi Endpoint & Contoh cURL

### A. Registrasi Pengguna Baru (`POST /auth/register`)

```bash
curl -i -X POST http://localhost:3008/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "devaldy@gmail.com",
    "password": "password123"
  }'
```

**Respons (HTTP 201 Created):**

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "email": "devaldy@gmail.com",
    "createdAt": "2026-11-14T12:00:00.000Z"
  }
}
```

### B. Login Pengguna (`POST /auth/login`)

```bash
curl -i -X POST http://localhost:3008/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "devaldy@gmail.com",
    "password": "password123"
  }'
```

**Respons (HTTP 200 OK):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "id": 1,
    "email": "devaldy@gmail.com",
    "createdAt": "2026-11-14T12:00:00.000Z"
  }
}
```

### C. Login Gagal — Kredensial Salah (HTTP 401 Unauthorized)

```bash
curl -i -X POST http://localhost:3008/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "devaldy@gmail.com",
    "password": "passwordsalah123"
  }'
```

**Respons:**

```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

### D. Register Gagal — Email Tidak Valid (HTTP 400 Bad Request)

```bash
curl -i -X POST http://localhost:3008/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "devaldygmail.com",
    "password": "password123"
  }'
```

**Respons:**

```json
{
  "success": false,
  "message": "Format email tidak valid"
}
```

### E. Register Gagal — Password Kurang dari 8 Karakter (HTTP 400 Bad Request)

```bash
curl -i -X POST http://localhost:3008/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "devaldybaru@gmail.com",
    "password": "123"
  }'
```

**Respons:**

```json
{
  "success": false,
  "message": "Password minimal 8 karakter"
}
```

### F. Register Gagal — Email Duplikat (HTTP 409 Conflict)

```bash
curl -i -X POST http://localhost:3008/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "devaldy@gmail.com",
    "password": "password123"
  }'
```

**Respons:**

```json
{
  "success": false,
  "message": "Email sudah terdaftar"
}
```

---

## 6. Hasil Pengujian API melalui Postman

Pengujian dilakukan secara manual menggunakan aplikasi Postman untuk memastikan seluruh fitur
