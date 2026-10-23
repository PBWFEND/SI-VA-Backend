
# AKTIVITAS KELOMPOK — PERTEMUAN 3

Node.js Runtime, Module, HTTP Server, dan Error Handling

## Anggota Kelompok 6

1. Dadika Yudiana
2. Faatin Ashri Widiatin
3. Marsya Nurdrianti

## 1. Analisis Runtime

Berdasarkan kode server Node.js yang digunakan, terdapat beberapa API Node.js yang digunakan untuk menjalankan aplikasi backend.

### API Node.js

1. **`node:http`**
   Digunakan untuk membuat HTTP server dan menerima request dari client.

2. **`node:fs/promises`**
   Digunakan untuk membaca file secara asynchronous. Pada aplikasi ini digunakan untuk membaca file `students.json`.

3. **`node:path`**
   Digunakan untuk menyusun lokasi atau path file yang akan dibaca.

### API Browser

Pada aplikasi server ini **tidak menggunakan Browser API** karena kode dijalankan menggunakan runtime Node.js, bukan di dalam browser.

### Kesimpulan

Node.js menyediakan runtime dan API yang memungkinkan JavaScript digunakan untuk membuat server, membaca file, serta mengelola request HTTP tanpa bergantung pada Browser API.

---

# 2. Perancangan Module

Aplikasi dipisahkan menjadi beberapa bagian agar tanggung jawab setiap file lebih jelas.

### Struktur Module

```text
Tugas Individu/
├── data/
│   └── students.json
├── config.js
├── server.js
├── README.md
└── refleksi.md
```

### Pembagian Tanggung Jawab

| File                 | Tanggung Jawab                                                              |
| -------------------- | --------------------------------------------------------------------------- |
| `config.js`          | Menyimpan konfigurasi aplikasi seperti nama aplikasi, port, dan environment |
| `server.js`          | Membuat HTTP server, routing, membaca data, dan mengirim response           |
| `data/students.json` | Menyimpan data mahasiswa                                                    |

Pemisahan module dilakukan agar kode lebih terstruktur dan lebih mudah dipelihara. Konfigurasi tidak perlu ditulis langsung di dalam logic server, sedangkan data mahasiswa disimpan terpisah dari kode program.

---

# 3. Uji Endpoint

Pengujian dilakukan dengan menjalankan server kemudian mengirim request menggunakan `curl`.

### Pengujian 1 — GET `/`

**Method:** `GET`
**URL:** `/`
**Status Code:** `200 OK`

**Response:**

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

Endpoint `/` digunakan untuk memberikan informasi bahwa API berhasil dijalankan serta menampilkan daftar endpoint yang tersedia.

---

### Pengujian 2 — GET `/health`

**Method:** `GET`
**URL:** `/health`
**Status Code:** `200 OK`

**Response:**

```json
{
  "success": true,
  "status": "up"
}
```

Endpoint `/health` digunakan untuk memeriksa apakah server sedang berjalan dengan normal.

---

### Pengujian 3 — GET `/students`

**Method:** `GET`
**URL:** `/students`
**Status Code:** `200 OK`

**Response:**

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

Endpoint `/students` membaca data mahasiswa dari file JSON secara asynchronous kemudian mengirimkannya sebagai response JSON.

---

# 4. Diskusi Error

Untuk menguji penanganan error, nama file yang dibaca oleh server diubah menjadi nama file yang tidak tersedia.

Contohnya, sebelumnya server membaca:

```text
data/students.json
```

kemudian diubah sementara menjadi:

```text
data/students-salah.json
```

Ketika endpoint `/students` dipanggil, server tidak dapat menemukan file tersebut.

Proses pembacaan file menggunakan `try...catch`. Jika terjadi error, server mencatat pesan error dan mengembalikan nilai `null`. Selanjutnya endpoint `/students` memeriksa hasil tersebut dan mengirim response dengan status `500`.

### Response Error

```json
{
  "success": false,
  "message": "Data mahasiswa gagal dibaca"
}
```

### Analisis

Error terjadi karena file yang dibutuhkan oleh server tidak ditemukan. Penanganannya dilakukan dengan menggunakan `try...catch` agar aplikasi tidak langsung berhenti ketika proses pembacaan file gagal.

Status **500 Internal Server Error** digunakan karena masalah terjadi pada sisi server ketika server gagal membaca data yang dibutuhkan.

Setelah pengujian selesai, nama file dikembalikan menjadi:

```text
data/students.json
```

agar aplikasi dapat berjalan kembali seperti semula.

---

# Kesimpulan

Berdasarkan aktivitas kelompok, dapat disimpulkan bahwa Node.js menyediakan runtime dan API yang diperlukan untuk membangun HTTP server serta mengakses filesystem. Pembagian module membantu memisahkan konfigurasi, logic server, dan data sehingga struktur aplikasi lebih mudah dipahami dan dikembangkan.

Pengujian endpoint juga menunjukkan bahwa setiap endpoint dapat memiliki status code dan response yang berbeda sesuai dengan kondisi request. Selain itu, penggunaan `try...catch` membantu menangani error ketika file yang dibutuhkan server tidak dapat dibaca.
