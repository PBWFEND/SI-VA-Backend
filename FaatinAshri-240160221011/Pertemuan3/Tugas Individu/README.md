
# Tugas 2 - Project Node.js dan HTTP Server Sederhana

**Nama:** Faatin Ashri Widiatin

**NPM:** 240160221011

## Deskripsi

Project ini merupakan implementasi HTTP Server sederhana menggunakan Node.js
dengan ES Module (ESM).

Project memiliki konfigurasi aplikasi, helper untuk response JSON,
beberapa endpoint GET, penanganan endpoint yang tidak ditemukan,
serta pembacaan data mahasiswa dari file JSON secara asynchronous.


## Konfigurasi

Konfigurasi aplikasi terdapat pada `config.js` dan menggunakan environment
variable:

* `APP_NAME` untuk nama aplikasi
* `PORT` untuk port server
* `NODE_ENV` untuk environment aplikasi

Nilai default yang digunakan:

* APP_NAME: `API Tugas 2`
* PORT: `3003`
* NODE_ENV: `development`


## Cara Menjalankan

Pastikan terminal berada di dalam folder project:

```bash
cd "Pertemuan3/Tugas Individu"
```

Kemudian jalankan server menggunakan perintah:

```bash
node server.js
```

Jika berhasil dijalankan, terminal akan menampilkan:

```text
API Tugas 2 berjalan di http://localhost:3003
```

Server kemudian dapat diuji menggunakan `curl`.

## Endpoint

### 1. GET `/`

Endpoint utama untuk menampilkan informasi aplikasi dan daftar endpoint
yang tersedia.

Perintah pengujian:

```bash
curl http://localhost:3003/
```

Hasil:

```json
{
  "success": true,
  "message": "Selamat datang di API Tugas 2",
  "endpoints": [
    "GET /",
    "GET /health",
    "GET /students"
  ]
}
```

### 2. GET `/health`

Endpoint ini digunakan untuk mengecek status server.

Perintah pengujian:

```bash
curl http://localhost:3003/health
```

Hasil:

```json
{
  "success": true,
  "status": "up"
}
```

### 3. GET `/students`

Endpoint ini digunakan untuk menampilkan data mahasiswa yang dibaca
dari file `data/students.json` secara asynchronous.

Perintah pengujian:

```bash
curl http://localhost:3003/students
```

Hasil:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Faatin Ashri",
      "nim": "240160221011"
    },
    {
      "id": 2,
      "nama": "Tafdiel Haqqi",
      "nim": "240160221012"
    },
    {
      "id": 3,
      "nama": "Fajar Nugraha",
      "nim": "240160221013"
    }
  ]
}
```

### 4. Endpoint tidak ditemukan

Jika endpoint yang diminta tidak tersedia, server memberikan response
dengan status `404`.

Perintah pengujian:

```bash
curl http://localhost:3003/tidak-ada
```

Hasil:

```json
{
  "success": false,
  "message": "Endpoint GET /tidak-ada tidak ditemukan"
}
```

## Hasil Pengujian

Pengujian dilakukan dengan menjalankan server kemudian mengakses setiap
endpoint menggunakan `curl`.

| No. | Endpoint         | Hasil Pengujian                                                |
| --- | ---------------- | -------------------------------------------------------------- |
| 1   | `GET /`          | Berhasil menampilkan informasi aplikasi dan daftar endpoint    |
| 2   | `GET /health`    | Berhasil menampilkan status server `up`                        |
| 3   | `GET /students`  | Berhasil membaca dan menampilkan data mahasiswa dari file JSON |
| 4   | `GET /tidak-ada` | Berhasil mengembalikan response dengan status `404`            |

Berdasarkan pengujian tersebut, seluruh endpoint yang dibuat dapat berjalan
sesuai dengan fungsi yang diharapkan. Endpoint `/students` juga berhasil
membaca data mahasiswa dari file JSON secara asynchronous, sedangkan
request ke endpoint yang tidak tersedia berhasil ditangani dengan response
status `404`.

## Teknologi

Project ini menggunakan:

* **Node.js** sebagai runtime
* **ES Module (ESM)** sebagai sistem module
* **HTTP Server bawaan Node.js** untuk menangani request dan response
* **File System API** untuk membaca file JSON secara asynchronous
* **JSON** sebagai format data mahasiswa
* **curl** untuk pengujian endpoint



