# Tugas 3 — RESTful API dengan Express.js

**Nama:** Winda Nurhidayah  
**NIM:** 240160221047  
**Mata Kuliah / Pertemuan:** Praktikum Backend — Pertemuan 5 (RESTful API dengan Express.js)

Proyek ini merupakan implementasi Tugas 3 untuk merancang dan menerapkan RESTful API resource `buku` menggunakan Express.js. API ini menyediakan operasi CRUD, validasi input, query parameter untuk filter, route parameter, serta format response JSON yang konsisten.

## Stack Teknologi

- Node.js
- Express.js

---

## Cara Menjalankan Proyek

1. Masuk ke direktori folder tugas melalui terminal.
2. Pasang dependensi yang diperlukan:

```bash
npm install
```

3. Jalankan server:

```bash
npm start
```

Server berjalan pada alamat:

`http://localhost:3007`

## Struktur Data Buku

Data buku memiliki atribut sebagai berikut:

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | Number | ID buku |
| judul | String | Judul buku |
| penulis | String | Nama penulis |
| tahun | Number | Tahun terbit |
| stok | Number | Jumlah stok buku |

## Kontrak Endpoint

| Method | Endpoint | Fungsi | Status Code |
|---|---|---|---|
| GET | `/buku` | Mengambil semua data buku | 200 |
| GET | `/buku/:id` | Mengambil detail buku berdasarkan ID | 200, 404 |
| POST | `/buku` | Menambahkan buku baru | 201, 400 |
| PUT | `/buku/:id` | Mengubah seluruh data buku | 200, 400, 404 |
| PATCH | `/buku/:id` | Mengubah sebagian data buku | 200, 400, 404 |
| DELETE | `/buku/:id` | Menghapus data buku | 204, 404 |

## Query Parameter

API menyediakan dua query parameter untuk melakukan filter data buku.

| Parameter | Fungsi | Contoh |
|---|---|---|
| `penulis` | Memfilter buku berdasarkan nama penulis | `/buku?penulis=Winda%20Nurhidayah` |
| `minStok` | Memfilter buku berdasarkan jumlah stok minimal | `/buku?minStok=4` |

Kedua parameter dapat digunakan secara bersamaan:

`GET /buku?penulis=Winda%20Nurhidayah&minStok=4`

---

## Contoh Pengujian Request dan Response

### 1. Mengambil Semua Data Buku

**Request:**

`GET http://localhost:3007/buku`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Daftar buku berhasil diambil",
  "data": [
    {
      "id": 1,
      "judul": "Pemrograman Web",
      "penulis": "Winda Nurhidayah",
      "tahun": 2024,
      "stok": 5
    },
    {
      "id": 2,
      "judul": "Basis Data Lanjutan",
      "penulis": "Djanuar",
      "tahun": 2023,
      "stok": 3
    }
  ]
}
```

### 2. Filter Buku Berdasarkan Penulis

**Request:**

`GET http://localhost:3007/buku?penulis=Winda%20Nurhidayah`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Daftar buku berhasil diambil",
  "data": [
    {
      "id": 1,
      "judul": "Pemrograman Web",
      "penulis": "Winda Nurhidayah",
      "tahun": 2024,
      "stok": 5
    }
  ]
}
```

### 3. Filter Buku Berdasarkan Stok Minimal

**Request:**

`GET http://localhost:3007/buku?minStok=4`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Daftar buku berhasil diambil",
  "data": [
    {
      "id": 1,
      "judul": "Pemrograman Web",
      "penulis": "Winda Nurhidayah",
      "tahun": 2024,
      "stok": 5
    }
  ]
}
```

### 4. Mengambil Detail Buku Berdasarkan ID

**Request:**

`GET http://localhost:3007/buku/1`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Detail buku berhasil diambil",
  "data": {
    "id": 1,
    "judul": "Pemrograman Web",
    "penulis": "Winda Nurhidayah",
    "tahun": 2024,
    "stok": 5
  }
}
```

### 5. Menambahkan Data Buku

**Request:**

`POST http://localhost:3007/buku`

**Request Body:**

```json
{
  "judul": "Belajar Express.js",
  "penulis": "Winda Nurhidayah",
  "tahun": 2025,
  "stok": 10
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": 3,
    "judul": "Belajar Express.js",
    "penulis": "Winda Nurhidayah",
    "tahun": 2025,
    "stok": 10
  }
}
```

### 6. Validasi Input Tidak Valid

**Request:**

`POST http://localhost:3007/buku`

**Request Body:**

```json
{
  "judul": "",
  "penulis": "",
  "tahun": "dua ribu",
  "stok": -1
}
```

**Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Data buku tidak valid",
  "details": [
    "Judul wajib diisi",
    "Penulis wajib diisi",
    "Tahun wajib diisi dan berupa angka",
    "Stok wajib diisi berupa bilangan bulat minimal 0"
  ]
}
```

### 7. Mengubah Seluruh Data Buku

**Request:**

`PUT http://localhost:3007/buku/1`

**Request Body:**

```json
{
  "judul": "Pemrograman Web Updated",
  "penulis": "Winda Nurhidayah",
  "tahun": 2025,
  "stok": 10
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Buku berhasil diperbarui",
  "data": {
    "id": 1,
    "judul": "Pemrograman Web Updated",
    "penulis": "Winda Nurhidayah",
    "tahun": 2025,
    "stok": 10
  }
}
```

### 8. Mengubah Sebagian Data Buku

**Request:**

`PATCH http://localhost:3007/buku/1`

**Request Body:**

```json
{
  "stok": 15
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Buku berhasil diperbarui",
  "data": {
    "id": 1,
    "judul": "Pemrograman Web Updated",
    "penulis": "Winda Nurhidayah",
    "tahun": 2025,
    "stok": 15
  }
}
```

### 9. Menghapus Data Buku

**Request:**

`DELETE http://localhost:3007/buku/2`

**Response (204 No Content):**

Data buku berhasil dihapus tanpa mengembalikan response body.

### 10. Resource Tidak Ditemukan

**Request:**

`GET http://localhost:3007/buku/999`

**Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

---

## Validasi Input

Validasi input diterapkan pada operasi POST, PUT, dan PATCH.

Ketentuan validasi:

1. Judul wajib diisi.
2. Penulis wajib diisi.
3. Tahun wajib berupa angka bulat.
4. Stok wajib berupa angka bulat minimal 0.
5. Pada operasi PATCH, validasi dilakukan terhadap field yang dikirimkan.

Jika data tidak memenuhi ketentuan, API memberikan status `400 Bad Request`.

## HTTP Status Code

| Status Code | Keterangan |
|---|---|
| 200 OK | Permintaan berhasil |
| 201 Created | Data buku berhasil ditambahkan |
| 204 No Content | Data buku berhasil dihapus tanpa response body |
| 400 Bad Request | Input yang diberikan tidak valid |
| 404 Not Found | Data buku tidak ditemukan |

## Middleware Logger

Aplikasi menggunakan middleware logger untuk mencatat setiap request yang masuk, meliputi waktu request, HTTP method, dan URL.

Contoh tampilan pada terminal:

```text
[2026-11-13T04:00:00.000Z] GET /buku
[2026-11-13T04:00:01.000Z] POST /buku
```

## Hasil Pengujian

Pengujian RESTful API dilakukan menggunakan Postman untuk memastikan setiap endpoint berjalan sesuai fungsinya. Pengujian meliputi pengambilan data, penambahan data, perubahan seluruh data, perubahan sebagian data, penghapusan data, filter, validasi input, serta penanganan resource yang tidak ditemukan.

**Dokumentasi screenshot pengujian dapat dilampirkan pada folder `screenshots`.**

## Kesimpulan

Proyek ini berhasil mengimplementasikan RESTful API resource buku menggunakan Express.js dengan operasi CRUD, yaitu GET, POST, PUT, PATCH, dan DELETE. API juga menerapkan route parameter, dua query parameter untuk filter, validasi input, penggunaan HTTP status code, serta struktur response JSON yang konsisten.