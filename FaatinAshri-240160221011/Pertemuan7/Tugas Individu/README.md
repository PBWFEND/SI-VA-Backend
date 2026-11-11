# Tugas 5 — CRUD REST API Mahasiswa dengan Pola Service/Controller
**Nama:** Faatin Ashri Widiatin

**NPM:** 240160221011

## 1. Deskripsi Project

Project ini merupakan implementasi CRUD (Create, Read, Update, Delete) REST API untuk mengelola data mahasiswa. API dibuat menggunakan Node.js, Express.js, TypeScript, Prisma ORM, dan SQLite. Struktur program menerapkan pola Service/Controller dengan memisahkan bagian routes, controller, dan service agar kode lebih terstruktur serta mudah dikelola.

Data mahasiswa yang dikelola meliputi:

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | Int | ID internal dan primary key |
| nim | String | Nomor Induk Mahasiswa dan bersifat unik |
| nama | String | Nama mahasiswa |
| prodi | String | Program studi mahasiswa |
| angkatan | Int | Tahun angkatan mahasiswa |

Pada API ini, NIM digunakan sebagai parameter untuk mengambil, memperbarui, dan menghapus data mahasiswa.

## 2. Penerapan Pola Service/Controller

Project ini menggunakan pemisahan tiga lapisan utama, yaitu routes, controller, dan service.

### A. Routes

Routes bertugas menentukan endpoint dan menghubungkan setiap request ke fungsi controller yang sesuai.

File: `src/routes/mahasiswa.routes.ts`

Endpoint yang didaftarkan meliputi:

- `GET /mahasiswa`
- `GET /mahasiswa/:nim`
- `POST /mahasiswa`
- `PATCH /mahasiswa/:nim`
- `DELETE /mahasiswa/:nim`

### B. Controller

Controller bertugas menangani request dari client, melakukan validasi data, memanggil fungsi service, dan mengirimkan response dengan status code yang sesuai.

File: `src/controller/mahasiswa.controller.ts`

Fungsi controller yang digunakan:

- `listMahasiswa`: mengambil seluruh data mahasiswa dan menerapkan filter.
- `detailMahasiswa`: mengambil detail mahasiswa berdasarkan NIM.
- `addMahasiswa`: menambahkan data mahasiswa.
- `editMahasiswa`: memperbarui data mahasiswa.
- `removeMahasiswa`: menghapus data mahasiswa.

### C. Service

Service bertugas menjalankan proses pengolahan data melalui Prisma Client.

File: `src/service/mahasiswa.service.ts`

Fungsi service yang digunakan:

- `getAllMahasiswa()`
- `getMahasiswaByNim()`
- `createMahasiswa()`
- `updateMahasiswa()`
- `deleteMahasiswa()`

### D. Alur Request API

Alur kerja aplikasi adalah sebagai berikut:

```text
Client
  |
  v
Routes
  |
  v
Controller
  |
  |-- Validasi input
  |-- Memanggil fungsi service
  |
  v
Service
  |
  v
Prisma Client
  |
  v
SQLite Database
  |
  v
Service
  |
  v
Controller
  |
  v
JSON Response
  |
  v
Client
```

Dengan pemisahan ini, routes hanya mengatur endpoint, controller menangani request dan response, sedangkan service menangani proses pengolahan data.

## 3. Konfigurasi dan Instalasi

### A. Persiapan Project

Pastikan Node.js dan npm sudah terpasang.

Install seluruh dependency dengan perintah:

```bash
npm install
```

### B. Konfigurasi Environment

Buat file `.env` pada folder utama project:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3007
```

Keterangan:

- `DATABASE_URL`: lokasi database SQLite.
- `PORT`: port yang digunakan oleh server.

### C. Migrasi Database

Jalankan perintah berikut untuk membuat dan menerapkan migrasi database:

```bash
npx prisma migrate dev --name init
```

### D. Generate Prisma Client

Jalankan:

```bash
npx prisma generate
```

Perintah ini digunakan untuk menghasilkan Prisma Client berdasarkan model yang didefinisikan dalam `schema.prisma`.

### E. Menjalankan TypeScript Check

Untuk memeriksa kesalahan tipe pada kode:

```bash
npm run check
```

### F. Menjalankan Server

Jalankan server menggunakan:

```bash
npm run dev
```

Jika berhasil, terminal akan menampilkan:

```text
Server berjalan di http://localhost:3007
```

API dapat diakses melalui alamat:

```text
http://localhost:3007
```

## 4. Hasil Pengujian API

Pengujian REST API Mahasiswa dilakukan menggunakan perintah `curl` melalui terminal. Berikut perintah yang digunakan beserta hasil pengujiannya.

### Pengujian GET Seluruh Data Mahasiswa

```bash
curl -i http://localhost:3007/mahasiswa
```

**Hasil pengujian:**

```http
HTTP/1.1 200 OK
```

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diambil",
  "data": {
    "total": 0,
    "data": []
  }
}
```

### Pengujian POST Menambahkan Data Mahasiswa

```bash
curl -i -X POST http://localhost:3007/mahasiswa \
-H "Content-Type: application/json" \
-d '{
  "nim": "240160221011",
  "nama": "Faatin Ashri Widiatin",
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}'
```

**Hasil pengujian:**

```http
HTTP/1.1 201 Created
```

Data mahasiswa berhasil ditambahkan dengan informasi:

```json
{
  "nim": "240160221011",
  "nama": "Faatin Ashri Widiatin",
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}
```

###  Pengujian GET Detail Mahasiswa

```bash
curl -i http://localhost:3007/mahasiswa/240160221011
```

**Hasil pengujian:**

```http
HTTP/1.1 200 OK
```

Data mahasiswa berhasil ditampilkan dengan NIM `240160221011`, nama `Faatin Ashri Widiatin`, program studi `Sistem Informasi`, dan angkatan `2024`.

### Pengujian PATCH Memperbarui Data Mahasiswa

```bash
curl -i -X PATCH http://localhost:3007/mahasiswa/240160221011 \
-H "Content-Type: application/json" \
-d '{
  "nama": "Faatin Ashri W"
}'
```

**Hasil pengujian:**

```http
HTTP/1.1 200 OK
```

Nama mahasiswa berhasil diperbarui dari `Faatin Ashri Widiatin` menjadi `Faatin Ashri W`.

### Pengujian DELETE Menghapus Data Mahasiswa

```bash
curl -i -X DELETE http://localhost:3007/mahasiswa/240160221011
```

**Hasil pengujian:**

```http
HTTP/1.1 204 No Content
```

### Pengujian GET Mahasiswa yang Tidak Ditemukan

```bash
curl -i http://localhost:3007/mahasiswa/999999999999
```

**Hasil pengujian:**

```http
HTTP/1.1 404 Not Found
```

```json
{
  "success": false,
  "message": "Mahasiswa tidak ditemukan"
}
```

### Pengujian POST dengan Data Tidak Lengkap

```bash
curl -i -X POST http://localhost:3007/mahasiswa \
-H "Content-Type: application/json" \
-d '{
  "nim": "240160221012",
  "nama": "Fajar"
}'
```

**Hasil pengujian:**

```http
HTTP/1.1 400 Bad Request
```

```json
{
  "success": false,
  "message": "NIM, nama, prodi wajib berupa teks dan angkatan harus angka bulat 2000–2100"
}
```

### Pengujian PATCH dengan Tipe Data Angkatan yang Salah

```bash
curl -i -X PATCH http://localhost:3007/mahasiswa/240160221011 \
-H "Content-Type: application/json" \
-d '{
  "angkatan": "dua ribu dua puluh empat"
}'
```

**Hasil pengujian:**

```http
HTTP/1.1 400 Bad Request
```

```json
{
  "success": false,
  "message": "Angkatan harus berupa angka bulat 2000–2100"
}
```

## 5. Status Code yang Digunakan

| Status Code | Keterangan |
|---|---|
| 200 OK | Request berhasil diproses |
| 201 Created | Data baru berhasil dibuat |
| 204 No Content | Data berhasil dihapus tanpa response body |
| 400 Bad Request | Input tidak valid atau tidak lengkap |
| 404 Not Found | Data atau endpoint tidak ditemukan |

## 6. Kesimpulan

Berdasarkan hasil pengerjaan dan pengujian, REST API Mahasiswa berhasil dibuat dengan menerapkan pola Service/Controller.

Pemisahan folder routes, controller, dan service membuat struktur program lebih terorganisasi. Controller bertugas menangani request, validasi, dan response, sedangkan service bertugas menjalankan proses pengolahan data melalui Prisma ORM.

Endpoint GET, POST, PATCH, dan DELETE telah diuji menggunakan curl. Validasi input juga berhasil menolak data yang tidak lengkap maupun data dengan tipe yang tidak sesuai. Penanganan status code seperti `200`, `201`, `204`, `400`, dan `404` telah diterapkan sesuai hasil pengujian.