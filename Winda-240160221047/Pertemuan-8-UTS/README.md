# MINI PROJECT UTS — REST API PERPUSTAKAAN

**Nama:** Winda Nurhidayah  
**NIM:** 240160221047  
**Kelas:** SI-VA  
**Mata Kuliah:** Backend 

## 1. Deskripsi Proyek

Mini Project UTS ini merupakan pengembangan REST API sederhana untuk mengelola data buku pada sebuah perpustakaan.

Aplikasi dibuat menggunakan Express.js sebagai backend dan Prisma ORM dengan database SQLite untuk menyimpan data. Sistem menyediakan fitur CRUD (Create, Read, Update, Delete), sehingga pengguna dapat menambahkan, melihat, mengubah, dan menghapus data buku melalui endpoint API.

## 2. Teknologi yang Digunakan

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- Postman untuk pengujian API

## 3. Struktur Folder Proyek

```text
Pertemuan-8-UTS/
│
├── generated/
│   └── prisma/
│
├── node_modules/
│
├── prisma/
│   ├── migrations/
│   ├── dev.db
│   └── schema.prisma
│
├── Screenshot/
│   ├── DELETE buku.png
│   ├── GET detail buku.png
│   ├── GET healty.png
│   ├── GET home.png
│   ├── GET semua buku.png
│   ├── GET setelah delete buku.png
│   ├── PACTH buku.png
│   └── POST buku.png
│
├── src/
│   ├── controller/
│   │   └── buku.controller.ts
│   ├── routes/
│   │   └── buku.routes.ts
│   └── service/
│       └── buku.service.ts
│
├── .env
├── .gitignore
├── app.ts
├── client.ts
├── package-lock.json
├── package.json
├── prisma7.config.ts
├── server.ts
└── README.md
```

## 4. Penjelasan Struktur Folder

| File/Folder | Keterangan |
|---|---|
| `generated/prisma/` | Berisi Prisma Client yang dihasilkan dari schema Prisma. |
| `node_modules/` | Berisi package atau library proyek. |
| `prisma/migrations/` | Menyimpan riwayat perubahan struktur database. |
| `prisma/dev.db` | File database SQLite. |
| `prisma/schema.prisma` | Mendefinisikan model atau struktur tabel database. |
| `src/controller/` | Mengatur proses permintaan dan respons pengguna. |
| `src/routes/` | Mengatur alamat endpoint API. |
| `src/service/` | Mengatur proses pengolahan data melalui Prisma. |
| `Screenshot/` | Menyimpan bukti hasil pengujian API menggunakan Postman. |
| `.env` | Menyimpan konfigurasi lingkungan. |
| `app.ts` | Mengatur middleware, routes, dan error handler. |
| `client.ts` | Menghubungkan aplikasi dengan database menggunakan Prisma Client. |
| `server.ts` | Menjalankan server aplikasi. |
| `prisma7.config.ts` | Mengatur konfigurasi Prisma. |
| `package.json` | Menyimpan informasi proyek dan perintah yang digunakan. |
| `README.md` | Dokumentasi proyek. |

## 5. Model Database

Proyek ini menggunakan model `Buku` dengan struktur sebagai berikut:

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | Int | Primary key dan auto increment |
| judul | String | Judul buku |
| penulis | String | Nama penulis buku |
| tahun | Int | Tahun terbit buku |
| stok | Int | Jumlah stok buku |

## 6. Fitur API

API Perpustakaan memiliki beberapa fitur utama:

1. Menampilkan seluruh data buku.
2. Menampilkan detail buku berdasarkan ID.
3. Menambahkan data buku baru.
4. Mengubah data buku berdasarkan ID.
5. Menghapus data buku berdasarkan ID.

## 7. Daftar Endpoint API

**Base URL:** `http://localhost:3010`

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Menampilkan pesan bahwa API berjalan. |
| GET | `/health` | Mengecek status server. |
| GET | `/buku` | Menampilkan seluruh data buku. |
| GET | `/buku/:id` | Menampilkan detail buku berdasarkan ID. |
| POST | `/buku` | Menambahkan data buku. |
| PATCH | `/buku/:id` | Mengubah data buku. |
| DELETE | `/buku/:id` | Menghapus data buku. |

## 8. Validasi Data

Validasi dilakukan pada proses penambahan dan perubahan data buku.

Ketentuan validasi:

- Judul harus berupa teks dan tidak boleh kosong.
- Penulis harus berupa teks dan tidak boleh kosong.
- Tahun harus berupa angka bulat antara 1000 sampai 2100.
- Stok harus berupa angka bulat dan tidak boleh kurang dari 0.
- ID buku harus berupa angka bulat positif.
- PATCH harus memiliki minimal satu data yang ingin diubah.

## 9. Status HTTP

| Status | Keterangan |
|---|---|
| 200 OK | Permintaan berhasil. |
| 201 Created | Data berhasil ditambahkan. |
| 204 No Content | Data berhasil dihapus. |
| 400 Bad Request | Data atau permintaan tidak valid. |
| 404 Not Found | Data atau endpoint tidak ditemukan. |
| 500 Internal Server Error | Terjadi kesalahan pada server. |

## 10. Cara Menjalankan Proyek

### A. Instalasi Dependency

Buka terminal pada folder proyek, kemudian jalankan:

```bash
npm install
```

### B. Menjalankan Migration

```bash
npx prisma migrate dev
```

### C. Generate Prisma Client

```bash
npx prisma generate
```

### D. Menjalankan Server

```bash
npm run dev
```

Jika berhasil, terminal akan menampilkan:

```text
Server berjalan di http://localhost:3010
```

API dapat diakses melalui Postman menggunakan alamat:

`http://localhost:3010`

## 11. Pengujian API Menggunakan Postman

Pengujian dilakukan menggunakan aplikasi Postman untuk memastikan setiap endpoint berjalan sesuai fungsinya.

### 1. GET Halaman Utama

- Method: `GET`
- URL: `http://localhost:3010/`

Hasil yang diharapkan:

```json
{
  "pesan": "API Perpustakaan berhasil dijalankan"
}
```

### 2. GET Health Check

- Method: `GET`
- URL: `http://localhost:3010/health`

Hasil yang diharapkan:

```json
{
  "status": "OK"
}
```

### 3. POST Menambahkan Buku

- Method: `POST`
- URL: `http://localhost:3010/buku`
- Body → raw → JSON:

```json
{
  "judul": "Belajar Pemrograman",
  "penulis": "Winda",
  "tahun": 2024,
  "stok": 10
}
```

Hasil yang diharapkan: status `201 Created` dan data buku berhasil ditambahkan.

### 4. GET Seluruh Buku

- Method: `GET`
- URL: `http://localhost:3010/buku`

Hasil yang diharapkan: menampilkan seluruh data buku yang tersimpan di database.

### 5. GET Detail Buku

- Method: `GET`
- URL: `http://localhost:3010/buku/1`

Hasil yang diharapkan: menampilkan detail buku berdasarkan ID.

### 6. PATCH Mengubah Buku

- Method: `PATCH`
- URL: `http://localhost:3010/buku/1`
- Body → raw → JSON:

```json
{
  "stok": 15
}
```

Hasil yang diharapkan: status `200 OK` dan stok buku berubah menjadi 15.

### 7. DELETE Menghapus Buku

- Method: `DELETE`
- URL: `http://localhost:3010/buku/1`

Hasil yang diharapkan: status `204 No Content` dan data buku berhasil dihapus.

### 8. GET Setelah Penghapusan

- Method: `GET`
- URL: `http://localhost:3010/buku`

Hasil yang diharapkan: data buku yang sebelumnya dihapus tidak lagi ditampilkan.

## 12. Dokumentasi Screenshot Pengujian

Screenshot berikut merupakan dokumentasi hasil pengujian API menggunakan Postman.

### 1. GET Halaman Utama

![GET Home](Screenshot/GET%20home.png)

### 2. GET Health Check

![GET Health](Screenshot/GET%20healty.png)

### 3. POST Menambahkan Buku

![POST Buku](Screenshot/POST%20buku.png)

### 4. GET Seluruh Buku

![GET Semua Buku](Screenshot/GET%20semua%20buku.png)

### 5. GET Detail Buku

![GET Detail Buku](Screenshot/GET%20detail%20buku.png)

### 6. PATCH Mengubah Buku

![PATCH Buku](Screenshot/PACTH%20buku.png)

### 7. DELETE Menghapus Buku

![DELETE Buku](Screenshot/DELETE%20buku.png)

### 8. GET Setelah Penghapusan

![GET Setelah Delete](Screenshot/GET%20setelah%20delete%20buku.png)

## 13. Kesimpulan

Berdasarkan Mini Project UTS yang telah dibuat, REST API Perpustakaan dikembangkan menggunakan Express.js, TypeScript, Prisma ORM, dan SQLite.

Aplikasi memiliki fitur CRUD untuk mengelola data buku serta menggunakan struktur berlapis yang memisahkan routes, controller, dan service. Selain itu, terdapat validasi input, penggunaan status HTTP, serta middleware untuk menangani endpoint yang tidak ditemukan dan kesalahan pada server.

Pengujian menggunakan Postman dilakukan untuk memastikan setiap endpoint dapat menjalankan fungsinya sesuai kebutuhan.
