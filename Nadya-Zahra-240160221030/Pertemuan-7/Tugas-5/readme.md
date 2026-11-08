# Tugas 5 – REST API Sistem Informasi Absensi Organisasi

## 1. Deskripsi Proyek

Tugas ini merupakan pengembangan REST API untuk mengelola data anggota dan absensi dalam organisasi. API dibangun menggunakan Node.js dan Express.js dengan TypeScript, serta Prisma ORM sebagai penghubung antara aplikasi dan database SQLite.

Sistem ini memiliki dua resource utama, yaitu Anggota dan Absensi. Setiap anggota dapat memiliki beberapa data absensi yang terhubung melalui relasi database.

API menyediakan operasi CRUD (*Create, Read, Update, Delete*) untuk menambahkan, menampilkan, memperbarui, dan menghapus data anggota maupun absensi.

## 2. Teknologi yang Digunakan

- **Node.js** – Menjalankan aplikasi di sisi server.
- **TypeScript** – Menambahkan sistem tipe pada kode JavaScript.
- **Express.js 5** – Membuat REST API dan mengatur routing.
- **Prisma ORM 7** – Mengelola komunikasi antara aplikasi dan database.
- **SQLite** – Menyimpan data anggota dan absensi.
- **Postman** – Menguji endpoint API.

## 3. Struktur Folder

```text
tugas-5/
├── prisma/
│   ├── generated/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controller/
│   │   └── absensi.controller.ts
│   ├── routes/
│   │   └── absensi.routes.ts
│   └── service/
│       └── absensi.service.ts
├── .env
├── .env.example
├── .gitignore
├── app.ts
├── client.ts
├── package.json
├── prisma.config.ts
├── server.ts
└── README.md
```

## 4. Cara Menjalankan Proyek

Pastikan Node.js dan npm sudah terpasang pada komputer.

1. Buka terminal pada folder proyek.
2. Instal seluruh dependensi:

```bash
npm.cmd install
```

3. Pastikan konfigurasi database sudah tersedia pada file `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3009
```

4. Generate Prisma Client:

```bash
npx prisma generate
```

5. Jalankan migrasi database:

```bash
npx prisma migrate dev
```

6. Jalankan server:

```bash
npm run dev
```

7. Buka alamat berikut untuk memastikan API berjalan:

```text
http://localhost:3009/
```

Untuk memeriksa koneksi API dan database, gunakan:

```text
http://localhost:3009/api/health
```

## 5. Alur Kerja Sistem

Sistem menggunakan pola pemisahan Route, Controller, dan Service.

1. **Routes** menerima request dari pengguna dan mengarahkannya ke controller sesuai endpoint.
2. **Controller** melakukan validasi input, memanggil service, dan menentukan respons HTTP.
3. **Service** menjalankan proses pengolahan data menggunakan Prisma ORM.
4. **Prisma ORM** menghubungkan aplikasi dengan database SQLite.
5. **Database SQLite** menyimpan data anggota dan absensi.

Alur sistem:

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

## 6. Struktur Data

Sistem memiliki dua model utama:

### A. Anggota

Digunakan untuk menyimpan informasi anggota organisasi.

| Field | Keterangan |
|---|---|
| id_anggota | ID unik anggota |
| nim | Nomor Induk Mahasiswa (unik) |
| nama | Nama anggota |
| jabatan | Jabatan anggota dalam organisasi |

### B. Absensi

Digunakan untuk menyimpan informasi kehadiran anggota dalam kegiatan organisasi.

| Field | Keterangan |
|---|---|
| id_absensi | ID unik absensi |
| id_anggota | ID anggota yang melakukan absensi |
| kegiatan | Nama kegiatan organisasi |
| tanggal | Tanggal pelaksanaan kegiatan |
| status | Status kehadiran |

Status absensi yang diterima adalah `Hadir`, `Izin`, dan `Sakit`.

Model Anggota dan Absensi memiliki relasi one-to-many, yaitu satu anggota dapat memiliki beberapa data absensi.

## 7. Daftar Endpoint API

### A. Endpoint Anggota

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/anggota` | Menampilkan seluruh data anggota |
| GET | `/anggota/:id` | Menampilkan detail anggota berdasarkan ID |
| POST | `/anggota` | Menambahkan data anggota |
| PATCH | `/anggota/:id` | Memperbarui data anggota |
| DELETE | `/anggota/:id` | Menghapus data anggota |

### B. Endpoint Absensi

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/absensi` | Menampilkan seluruh data absensi |
| GET | `/absensi/:id` | Menampilkan detail absensi berdasarkan ID |
| POST | `/absensi` | Menambahkan data absensi |
| PATCH | `/absensi/:id` | Memperbarui data absensi |
| DELETE | `/absensi/:id` | Menghapus data absensi |

### C. Endpoint Umum

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Menampilkan informasi API |
| GET | `/api/health` | Memeriksa koneksi API dan database |

## 8. Contoh Pengujian API

Pengujian dilakukan menggunakan Postman dengan metode HTTP dan format request body JSON.

### A. POST – Menambahkan Data Anggota

**Method:** POST

**Endpoint:**

```text
http://localhost:3009/anggota
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

### B. GET – Menampilkan Semua Data Anggota

**Method:** GET

**Endpoint:**

```text
http://localhost:3009/anggota
```

Respons yang diharapkan: `200 OK`.

### C. GET – Menampilkan Detail Anggota

**Method:** GET

**Endpoint:**

```text
http://localhost:3009/anggota/AGT001
```

Respons yang diharapkan: `200 OK` jika anggota tersedia.

### D. PATCH – Memperbarui Data Anggota

**Method:** PATCH

**Endpoint:**

```text
http://localhost:3009/anggota/AGT001
```

**Body (JSON):**

```json
{
  "jabatan": "Wakil Ketua"
}
```

Respons yang diharapkan: `200 OK`.

### E. POST – Menambahkan Data Absensi

**Method:** POST

**Endpoint:**

```text
http://localhost:3009/absensi
```

**Body (JSON):**

```json
{
  "id_absensi": "ABS001",
  "id_anggota": "AGT001",
  "kegiatan": "Rapat Pembahasan Program Kerja",
  "tanggal": "2026-11-04",
  "status": "Hadir"
}
```

Respons yang diharapkan: `201 Created`.

### F. GET – Menampilkan Semua Data Absensi

**Method:** GET

**Endpoint:**

```text
http://localhost:3009/absensi
```

Respons yang diharapkan: `200 OK`.

### G. GET – Menampilkan Detail Absensi

**Method:** GET

**Endpoint:**

```text
http://localhost:3009/absensi/ABS001
```

Respons yang diharapkan: `200 OK` jika data absensi tersedia.

### H. PATCH – Memperbarui Data Absensi

**Method:** PATCH

**Endpoint:**

```text
http://localhost:3009/absensi/ABS001
```

**Body (JSON):**

```json
{
  "status": "Izin"
}
```

Respons yang diharapkan: `200 OK`.

### I. DELETE – Menghapus Data Absensi

**Method:** DELETE

**Endpoint:**

```text
http://localhost:3009/absensi/ABS001
```

Respons yang diharapkan: `204 No Content`.

### J. DELETE – Menghapus Data Anggota

**Method:** DELETE

**Endpoint:**

```text
http://localhost:3009/anggota/AGT001
```

Respons yang diharapkan: `204 No Content` apabila anggota tidak memiliki data absensi yang masih terhubung. Jika masih memiliki data absensi, penghapusan ditolak dengan respons konflik.

## 9. Penanganan Kesalahan

API menyediakan penanganan kesalahan untuk beberapa kondisi, antara lain:

- **400 Bad Request** – Request body tidak valid atau terdapat kesalahan validasi.
- **404 Not Found** – Data atau endpoint tidak ditemukan.
- **409 Conflict** – Terjadi konflik data, seperti ID atau NIM duplikat, maupun penghapusan anggota yang masih memiliki data absensi.
- **500 Internal Server Error** – Terjadi kesalahan yang tidak terduga pada server.

## 10. Kesimpulan

REST API Sistem Informasi Absensi Organisasi dikembangkan menggunakan Node.js, Express.js, TypeScript, Prisma ORM, dan SQLite. Sistem menerapkan pemisahan Route, Controller, dan Service agar pengelolaan kode lebih terstruktur.

Dengan adanya dua resource utama, yaitu Anggota dan Absensi, sistem dapat mengelola informasi anggota serta mencatat kehadiran dalam kegiatan organisasi. Seluruh endpoint diuji menggunakan Postman untuk memastikan fungsi API berjalan sesuai kebutuhan.
