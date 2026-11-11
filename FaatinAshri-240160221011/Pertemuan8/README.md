# Mini Project UTS — Sistem Informasi Perpustakaan
**Nama:** Faatin Ashri Widiatin

**NPM:** 240160221011

## 1. Deskripsi Proyek

Mini project ini merupakan implementasi RESTful API untuk Sistem Informasi Perpustakaan dengan resource utama **Buku**. API dibuat menggunakan Node.js, Express 5, TypeScript, Prisma ORM 7, dan SQLite.

API menyediakan fitur untuk melihat daftar buku, melihat detail buku, menambahkan buku, memperbarui data buku, dan menghapus buku.

## 2. Teknologi yang Digunakan

- Node.js
- Express 5
- TypeScript
- Prisma ORM 7
- SQLite
- better-sqlite3

## 3. Struktur Folder

```text
Pertemuan8/
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── generated/
│   └── dev.db
├── src/
│   ├── routes/
│   │   └── buku.routes.ts
│   ├── controller/
│   │   └── buku.controller.ts
│   └── service/
│       └── buku.service.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## 4. Instalasi dan Menjalankan Proyek

1. Pastikan Node.js sudah terpasang.
2. Buka terminal pada folder proyek.
3. Instal seluruh dependency:

```bash
npm install
```

4. Pastikan file `.env` berisi konfigurasi berikut:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

5. Jalankan server dalam mode development:

```bash
npm run dev
```

Server berjalan pada alamat:

```text
http://localhost:3008
```

## 5. Arsitektur Aplikasi

Aplikasi menggunakan pola pemisahan tiga layer:

- **Routes:** Mengatur endpoint dan menghubungkan request ke controller.
- **Controller:** Menangani request dan response, validasi input, serta status HTTP.
- **Service:** Menangani proses pengolahan data dan komunikasi dengan database menggunakan Prisma ORM.

Pemisahan ini bertujuan agar kode lebih terstruktur dan setiap bagian memiliki tanggung jawab masing-masing.

## 6. Endpoint API

Base URL:

```text
http://localhost:3008/api/buku
```

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/buku` | Mengambil seluruh data buku |
| GET | `/api/buku/:id` | Mengambil detail buku berdasarkan ID |
| POST | `/api/buku` | Menambahkan data buku |
| PATCH | `/api/buku/:id` | Memperbarui data buku |
| DELETE | `/api/buku/:id` | Menghapus data buku |

API juga menyediakan filter daftar buku berdasarkan penulis dan stok minimal.

## 7. Pengujian API

Pengujian dilakukan menggunakan **cURL melalui terminal** dengan server berjalan pada port 3008. Pengujian mencakup operasi CRUD, filter data, validasi input, serta penanganan data yang tidak ditemukan.

### 7.1 GET — Mengambil Seluruh Data Buku

**Perintah:**

```bash
curl -i http://localhost:3008/api/buku
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK`. Ketika database belum berisi data, API mengembalikan daftar buku kosong:

```json
{
  "success": true,
  "message": "Data buku berhasil diambil",
  "data": []
}
```

### 7.2 GET — Filter Berdasarkan Penulis

**Perintah:**

```bash
curl -i "http://localhost:3008/api/buku?penulis=Pramoedya%20Ananta%20Toer"
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK` dan menampilkan buku *Bumi Manusia* karya Pramoedya Ananta Toer.

### 7.3 GET — Filter Berdasarkan Stok Minimal

**Perintah:**

```bash
curl -i "http://localhost:3008/api/buku?minStok=5"
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK` dan menampilkan buku yang memenuhi filter stok minimal 5.

### 7.4 GET — Menggunakan Dua Filter Sekaligus

**Perintah:**

```bash
curl -i "http://localhost:3008/api/buku?penulis=Pramoedya%20Ananta%20Toer&minStok=5"
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK` dan menampilkan data buku yang sesuai dengan kedua filter.

### 7.5 GET — Mengambil Detail Buku

**Perintah:**

```bash
curl -i http://localhost:3008/api/buku/2
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK` dan menampilkan detail buku *Bumi Manusia* dengan ID `2`.

### 7.6 POST — Menambahkan Data Buku

**Perintah:**

```bash
curl -i -X POST http://localhost:3008/api/buku \
-H "Content-Type: application/json" \
-d '{
  "judul": "Laskar Pelangi",
  "penulis": "Andrea Hirata",
  "tahun": 2005,
  "stok": 10
}'
```

**Hasil pengujian:**

Request berhasil mendapatkan status `201 Created`. Data buku *Laskar Pelangi* berhasil ditambahkan ke database dengan tahun terbit 2005 dan stok 10.

### 7.7 POST — Judul Tidak Diisi

**Perintah:**

```bash
curl -i -X POST http://localhost:3008/api/buku \
-H "Content-Type: application/json" \
-d '{
  "judul": "",
  "penulis": "Andrea Hirata",
  "tahun": 2005,
  "stok": 10
}'
```

**Hasil pengujian:**

Request ditolak dengan status `400 Bad Request` karena judul kosong. Validasi berhasil mencegah data yang tidak lengkap masuk ke database.

### 7.8 POST — Tahun Terbit Tidak Valid

**Perintah:**

```bash
curl -i -X POST http://localhost:3008/api/buku \
-H "Content-Type: application/json" \
-d '{
  "judul": "Buku Uji",
  "penulis": "Penulis Uji",
  "tahun": 2500,
  "stok": 5
}'
```

**Hasil pengujian:**

Request ditolak dengan status `400 Bad Request` karena tahun terbit berada di luar rentang 1000–2100.

### 7.9 POST — Stok Bernilai Negatif

**Perintah:**

```bash
curl -i -X POST http://localhost:3008/api/buku \
-H "Content-Type: application/json" \
-d '{
  "judul": "Buku Uji",
  "penulis": "Penulis Uji",
  "tahun": 2020,
  "stok": -5
}'
```

**Hasil pengujian:**

Request ditolak dengan status `400 Bad Request` karena stok tidak boleh bernilai negatif.

### 7.10 PATCH — Memperbarui Data Buku

**Perintah:**

```bash
curl -i -X PATCH http://localhost:3008/api/buku/2 \
-H "Content-Type: application/json" \
-d '{
  "stok": 10
}'
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK`. Stok buku dengan ID `2` berhasil diperbarui dari 7 menjadi 10.

### 7.11 PATCH — Input Tidak Valid

**Perintah:**

```bash
curl -i -X PATCH http://localhost:3008/api/buku/2 \
-H "Content-Type: application/json" \
-d '{
  "tahun": 2500,
  "stok": -5
}'
```

**Hasil pengujian:**

Request ditolak dengan status `400 Bad Request`. API memberikan detail kesalahan bahwa tahun berada di luar rentang 1000–2100 dan stok harus berupa bilangan bulat minimal 0.

### 7.12 PATCH — ID Buku Tidak Ditemukan

**Perintah:**

```bash
curl -i -X PATCH http://localhost:3008/api/buku/999 \
-H "Content-Type: application/json" \
-d '{"stok": 5}'
```

**Hasil pengujian:**

Request mendapatkan status `404 Not Found` dengan response:

```json
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

### 7.13 DELETE — Menghapus Data Buku

**Perintah:**

```bash
curl -i -X DELETE http://localhost:3008/api/buku/2
```

**Hasil pengujian:**

Request berhasil mendapatkan status `204 No Content`. Data buku berhasil dihapus dan tidak ada body response.

### 7.14 DELETE — ID Buku Tidak Ditemukan

**Perintah:**

```bash
curl -i -X DELETE http://localhost:3008/api/buku/999
```

**Hasil pengujian:**

Request mendapatkan status `404 Not Found` dengan response:

```json
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

## 8. Ringkasan Hasil Pengujian

| No. | Skenario Pengujian | Status HTTP | Hasil |
|---|---|---:|---|
| 1 | GET seluruh buku | 200 | Berhasil |
| 2 | GET filter penulis | 200 | Berhasil |
| 3 | GET filter stok minimal | 200 | Berhasil |
| 4 | GET kombinasi filter | 200 | Berhasil |
| 5 | GET detail buku | 200 | Berhasil |
| 6 | POST tambah buku | 201 | Berhasil |
| 7 | POST judul kosong | 400 | Ditolak sesuai validasi |
| 8 | POST tahun tidak valid | 400 | Ditolak sesuai validasi |
| 9 | POST stok negatif | 400 | Ditolak sesuai validasi |
| 10 | PATCH ubah stok | 200 | Berhasil |
| 11 | PATCH input tidak valid | 400 | Ditolak sesuai validasi |
| 12 | PATCH ID tidak ditemukan | 404 | Ditangani dengan benar |
| 13 | DELETE buku | 204 | Berhasil |
| 14 | DELETE ID tidak ditemukan | 404 | Ditangani dengan benar |

## 9. Database

Database menggunakan SQLite dengan Prisma ORM 7. Model utama yang digunakan adalah `Buku`, dengan atribut:

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | Int | ID buku dengan nilai bertambah otomatis |
| judul | String | Judul buku |
| penulis | String | Nama penulis buku |
| tahun | Int | Tahun terbit buku |
| stok | Int | Jumlah stok buku, default 0 |

Data disimpan dalam database SQLite sehingga pengelolaan data dilakukan melalui Prisma ORM.

## 10. Kesimpulan
Berdasarkan pengujian menggunakan cURL, endpoint GET, POST, PATCH, dan DELETE telah berjalan sesuai fungsinya. Fitur filter berdasarkan penulis dan stok minimal juga berhasil digunakan. Validasi input berhasil menolak data yang tidak sesuai ketentuan. Penanganan data yang tidak ditemukan menghasilkan status `404 Not Found`, sedangkan penghapusan data yang berhasil menghasilkan status `204 No Content`.

Dengan demikian, implementasi telah mencakup operasi CRUD, penggunaan Prisma ORM dan SQLite, pemisahan arsitektur routes-controller-service, validasi input, serta penanganan status HTTP dan error.