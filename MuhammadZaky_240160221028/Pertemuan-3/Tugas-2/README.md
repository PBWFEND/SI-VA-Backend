# Tugas 2 — Node.js Fundamentals

## Identitas

**Nama:** Muhammad Zaky
**NIM:** 240160221028 
**Mata Kuliah:** Pemrograman Backend Web

---

## 1. Deskripsi

Tugas ini merupakan implementasi sederhana REST API menggunakan Node.js tanpa menggunakan Express.js.

Aplikasi dibuat menggunakan module bawaan Node.js seperti:

- `node:http`
- `node:fs/promises`
- `node:path`

Data mahasiswa disimpan dalam file JSON dan dibaca secara asynchronous menggunakan `readFile()`.

Tugas ini bertujuan untuk memahami dasar pembuatan backend menggunakan Node.js, mulai dari pembuatan HTTP server, routing, penggunaan environment variable, pembacaan file, hingga penanganan error.

---

## 2. Struktur Folder

Struktur folder yang digunakan dalam tugas ini adalah:

```text
Tugas-2/
├── data/
│   └── mahasiswa.json
├── config.js
├── server.js
├── README.md
└── refleksi.md
```

### Penjelasan File

| File/Folder | Fungsi |
|---|---|
| `data/` | Menyimpan data dalam bentuk JSON |
| `data/mahasiswa.json` | Menyimpan data mahasiswa |
| `config.js` | Mengatur konfigurasi aplikasi |
| `server.js` | Menjalankan HTTP server dan routing |
| `README.md` | Dokumentasi tugas |
| `refleksi.md` | Refleksi hasil pembelajaran |

---

## 3. Konfigurasi Aplikasi

Konfigurasi aplikasi terdapat pada file `config.js`.

Konfigurasi yang digunakan:

```text
APP_NAME = API Mahasiswa
PORT = 3004
NODE_ENV = development
```

Contoh konfigurasi:

```js
export const APP_NAME = process.env.APP_NAME ?? "API Mahasiswa";
export const PORT = Number(process.env.PORT ?? 3004);
export const NODE_ENV = process.env.NODE_ENV ?? "development";
```

Environment variable digunakan agar konfigurasi aplikasi dapat diubah tanpa harus mengubah langsung kode program.

Contoh menjalankan server dengan konfigurasi berbeda:

```bash
APP_NAME="Data Mahasiswa" PORT=3005 node server.js
```

---

## 4. Data Mahasiswa

Data mahasiswa disimpan pada file:

```text
data/mahasiswa.json
```

Data yang digunakan:

```json
[
  {
    "id": 1,
    "nama": "Muhammad Zaky",
    "nim": "240160221028",
    "jurusan": "Sistem Informasi"
  },
  {
    "id": 2,
    "nama": "Sandika Yusuf Permana",
    "nim": "240160221044",
    "jurusan": "Sistem Informasi"
  },
  {
    "id": 3,
    "nama": "Devaldy Zikri S",
    "nim": "240160221050",
    "jurusan": "Sistem Informasi"
  }
]
```

Data tersebut digunakan oleh endpoint `GET /mahasiswa`.

---

## 5. Endpoint API

API memiliki beberapa endpoint sebagai berikut:

| Method | Endpoint | Status | Keterangan |
|---|---|---:|---|
| GET | `/` | 200 | Menampilkan informasi API |
| GET | `/health` | 200 | Mengecek status server |
| GET | `/mahasiswa` | 200 | Menampilkan data mahasiswa |
| GET | `/tidak-ada` | 404 | Contoh endpoint yang tidak tersedia |

---

## 6. Endpoint GET `/`

Endpoint:

```text
GET /
```

Endpoint ini digunakan untuk menampilkan informasi dasar aplikasi dan daftar endpoint yang tersedia.

Response:

```json
{
  "success": true,
  "message": "Selamat datang di API Mahasiswa",
  "endpoints": [
    "GET /",
    "GET /health",
    "GET /mahasiswa"
  ]
}
```

Status code:

```text
200 OK
```

---

## 7. Endpoint GET `/health`

Endpoint:

```text
GET /health
```

Endpoint ini digunakan untuk mengetahui apakah server sedang berjalan.

Response:

```json
{
  "success": true,
  "status": "up",
  "node": "v24.15.0"
}
```

Status code:

```text
200 OK
```

Endpoint ini juga menampilkan versi Node.js yang digunakan oleh server.

---

## 8. Endpoint GET `/mahasiswa`

Endpoint:

```text
GET /mahasiswa
```

Endpoint ini digunakan untuk mengambil seluruh data mahasiswa dari file:

```text
data/mahasiswa.json
```

Data dibaca menggunakan `readFile()` dari module:

```js
node:fs/promises
```

Kemudian isi file JSON diubah menjadi object JavaScript menggunakan:

```js
JSON.parse()
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Muhammad Zaky",
      "nim": "240160221028",
      "jurusan": "Sistem Informasi"
    },
    {
      "id": 2,
      "nama": "Sandika Yusuf Permana",
      "nim": "240160221044",
      "jurusan": "Sistem Informasi"
    },
    {
      "id": 3,
      "nama": "Devaldy Zikri S",
      "nim": "240160221050",
      "jurusan": "Sistem Informasi"
    }
  ]
}
```

Status code:

```text
200 OK
```

---

## 9. Penanganan Error

Server memiliki penanganan error untuk endpoint yang tidak tersedia.

Contoh request:

```text
GET /tidak-ada
```

Response:

```json
{
  "success": false,
  "message": "Endpoint GET /tidak-ada tidak ditemukan"
}
```

Status code:

```text
404 Not Found
```

Selain error pada routing, proses pembacaan file mahasiswa juga menggunakan `try/catch`.

Jika terjadi masalah ketika membaca file JSON, server memberikan response:

```json
{
  "success": false,
  "message": "Gagal membaca data mahasiswa"
}
```

dengan status:

```text
500 Internal Server Error
```

Penanganan error digunakan agar server tetap dapat memberikan response yang sesuai ketika terjadi masalah pada proses pembacaan data atau request menuju endpoint yang tidak tersedia.

---

## 10. Cara Menjalankan Server

Pastikan terminal berada pada folder:

```text
Pertemuan-3/Tugas-2/
```

Kemudian jalankan:

```bash
node server.js
```

Jika berhasil, akan muncul:

```text
API Mahasiswa berjalan di http://localhost:3004
```

Server dapat diakses melalui browser atau aplikasi pengujian HTTP.

---

## 11. Pengujian API

Pengujian dilakukan dengan menjalankan server menggunakan:

```bash
node server.js
```

Kemudian beberapa endpoint diuji.

| No | Method | Endpoint | Hasil |
|---:|---|---|---|
| 1 | GET | `/` | 200 OK |
| 2 | GET | `/health` | 200 OK |
| 3 | GET | `/mahasiswa` | 200 OK |
| 4 | GET | `/tidak-ada` | 404 Not Found |

### 11.1 Pengujian GET `/`

Request:

```text
GET /
```

Hasil:

```text
200 OK
```

Server berhasil memberikan informasi aplikasi dan daftar endpoint yang tersedia.

### 11.2 Pengujian GET `/health`

Request:

```text
GET /health
```

Hasil:

```text
200 OK
```

Response menunjukkan bahwa server dalam keadaan:

```text
status: up
```

serta menampilkan versi Node.js yang digunakan.

### 11.3 Pengujian GET `/mahasiswa`

Request:

```text
GET /mahasiswa
```

Hasil:

```text
200 OK
```

Server berhasil membaca data dari:

```text
data/mahasiswa.json
```

dan mengembalikan data mahasiswa dalam format JSON.

### 11.4 Pengujian GET `/tidak-ada`

Request:

```text
GET /tidak-ada
```

Hasil:

```text
404 Not Found
```

Server berhasil menangani request menuju endpoint yang tidak tersedia dan memberikan response error.

---

## 12. Teknologi yang Digunakan

Teknologi dan module yang digunakan dalam tugas ini adalah:

- Node.js
- JavaScript ES Module
- `node:http`
- `node:fs/promises`
- `node:path`
- JSON
- HTTP
- Environment Variable

Pada tugas ini tidak digunakan Express.js karena tujuan tugas adalah memahami dasar pembuatan HTTP server menggunakan Node.js secara langsung.

---

## 13. Konsep yang Dipelajari

Melalui tugas ini, beberapa konsep yang dipelajari adalah:

1. Membuat HTTP server menggunakan Node.js.
2. Membuat routing berdasarkan HTTP method dan URL.
3. Menggunakan built-in module Node.js.
4. Menggunakan environment variable.
5. Membaca file menggunakan asynchronous filesystem API.
6. Mengolah data JSON menggunakan `JSON.parse()`.
7. Mengirim response dalam format JSON.
8. Menggunakan HTTP status code.
9. Menangani error menggunakan `try/catch`.
10. Memahami dasar backend tanpa menggunakan framework Express.js.

---

## 14. Kesimpulan

Tugas ini memberikan pemahaman mengenai dasar pembuatan backend menggunakan Node.js tanpa menggunakan framework Express.js.

Aplikasi berhasil menjalankan HTTP server, menyediakan beberapa endpoint GET, membaca data mahasiswa dari file JSON secara asynchronous, menggunakan environment variable, serta menangani endpoint yang tidak tersedia menggunakan HTTP status code `404`.

Dengan mengerjakan tugas ini, konsep dasar Node.js sebagai runtime backend menjadi lebih mudah dipahami sebelum menggunakan framework seperti Express.js pada pertemuan berikutnya.