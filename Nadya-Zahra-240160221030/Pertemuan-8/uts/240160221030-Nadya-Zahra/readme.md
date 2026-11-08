# UTS – REST API Sistem Informasi Absensi Organisasi

**Nama:** Nadya Zahra Aulia  
**NPM:** 240160221030  
**Mata Kuliah:** Pemrograman Backend

## 1. Deskripsi Proyek

Sistem Informasi Absensi Organisasi merupakan REST API yang dikembangkan untuk mengelola data anggota dan pencatatan kehadiran dalam kegiatan organisasi.

Aplikasi ini dibangun menggunakan Node.js, Express.js, dan TypeScript, dengan Prisma ORM sebagai penghubung ke database SQLite.

Sistem memiliki dua resource utama, yaitu Anggota dan Absensi. Data absensi terhubung dengan data anggota melalui relasi one-to-many, sehingga satu anggota dapat memiliki beberapa catatan kehadiran dalam kegiatan organisasi.

## 2. Teknologi yang Digunakan

- **Node.js** – Menjalankan aplikasi pada sisi server.
- **TypeScript** – Mengembangkan aplikasi dengan sistem tipe data.
- **Express.js 5** – Membuat REST API dan mengatur routing.
- **Prisma ORM 7** – Mengelola operasi database.
- **SQLite** – Menyimpan data anggota dan absensi.
- **Postman** – Menguji endpoint REST API.

## 3. Struktur Folder

```text
240160221030-Nadya-Zahra/
├── generated/
│   └── prisma/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controller/
│   │   ├── anggota.controller.ts
│   │   └── absensi.controller.ts
│   ├── routes/
│   │   ├── anggota.routes.ts
│   │   └── absensi.routes.ts
│   └── service/
│       ├── anggota.service.ts
│       └── absensi.service.ts
├── .env
├── .env.example
├── app.ts
├── client.ts
├── package.json
├── prisma.config.ts
├── server.ts
└── README.md
```

## 4. Cara Menjalankan Proyek

Pastikan Node.js dan npm sudah terpasang pada komputer.

### A. Instalasi Dependensi

Buka terminal pada folder proyek, kemudian jalankan:

```bash
npm install
```

### B. Konfigurasi Environment

Buat file `.env` pada direktori utama proyek:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3009
```

### C. Generate Prisma Client

```bash
npx prisma generate
```

### D. Migrasi Database

```bash
npx prisma migrate dev
```

Migrasi digunakan untuk membuat tabel database berdasarkan struktur model pada `schema.prisma`.

### E. Menjalankan Server

```bash
npm run dev
```

### F. Mengakses API

Alamat utama API:

```text
http://localhost:3009/
```

Pemeriksaan koneksi API dan database:

```text
http://localhost:3009/api/health
```

## 5. Struktur dan Alur Kerja Sistem

Sistem menggunakan pola pemisahan Route, Controller, dan Service agar setiap bagian memiliki tanggung jawab masing-masing.

1. **Routes** bertugas menerima request dan mengarahkan endpoint ke controller.
2. **Controller** bertugas melakukan validasi input dan mengatur respons HTTP.
3. **Service** bertugas menjalankan logika bisnis dan operasi database.
4. **Prisma ORM** menjadi penghubung antara aplikasi dengan database.
5. **SQLite** digunakan untuk menyimpan data anggota dan absensi.

Alur kerja sistem:

```text
Pengguna / Postman
        |
        v
      Routes
        |
        v
    Controller
        |
        v
      Service
        |
        v
    Prisma ORM
        |
        v
   Database SQLite
```

## 6. Struktur Data dan Relasi

Sistem memiliki dua model utama.

### A. Model Anggota

Model Anggota digunakan untuk menyimpan informasi anggota organisasi.

| Field | Keterangan |
|---|---|
| id_anggota | Identitas unik anggota |
| nim | Nomor Induk Mahasiswa dan bersifat unik |
| nama | Nama anggota |
| jabatan | Jabatan anggota dalam organisasi |

### B. Model Absensi

Model Absensi digunakan untuk menyimpan informasi kehadiran anggota dalam kegiatan organisasi.

| Field | Keterangan |
|---|---|
| id_absensi | Identitas unik data absensi |
| id_anggota | Identitas anggota yang melakukan absensi |
| kegiatan | Nama kegiatan organisasi |
| tanggal | Tanggal pelaksanaan kegiatan |
| status | Status kehadiran anggota |

Status kehadiran yang digunakan meliputi:

- Hadir
- Izin
- Sakit

### C. Relasi Antar Model

Model Anggota dan Absensi memiliki relasi one-to-many. Artinya, satu anggota dapat memiliki lebih dari satu data absensi, sedangkan setiap data absensi terhubung dengan satu anggota.

## 7. Daftar Endpoint API

### A. Endpoint Anggota

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/anggota` | Menampilkan seluruh anggota |
| GET | `/anggota/:id` | Menampilkan anggota berdasarkan ID |
| POST | `/anggota` | Menambahkan anggota |
| PATCH | `/anggota/:id` | Memperbarui data anggota |
| DELETE | `/anggota/:id` | Menghapus anggota |

### B. Endpoint Absensi

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/absensi` | Menampilkan seluruh data absensi |
| GET | `/absensi/:id` | Menampilkan detail absensi |
| POST | `/absensi` | Menambahkan data absensi |
| PATCH | `/absensi/:id` | Memperbarui data absensi |
| DELETE | `/absensi/:id` | Menghapus data absensi |

### C. Endpoint Umum

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Menampilkan informasi API |
| GET | `/api/health` | Memeriksa koneksi API dan database |

## 8. Contoh Pengujian API

Pengujian API dilakukan menggunakan Postman dengan format request body JSON.

### A. POST – Menambahkan Anggota

**Endpoint:**

```text
POST http://localhost:3009/anggota
```

**Body (JSON):**

```json
{
  "id_anggota": "AGT001",
  "nama": "Kim Taehyung",
  "nim": "260160221012",
  "jabatan": "Ketua"
}
```

Respons yang diharapkan: `201 Created`.

### B. GET – Menampilkan Semua Anggota

```text
GET http://localhost:3009/anggota
```

Respons yang diharapkan: `200 OK`.

### C. GET – Detail Anggota

```text
GET http://localhost:3009/anggota/AGT001
```

Respons yang diharapkan: `200 OK`.

### D. PATCH – Memperbarui Anggota

```text
PATCH http://localhost:3008/anggota/AGT001
```

Body:

```json
{
  "jabatan": "Wakil Ketua"
}
```

Respons yang diharapkan: `200 OK`.

### E. POST – Menambahkan Absensi

```text
POST http://localhost:3008/absensi
```

Body:

```json
{
  "id_absensi": "ABS001",
  "id_anggota": "AGT001",
  "kegiatan": "Rapat Pembahasan LDKM",
  "tanggal": "2026-11-04",
  "status": "Hadir"
}
```

Respons yang diharapkan: `201 Created`.

### F. GET – Menampilkan Semua Absensi

```text
GET http://localhost:3003/absensi
```

Respons yang diharapkan: `200 OK`.

### G. GET – Detail Absensi

```text
GET http://localhost:3009/absensi/ABS003
```

Respons yang diharapkan: `200 OK`.

### H. PATCH – Memperbarui Absensi

```text
PATCH http://localhost:3008/absensi/ABS003
```

Body:

```json
{
  "status": "Hadir"
}
```

Respons yang diharapkan: `200 OK`.

### I. DELETE – Menghapus Absensi

```text
DELETE http://localhost:3008/absensi/ABS001
```

Respons yang diharapkan: `204 No Content`.

### J. DELETE – Menghapus Anggota

```text
DELETE http://localhost:3008/anggota/AGT001
```

Respons yang diharapkan: `204 No Content` jika anggota tidak memiliki data absensi yang masih terhubung.

## 9. Penanganan Kesalahan

API memiliki mekanisme penanganan kesalahan untuk memberikan respons yang sesuai terhadap kondisi tertentu.

| Status HTTP | Keterangan |
|---|---|
| 200 OK | Request berhasil |
| 201 Created | Data berhasil ditambahkan |
| 204 No Content | Data berhasil dihapus |
| 400 Bad Request | Input atau format JSON tidak valid |
| 404 Not Found | Data atau endpoint tidak ditemukan |
| 409 Conflict | Terjadi konflik data |
| 500 Internal Server Error | Terjadi kesalahan pada server |

## 10. Kesimpulan

REST API Sistem Informasi Absensi Organisasi dikembangkan untuk membantu pengelolaan data anggota dan pencatatan kehadiran dalam kegiatan organisasi.

Dengan menggunakan Node.js, Express.js, TypeScript, Prisma ORM, dan SQLite, sistem dapat menjalankan operasi CRUD pada resource Anggota dan Absensi.

Penerapan pola Route, Controller, dan Service membuat struktur aplikasi lebih terorganisasi dan memudahkan pengembangan serta pemeliharaan sistem. Relasi antara Anggota dan Absensi juga memungkinkan pencatatan kehadiran setiap anggota secara terstruktur.
