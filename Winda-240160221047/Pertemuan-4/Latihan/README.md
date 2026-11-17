# Pertemuan 4 — Latihan Routing dan Middleware Express.js

**Nama:** Winda  
**NPM:** 240160221047

## Deskripsi

Latihan ini mengembangkan aplikasi Express.js dengan menerapkan:

- Middleware logger
- Route parameter
- Query parameter
- POST request
- Validasi request body
- Handler 404

## Menjalankan Aplikasi

```bash
npm install
node latihan.js
```

Jalankan server:

```bash
node latihan.js
```

## Pengujian Endpoint dan Hasil

Berikut adalah hasil pengujian endpoint menggunakan `curl` atau browser.

### 1. GET /buku (Menampilkan Semua Buku)

`GET http://localhost:3005/buku`

**Hasilnya:**

```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "id": 1,
      "judul": "Belajar Node.js",
      "penulis": "Winda",
      "tersedia": true
    },
    {
      "id": 2,
      "judul": "Dasar Express.js",
      "penulis": "Anzar",
      "tersedia": false
    }
  ]
}
```

### 2. GET /buku?tersedia=true (Filter Query Parameter)

`GET http://localhost:3005/buku?tersedia=true`

**Hasilnya:**

```json
{
    "success": true,
    "total": 0,
    "data": []
}
```

### 3. GET /buku/:id (Detail Buku Berdasarkan ID)

`GET http://localhost:3005/buku/1`

**Hasilnya:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "judul": "Belajar Node.js",
    "penulis": "Winda",
    "tersedia": true
  }
}
```

### 4. GET /buku/99 (Error 404 - Buku Tidak Ditemukan)

`GET http://localhost:3005/buku/99`

**Hasilnya:**

```json
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

### 5. POST /buku (Menambahkan Buku Baru)

`POST http://localhost:3005/buku`

**Body:**

```json
{
  "judul": "Pemrograman Express",
  "penulis": "Winda",
  "tersedia": true
}
```

**Hasilnya:**

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": 3,
    "judul": "Pemrograman Express",
    "penulis": "Winda",
    "tersedia": true
  }
}
```

### 6. POST /buku (Gagal Validasi - Kurang Field Penulis)

`POST http://localhost:3005/buku`

**Body:**

```json
{
  "judul": "Buku Tanpa Penulis"
}
```

**Hasilnya:**

```json
{
  "success": false,
  "message": "Field 'judul' dan 'penulis' wajib diisi!"
}
```

### 7. Handler 404 (Endpoint Tidak Tersedia)

`GET http://localhost:3005/salah-endpoint`

**Hasilnya:**

```json
{
  "success": false,
  "message": "Endpoint tidak ditemukan"
}
```