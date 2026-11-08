# Latihan Individu Pertemuan 5 — RESTful API Mahasiswa

**Nama:** Nabilla Natasya Putri
**NPM:** 240160221029 
**Mata Kuliah:** Pemrograman Berbasis Web Back-End


## 1. Deskripsi

Latihan ini bertujuan untuk mengembangkan RESTful API menggunakan Express.js dengan resource `mahasiswa`. API menyediakan fitur untuk mengambil data mahasiswa, memfilter berdasarkan program studi, menambahkan data, mengubah sebagian data, dan menghapus data mahasiswa.

API menggunakan array sebagai penyimpanan data sementara (in-memory), sehingga perubahan data tidak tersimpan setelah server dimulai ulang.

## 2. Cara Menjalankan Program

Pastikan Node.js sudah terpasang. Buka terminal pada folder `latihan-individu`, kemudian jalankan perintah berikut:

```bash
npm.cmd install
node latihan.js
```

Jika berhasil, terminal akan menampilkan pesan:

```text
Latihan REST API berjalan di http://localhost:3007
```

API dapat diuji menggunakan Postman dengan alamat dasar:

`http://localhost:3007`

## 3. Daftar Endpoint

| No. | Method | Endpoint | Fungsi |
|---|---|---|---|
| 1 | GET | `/mahasiswa` | Mengambil seluruh data mahasiswa |
| 2 | GET | `/mahasiswa?prodi=Sistem%20Informasi` | Memfilter mahasiswa berdasarkan prodi |
| 3 | GET | `/mahasiswa/:nim` | Mengambil detail mahasiswa berdasarkan NIM |
| 4 | POST | `/mahasiswa` | Menambahkan data mahasiswa |
| 5 | PATCH | `/mahasiswa/:nim` | Mengubah sebagian data mahasiswa |
| 6 | DELETE | `/mahasiswa/:nim` | Menghapus data mahasiswa |

## 4. Hasil Pengujian API

### A. GET — Mengambil Seluruh Data Mahasiswa

- **Method:** GET
- **URL:** `http://localhost:3007/mahasiswa`
- **Status Code:** 200 OK

Response JSON:

```json
{
   "success": true,
    "message": "Data mahasiswa berhasil diambil",
    "data": [
        {
            "nim": "240160221029",
            "nama": "Nabilla Natasya Putri",
            "prodi": "Sistem Informasi",
            "angkatan": 2024
        },
        {
            "nim": "240160221030",
            "nama": "Nadya Zahra Aulia",
            "prodi": "Sistem Informasi",
            "angkatan": 2024
        }
  ]
}
```

**Hasil:** API berhasil menampilkan seluruh data mahasiswa yang tersedia.

### B. GET — Filter Berdasarkan Program Studi

- **Method:** GET
- **URL:** `http://localhost:3007/mahasiswa?prodi=Sistem%20Informasi`
- **Status Code:** 200 OK

Response JSON berisi data mahasiswa dengan program studi Sistem Informasi.

**Hasil:** API berhasil memfilter data berdasarkan parameter query `prodi`.

### C. GET — Detail Mahasiswa Berdasarkan NIM

- **Method:** GET
- **URL:** `http://localhost:3007/mahasiswa/240160221029`
- **Status Code:** 200 OK

Response JSON:

```json
{
  "success": true,
  "message": "Detail mahasiswa berhasil diambil",
  "data": {
        "nim": "240160221029",
        "nama": "Nabilla Natasya Putri",
        "prodi": "Sistem Informasi",
        "angkatan": 2024
    }
}
```

**Hasil:** API berhasil menampilkan detail mahasiswa berdasarkan NIM yang diminta.

### D. GET — NIM Tidak Ditemukan

- **Method:** GET
- **URL:** `http://localhost:3007/mahasiswa/240160221034`
- **Status Code:** 404 Not Found

Response JSON:

```json
{
  "success": false,
  "message": "Mahasiswa tidak ditemukan"
}
```

**Hasil:** API mengembalikan status 404 ketika NIM tidak ditemukan.

### E. POST — Menambahkan Data Mahasiswa

- **Method:** POST
- **URL:** `http://localhost:3007/mahasiswa`
- **Status Code:** 201 Created

Body JSON:

```json
{ 
   "nim": "240160221035",
    "nama": "Putri Indra Lestari",
    "prodi": "Sistem Informasi",
    "angkatan": 2024
    }
```

Response JSON:

```json
{
  "success": true,
  "message": "Mahasiswa berhasil ditambahkan",
  "data": {
       "nim": "240160221035",
    "nama": "Putri Indra Lestari",
    "prodi": "Sistem Informasi",
    "angkatan": 2024
  }
}
```

**Hasil:** API berhasil menambahkan mahasiswa baru dan mengembalikan status 201 Created.

### F. POST — Validasi Data Mahasiswa

- **Method:** POST
- **URL:** `http://localhost:3007/mahasiswa`
- **Status Code:** 400 Bad Request

Body JSON:

```json
{
 "nama": "Rahma Nadya",
    "prodi": "Sistem Informasi"
}
```

Response JSON:

```json
{
  "success": false,
  "message": "Field wajib diisi: prodi, angkatan."
}
```

**Hasil:** API menolak data karena field `prodi` dan `angkatan` belum diisi.

### G. PATCH — Mengubah Sebagian Data Mahasiswa

- **Method:** PATCH
- **URL:** `http://localhost:3007/mahasiswa/240160221035`
- **Status Code:** 200 OK

Body JSON:

```json
{
  "nama": "Putri Indra L"
}
```

Response JSON:

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diperbarui",
  "data": {
    "nim": "240160221035",
        "nama": "Putri Indra L",
        "prodi": "Sistem Informasi",
        "angkatan": 2024
  }
}
```

**Hasil:** API berhasil mengubah nama mahasiswa tanpa mengubah field lainnya.

### H. DELETE — Menghapus Data Mahasiswa

- **Method:** DELETE
- **URL:** `http://localhost:3007/mahasiswa/240160221035`
- **Status Code:** 204 No Content

Response body tidak tersedia karena server mengembalikan status `204 No Content`.

**Hasil:** Berdasarkan pengujian di Postman, server mengembalikan status 204 No Content. Status ini menandakan request penghapusan berhasil diproses tanpa response body.

## 5. Middleware Logger

Middleware logger digunakan untuk mencatat method dan URL setiap request yang masuk ke server.

Contoh keluaran terminal:

```text
GET /mahasiswa
GET /mahasiswa?prodi=Sistem%20Informasi
GET /mahasiswa/240160221029
POST /mahasiswa
PATCH /mahasiswa/240160221035
DELETE /mahasiswa/240160221035
```

## 6. Kesimpulan

Berdasarkan implementasi dan pengujian, RESTful API mahasiswa menyediakan endpoint untuk mengambil data, memfilter berdasarkan program studi, menambahkan data, memperbarui sebagian data, dan menghapus data.

Validasi request digunakan untuk memastikan data yang dikirim sesuai ketentuan. Pengujian juga mencakup status HTTP 200 OK, 201 Created, 400 Bad Request, 404 Not Found, dan 204 No Content.

Dengan latihan ini, konsep dasar RESTful API, routing Express.js, middleware, parameter URL, query parameter, validasi data, serta HTTP status code dapat diterapkan dalam pengembangan backend.