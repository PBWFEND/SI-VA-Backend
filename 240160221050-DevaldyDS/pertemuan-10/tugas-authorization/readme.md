# Tugas Pertemuan 10 — Implementasi JWT Authentication dan Role-Based Authorization

Repositori ini berisi implementasi Tugas Pertemuan 10 mata kuliah Praktikum Backend Web Framework. Proyek ini merupakan pengembangan dari mini project Pertemuan 8 dan Pertemuan 9 dengan menambahkan sistem autentikasi menggunakan JSON Web Token (JWT) serta pembatasan hak akses berdasarkan role pengguna.

Sistem menggunakan Express.js, TypeScript, Prisma ORM, SQLite, bcryptjs, dan jsonwebtoken untuk mengelola autentikasi serta otorisasi pengguna secara aman.

---

## 1. Identitas Pengembang & Proyek

| Atribut            | Keterangan                                          |
| ------------------ | --------------------------------------------------- |
| **Nama Mahasiswa** | Devaldy Dzikri                                      |
| **NIM**            | 240160221050                                        |
| **Pertemuan**      | Pertemuan 10 — JWT Authentication dan Authorization |
| **Studi Kasus**    | Sistem Autentikasi Pengguna dan Manajemen Data Buku |

---

## 2. Fitur Utama & Kepatuhan Keamanan

1. **JWT Access Token**
   - Menggunakan library `jsonwebtoken` untuk membuat JSON Web Token.
   - Token diterbitkan setelah pengguna berhasil login.
   - Token memuat informasi `id`, `email`, dan `role` pengguna.
   - Menggunakan waktu kedaluwarsa token melalui konfigurasi `JWT_EXPIRES_IN`.
   - Secret key disimpan dalam file `.env` melalui variabel `JWT_SECRET`.

2. **Authentication Middleware**
   - Memeriksa token melalui HTTP Authorization Header.
   - Menggunakan format `Bearer Token`.
   - Memverifikasi keaslian token menggunakan `jwt.verify()`.
   - Menolak permintaan tanpa token dengan status HTTP `401 Unauthorized`.
   - Menolak token tidak valid atau kedaluwarsa dengan status HTTP `401 Unauthorized`.

3. **Role-Based Authorization**
   - Menerapkan dua jenis role pengguna, yaitu `admin` dan `mahasiswa`.
   - Role `mahasiswa` hanya dapat melihat daftar dan detail buku.
   - Role `admin` memiliki hak untuk melihat, menambahkan, mengubah, dan menghapus data buku.
   - Pengguna yang tidak memiliki izin akan mendapatkan status HTTP `403 Forbidden`.

4. **Proteksi Endpoint Buku**
   - Seluruh endpoint `/buku` dilindungi middleware autentikasi.
   - Endpoint GET dapat diakses oleh pengguna yang sudah login.
   - Endpoint POST, PATCH, dan DELETE hanya dapat diakses oleh pengguna dengan role `admin`.

5. **Keamanan Konfigurasi**
   - Secret key JWT disimpan dalam file `.env`.
   - File `.env` tidak disertakan dalam repositori Git.
   - Password pengguna tetap disimpan dalam bentuk hash menggunakan `bcryptjs`.
   - Informasi sensitif seperti `passwordHash` tidak dikirimkan melalui respons API.

---

## 3. Struktur Direktori

```text
tugas-authorization/
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env
├── .gitignore
├── README.md
├── prisma/
│   ├── schema.prisma
│   ├── dev.db
│   └── migrations/
│       ├── 20261105131456_init/
│       ├── 20261114132115_add_user_auth/
│       └── 20261116133317_add_user_role/
└── src/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.routes.ts
    │   └── auth.service.ts
    ├── controller/
    │   └── buku.controller.ts
    ├── middleware/
    │   └── auth.middleware.ts
    ├── routes/
    │   └── buku.routes.ts
    └── service/
        └── buku.service.ts
```

---

## 4. Panduan Menjalankan Aplikasi

### 1. Masuk ke Direktori Proyek

```bash
cd tugas-authorization
```

### 2. Pasang Dependensi

```bash
npm install
```

### 3. Siapkan Lingkungan

Buat file `.env` dan isi dengan konfigurasi berikut:

```env
DATABASE_URL="file:./dev.db"
PORT=3008
JWT_SECRET="masukkan_secret_key_yang_aman"
JWT_EXPIRES_IN="15m"
```

Keterangan:

- `DATABASE_URL` digunakan untuk menghubungkan aplikasi dengan database SQLite.
- `PORT` menentukan port server.
- `JWT_SECRET` digunakan untuk menandatangani dan memverifikasi JWT.
- `JWT_EXPIRES_IN` menentukan masa berlaku access token.

**Catatan:** Gunakan secret key yang kuat dan jangan mengunggah file `.env` ke GitHub.

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

## 5. Dokumentasi Endpoint API

### A. Registrasi Pengguna Baru

**Endpoint:** `POST /auth/register`

Registrasi pengguna menggunakan email dan password. Pengguna baru secara otomatis mendapatkan role `mahasiswa`.

Contoh request:

```json
{
  "email": "devaldy@gmail.com",
  "password": "password123"
}
```

Respons berhasil (HTTP 201 Created):

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "email": "devaldy@gmail.com",
    "role": "mahasiswa",
    "createdAt": "2026-11-16T13:42:57.024Z"
  }
}
```

### B. Login Pengguna dan Penerbitan JWT

**Endpoint:** `POST /auth/login`

Pengguna melakukan login menggunakan email dan password yang telah terdaftar. Jika kredensial benar, sistem akan menerbitkan access token JWT.

Contoh request:

```json
{
  "email": "devaldy@gmail.com",
  "password": "password123"
}
```

Respons berhasil (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "email": "devaldy@gmail.com",
      "role": "mahasiswa",
      "createdAt": "2026-11-16T13:42:57.024Z"
    },
    "accessToken": "JWT_ACCESS_TOKEN"
  }
}
```

### C. Melihat Seluruh Data Buku

**Endpoint:** `GET /buku`

Endpoint ini digunakan untuk menampilkan seluruh data buku dan hanya dapat diakses oleh pengguna yang telah login.

Header:

```text
Authorization: Bearer <access_token>
```

Respons berhasil (HTTP 200 OK) mengikuti format data yang dikembalikan oleh controller buku.

### D. Melihat Detail Buku

**Endpoint:** `GET /buku/:id`

Digunakan untuk menampilkan detail buku berdasarkan ID.

Header:

```text
Authorization: Bearer <access_token>
```

Endpoint dapat diakses oleh role `admin` maupun `mahasiswa`.

### E. Menambahkan Data Buku

**Endpoint:** `POST /buku`

Digunakan untuk menambahkan data buku baru. Endpoint ini hanya dapat diakses oleh role `admin`.

Header:

```text
Authorization: Bearer <access_token>
```

Contoh request:

```json
{
  "judul": "Belajar Pemrograman",
  "penulis": "Devaldy",
  "tahun": 2026,
  "stok": 10
}
```

Jika diakses oleh role `mahasiswa`, sistem akan memberikan respons HTTP `403 Forbidden`.

### F. Mengubah Data Buku

**Endpoint:** `PATCH /buku/:id`

Digunakan untuk mengubah data buku berdasarkan ID dan hanya dapat diakses oleh role `admin`.

Header:

```text
Authorization: Bearer <access_token>
```

### G. Menghapus Data Buku

**Endpoint:** `DELETE /buku/:id`

Digunakan untuk menghapus data buku berdasarkan ID dan hanya dapat diakses oleh role `admin`.

Header:

```text
Authorization: Bearer <access_token>
```

---

## 6. Hasil Pengujian API melalui Terminal PowerShell

Pengujian dilakukan secara langsung melalui terminal PowerShell untuk memastikan fitur registrasi, login, autentikasi JWT, dan pembatasan hak akses berjalan sesuai ketentuan.

### A. Pengujian Registrasi Pengguna

Pengguna melakukan registrasi dengan email dan password.

Hasil pengujian:

```text
success : True
message : Registrasi berhasil
data    : @{id=7; email=devaldy@test.com; role=mahasiswa; ...}
```

**Kesimpulan:** Registrasi berhasil dan sistem secara otomatis memberikan role `mahasiswa` kepada pengguna baru.

### B. Pengujian Login dan Penerbitan JWT

Pengujian dilakukan menggunakan email dan password yang telah didaftarkan.

**Kesimpulan:** Login berhasil dan sistem menghasilkan access token JWT yang dapat digunakan untuk mengakses endpoint terproteksi.

### C. Pengujian Akses Endpoint Tanpa Token

Pengujian dilakukan dengan mengakses endpoint `GET /buku` tanpa menyertakan token.

Respons:

```json
{
  "success": false,
  "message": "Access token tidak ditemukan"
}
```

**Status HTTP:** `401 Unauthorized`

**Kesimpulan:** Middleware berhasil menolak permintaan yang tidak menyertakan access token.

### D. Pengujian Akses Endpoint Menggunakan Token

Pengujian dilakukan dengan mengirimkan access token melalui Authorization Header.

```text
Authorization: Bearer <access_token>
```

**Endpoint:** `GET /buku`

**Kesimpulan:** Pengguna yang memiliki token valid dapat mengakses endpoint buku yang dilindungi autentikasi.

### E. Pengujian Pembatasan Role Mahasiswa

Pengujian dilakukan dengan mencoba menambahkan data buku menggunakan akun dengan role `mahasiswa`.

Respons:

```json
{
  "success": false,
  "message": "Kamu tidak memiliki izin untuk mengakses endpoint ini"
}
```

**Status HTTP:** `403 Forbidden`

**Kesimpulan:** Sistem berhasil membatasi hak akses pengguna mahasiswa sehingga tidak dapat menambahkan data buku.

### F. Pengujian Role Admin

Pengujian role admin dilakukan melalui konfigurasi role pengguna pada database. Akun dengan role `admin` memiliki hak untuk mengakses seluruh operasi CRUD buku.

Pengujian ini dapat dilanjutkan dengan login ulang menggunakan akun admin dan menggunakan access token yang baru diterbitkan.

---

## 7. Kesimpulan

Berdasarkan implementasi dan pengujian yang telah dilakukan, sistem berhasil mengintegrasikan JWT Authentication dan Role-Based Authorization pada mini project manajemen data buku.

Sistem mampu melakukan registrasi dan login pengguna, menerbitkan access token JWT, memverifikasi token melalui middleware, serta membatasi akses endpoint berdasarkan role pengguna.

Dengan adanya implementasi ini, keamanan API menjadi lebih baik karena setiap permintaan ke endpoint buku harus melalui proses autentikasi, sedangkan operasi penambahan, perubahan, dan penghapusan data hanya dapat dilakukan oleh pengguna dengan hak akses administrator.
