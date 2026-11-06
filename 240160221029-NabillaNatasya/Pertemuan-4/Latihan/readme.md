# Latihan Individu Pertemuan 4 — Express.js Dasar

**Nama:** Nabilla Natasya Putri
**NIM:** 240160221029

## Deskripsi

Latihan ini merupakan implementasi dasar Express.js untuk memahami penggunaan routing, route parameter, query parameter, middleware, request body, dan HTTP status code.

Aplikasi yang dibuat adalah REST API sederhana untuk mengelola data buku.

## Teknologi

- Node.js
- Express.js 5
- JavaScript ES Module
- REST API
- Postman untuk pengujian

## Struktur Folder

```text
latihan-individu/
├── latihan.js
├── package.json
├── package-lock.json
└── README.md
```

## Cara Menjalankan

Pastikan Node.js sudah terinstal pada komputer.

### 1. Install Dependency

Buka terminal pada folder proyek, kemudian jalankan:

```powershell
npm.cmd install
```

### 2. Menjalankan Aplikasi

Jalankan perintah:

```powershell
node latihan.js
```

Jika berhasil, terminal menampilkan:

```text
Latihan berjalan di http://localhost:3005
Uji: curl http://localhost:3005/buku?tersedia=true
```

Server berjalan pada port `3005`.

## Fitur yang Dibuat

### 1. Middleware Logger

Middleware logger digunakan untuk mencatat waktu request, method HTTP, dan URL yang diakses.

Contoh hasil pada terminal:

```text
[2026-10-13T04:00:00.000Z] GET /buku
[2026-10-13T04:00:05.000Z] GET /buku?tersedia=true
```

Waktu akan menyesuaikan saat request dilakukan.

### 2. Menampilkan Semua Buku

**Endpoint:** `GET /buku`

Pengujian menggunakan Postman:

```text
GET http://localhost:3005/buku
```

Endpoint ini menampilkan seluruh data buku dengan status `200 OK`.

Data awal yang tersedia:

- Belajar Node.js — tersedia.
- Dasar Express.js — tidak tersedia.

### 3. Filter Buku Berdasarkan Ketersediaan

**Endpoint:** `GET /buku?tersedia=true`

Pengujian menggunakan Postman:

```text
GET http://localhost:3005/buku?tersedia=true
```

Untuk menampilkan buku yang tidak tersedia:

```text
GET http://localhost:3005/buku?tersedia=false
```

Query parameter `tersedia` digunakan untuk memfilter buku berdasarkan status ketersediaannya.

### 4. Mencari Buku Berdasarkan ID

**Endpoint:** `GET /buku/:id`

Contoh pengujian:

```text
GET http://localhost:3005/buku/1
```

Jika buku ditemukan, API memberikan status `200 OK`.

Jika ID tidak ditemukan, API memberikan status `404 Not Found`.

Contoh pengujian:

```text
GET http://localhost:3005/buku/99
```

Contoh response:

```json
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

### 5. Menambahkan Buku

**Endpoint:** `POST /buku`

Field yang wajib dikirim:

- `judul`
- `penulis`

Langkah pengujian menggunakan Postman:

1. Pilih method `POST`.
2. Masukkan URL `http://localhost:3005/buku`.
3. Pilih **Body → raw → JSON**.
4. Masukkan data berikut:

```json
{
  "judul": "GOD GIVES ME YOU",
  "penulis": "Pritha Kurniasih"
}
```

5. Klik **Send**.

Jika berhasil, API memberikan status `201 Created`.

Contoh response:

```json
{
  "success": true,
  "data": {
    "id": 3,
    "judul": "Danur",
  "penulis": "Risa Saraswati",
    "tersedia": true
  }
}
```

ID `3` merupakan contoh ketika data awal masih terdiri dari dua buku.

### 6. Validasi Data Buku

Field `judul` dan `penulis` wajib diisi.

Untuk menguji validasi, kirim request `POST /buku` dengan data berikut:

```json
{
  "judul": "Buku Baru"
}
```

API memberikan status `400 Bad Request`.

Contoh response:

```json
{
  "success": false,
  "message": "Field judul dan penulis wajib diisi"
}
```

### 7. Handler Endpoint Tidak Ditemukan

Jika endpoint yang diakses tidak tersedia, API memberikan status `404 Not Found`.

Contoh pengujian menggunakan Postman:

```text
GET http://localhost:3005/abc
```

Contoh response:

```json
{
  "success": false,
  "message": "Endpoint GET /abc tidak ditemukan"
}
```

## Daftar Endpoint

| Method | Endpoint | Keterangan | Status |
|---|---|---|---|
| GET | `/buku` | Menampilkan semua buku | 200 |
| GET | `/buku?tersedia=true` | Menampilkan buku yang tersedia | 200 |
| GET | `/buku?tersedia=false` | Menampilkan buku yang tidak tersedia | 200 |
| GET | `/buku/:id` | Mencari buku berdasarkan ID | 200 / 404 |
| POST | `/buku` | Menambahkan buku baru | 201 / 400 |
| GET/POST | Endpoint lain yang tidak tersedia | Menampilkan pesan endpoint tidak ditemukan | 404 |

## Hasil Pengujian

Pengujian dilakukan menggunakan Postman dengan skenario berikut:

1. `GET /buku` untuk menampilkan seluruh data buku.
2. `GET /buku?tersedia=true` untuk menampilkan buku yang tersedia.
3. `GET /buku?tersedia=false` untuk menampilkan buku yang tidak tersedia.
4. `GET /buku/1` untuk mencari buku berdasarkan ID.
5. `GET /buku/99` untuk menguji respons ketika buku tidak ditemukan.
6. `POST /buku` dengan data lengkap untuk menambahkan buku baru.
7. `POST /buku` dengan data tidak lengkap untuk menguji validasi.
8. Mengakses endpoint yang tidak tersedia untuk menguji respons `404`.

Screenshot hasil pengujian Postman dilampirkan sebagai dokumentasi pengujian API.

## Kesimpulan

Pada latihan ini telah diterapkan fitur dasar Express.js, yaitu middleware logger, routing, route parameter, query parameter, request body, validasi input, dan handler endpoint yang tidak ditemukan.

Melalui latihan ini, dapat dipahami bagaimana API menerima request dari Postman, memproses data buku, dan memberikan response dengan HTTP status code yang sesuai.

Data buku masih disimpan dalam array di memori aplikasi, sehingga data yang ditambahkan akan hilang ketika server dihentikan atau dijalankan ulang.