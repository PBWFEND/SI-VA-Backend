# Latihan RESTful API — Mahasiswa (Express.js)

**Nama:** Winda Nurhidayah  
**NIM:** 240160221047  
**Mata Kuliah / Pertemuan:** Praktikum Backend — Pertemuan 5 (RESTful API dengan Express.js)

Proyek ini adalah implementasi praktikum untuk merancang dan menerapkan RESTful API resource `mahasiswa` menggunakan Express.js 5 dengan operasi CRUD lengkap, validasi input, query parameter untuk filter, route parameter, serta format response JSON yang konsisten.

## Stack Teknologi

- **Node.js 20+ / 24 LTS**
- **Express.js 5**

---

## Cara Menjalankan Proyek

1. Masuk ke direktori proyek melalui terminal.
2. Pasang dependensi yang diperlukan:

```bash
npm install
```

3. Jalankan server:

```bash
npm start
```

Server akan berjalan di alamat:  
http://localhost:3007

---

## Contoh Pengujian (Request & Response)

### 1. Mengambil Semua Mahasiswa (GET /mahasiswa)

**Request:**

`GET http://localhost:3007/mahasiswa`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diambil",
  "data": [
    {
      "nim": "240160221047",
      "nama": "Winda Nurhidayah",
      "prodi": "Sistem Informasi",
      "angkatan": 2024
    },
    {
      "nim": "230160221011",
      "nama": "Djanuar",
      "prodi": "Sistem Informasi",
      "angkatan": 2023
    }
  ]
}
```

### 2. Filter Mahasiswa Berdasarkan Prodi (GET /mahasiswa?prodi=...)

**Request:**

`GET http://localhost:3007/mahasiswa?prodi=Sistem%20Informasi`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diambil",
  "data": [
    {
      "nim": "240160221047",
      "nama": "Winda Nurhidayah",
      "prodi": "Sistem Informasi",
      "angkatan": 2024
    },
    {
      "nim": "230160221011",
      "nama": "Djanuar",
      "prodi": "Sistem Informasi",
      "angkatan": 2023
    }
  ]
}
```

### 3. Menambah Mahasiswa (POST /mahasiswa)

**Request:**

`POST http://localhost:3007/mahasiswa`

**Request Body:**

```json
{
  "nim": "240160221042",
  "nama": "Wiedy Aulia",
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}
```

**Response (201 Created):** Berhasil menambahkan data baru.

```json
{
  "success": true,
  "message": "Mahasiswa berhasil ditambahkan",
  "data": {
    "nim": "240160221042",
    "nama": "Wiedy Aulia",
    "prodi": "Sistem Informasi",
    "angkatan": 2024
  }
}
```

### 4. Mengubah Sebagian Data (PATCH /mahasiswa/:nim)

**Request:**

`PATCH http://localhost:3007/mahasiswa/240160221047`

**Request Body:**

```json
{
  "nama": "Winda Nurhidayah Updated"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diperbarui",
  "data": {
    "nim": "240160221047",
    "nama": "Winda Nurhidayah Updated",
    "prodi": "Sistem Informasi",
    "angkatan": 2024
  }
}
```

### 5. Menghapus Mahasiswa (DELETE /mahasiswa/:nim)

**Request:**

`DELETE http://localhost:3007/mahasiswa/230160221011`

**Response (204 No Content):** Berhasil dihapus tanpa body response.

---

## Kesimpulan

Berhasil merancang dan menguji RESTful API resource mahasiswa menggunakan Express.js 5 yang mencakup validasi input, query filter, parameter rute, serta pengelolaan status code (200, 201, 204, 400, 404) secara konsisten.