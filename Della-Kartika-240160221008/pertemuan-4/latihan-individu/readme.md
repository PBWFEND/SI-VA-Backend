# Latihan Individu Pertemuan 4 — Express.js Dasar

DELLA KARTIKA
240160221008
## Deskripsi

Latihan ini merupakan implementasi dasar Express.js untuk memahami penggunaan routing, route parameter, query parameter, middleware, request body, dan HTTP status code.

Aplikasi yang dibuat adalah API sederhana untuk mengelola data buku.

## Teknologi

* Node.js
* Express.js 5
* JavaScript ES Module
* REST API
* cURL untuk pengujian

## Struktur Folder

```text
pertemuan-04/
├── latihan.js
├── package.json
├── package-lock.json
└── README.md
```

## Cara Menjalankan

Pastikan Node.js sudah terinstall.

### 1. Install dependency

Buka terminal pada folder `pertemuan-04`, kemudian jalankan:

```bash
npm install
```

### 2. Menjalankan aplikasi

```bash
npm start
```

Jika berhasil, akan muncul:

```text
Latihan berjalan di http://localhost:3005
```

Server berjalan pada port `3005`.

## Fitur yang Dibuat

### 1. Middleware Logger

Middleware logger digunakan untuk mencatat:

* waktu request
* method HTTP
* URL yang diakses

Contoh hasil pada terminal:

```text
[5/10/2026, 19.10.15] GET /buku
[5/10/2026, 19.10.20] GET /buku?tersedia=true
```

Waktu pada contoh di atas akan menyesuaikan waktu saat aplikasi dijalankan.

### 2. Menampilkan Semua Buku

Endpoint:

```http
GET /buku
```

Pengujian:

```bash
curl http://localhost:3005/buku
```

Endpoint ini menampilkan seluruh data buku.

### 3. Filter Buku Berdasarkan Ketersediaan

Endpoint:

```http
GET /buku?tersedia=true
```

Pengujian:

```bash
curl "http://localhost:3005/buku?tersedia=true"
```

Untuk menampilkan buku yang tidak tersedia:

```bash
curl "http://localhost:3005/buku?tersedia=false"
```

Query parameter `tersedia` digunakan untuk melakukan filter berdasarkan status ketersediaan buku.

### 4. Mencari Buku Berdasarkan ID

Endpoint:

```http
GET /buku/:id
```

Contoh:

```bash
curl http://localhost:3005/buku/1
```

Jika buku ditemukan, API memberikan response dengan status `200`.

Jika ID tidak ditemukan, API memberikan status `404`.

Contoh:

```bash
curl http://localhost:3005/buku/99
```

Response:

```json
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

### 5. Menambahkan Buku

Endpoint:

```http
POST /buku
```

Field yang wajib dikirim:

* `judul`
* `penulis`

Contoh pengujian:

```bash
curl -X POST http://localhost:3005/buku -H "Content-Type: application/json" -d "{\"judul\":\"Pemrograman Backend\",\"penulis\":\"Fauzan\"}"
```

Jika berhasil, API memberikan status `201`.

Contoh response:

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": 3,
    "judul": "Pemrograman Backend",
    "penulis": "Fauzan",
    "tersedia": true
  }
}
```

### 6. Validasi Data Buku

Field `judul` dan `penulis` wajib diisi.

Contoh pengujian:

```bash
curl -X POST http://localhost:3005/buku -H "Content-Type: application/json" -d "{\"judul\":\"Buku Baru\"}"
```

Response:

```json
{
  "success": false,
  "message": "Field judul dan penulis wajib diisi"
}
```

Status response adalah `400 Bad Request`.

### 7. Handler Endpoint Tidak Ditemukan

Jika endpoint yang diakses tidak tersedia, aplikasi memberikan response `404`.

Contoh:

```bash
curl http://localhost:3005/abc
```

Response:

```json
{
  "success": false,
  "message": "Endpoint tidak ditemukan"
}
```

## Daftar Endpoint

| Method   | Endpoint               | Keterangan                           | Status    |
| -------- | ---------------------- | ------------------------------------ | --------- |
| GET      | `/buku`                | Menampilkan semua buku               | 200       |
| GET      | `/buku?tersedia=true`  | Menampilkan buku yang tersedia       | 200       |
| GET      | `/buku?tersedia=false` | Menampilkan buku yang tidak tersedia | 200       |
| GET      | `/buku/:id`            | Menampilkan buku berdasarkan ID      | 200 / 404 |
| POST     | `/buku`                | Menambahkan buku baru                | 201 / 400 |
| GET/POST | endpoint lain          | Endpoint tidak tersedia              | 404       |

## Hasil Pengujian

Pengujian dilakukan menggunakan `curl` pada terminal.

### Pengujian GET `/buku`

```bash
curl http://localhost:3005/buku
```

Hasil: **berhasil menampilkan seluruh data buku.**

### Pengujian Filter

```bash
curl "http://localhost:3005/buku?tersedia=true"
```

Hasil: **berhasil menampilkan buku yang tersedia.**

```bash
curl "http://localhost:3005/buku?tersedia=false"
```

Hasil: **berhasil menampilkan buku yang tidak tersedia.**

### Pengujian GET `/buku/:id`

```bash
curl http://localhost:3005/buku/1
```

Hasil: **berhasil menampilkan buku berdasarkan ID.**

```bash
curl http://localhost:3005/buku/99
```

Hasil: **berhasil memberikan status 404 ketika buku tidak ditemukan.**

### Pengujian POST `/buku`

```bash
curl -X POST http://localhost:3005/buku -H "Content-Type: application/json" -d "{\"judul\":\"Pemrograman Backend\",\"penulis\":\"Fauzan\"}"
```

Hasil: **berhasil menambahkan data buku baru dengan status 201.**

### Pengujian Validasi

```bash
curl -X POST http://localhost:3005/buku -H "Content-Type: application/json" -d "{\"judul\":\"Buku Baru\"}"
```

Hasil: **berhasil memberikan status 400 karena field `penulis` tidak diisi.**

### Pengujian Endpoint Tidak Ditemukan

```bash
curl http://localhost:3005/abc
```

Hasil: **berhasil memberikan status 404 karena endpoint tidak tersedia.**

## Kesimpulan

Pada latihan ini telah diterapkan beberapa fitur dasar Express.js, yaitu middleware logger, routing, route parameter, query parameter, request body, validasi input, dan handler 404.

Melalui latihan ini, API sederhana untuk data buku dapat menerima request, memproses data, dan memberikan response sesuai dengan kondisi request yang diberikan.
