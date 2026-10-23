# Tugas 2 — Project Node.js dan HTTP Server Sederhana

**Mata Kuliah:** Pemrograman Berbasis Web Back End
**Pertemuan:** 3 — Node.js Fundamentals
**Studi Kasus:** Sistem Informasi Absensi

**Nama:** Della Kartika
**NIM:** 240160221008

---

## 1. Deskripsi Project

Project ini merupakan implementasi sederhana **Sistem Informasi Absensi** menggunakan Node.js dan HTTP Server tanpa menggunakan Express.js.

Project dibuat untuk menerapkan materi pada Pertemuan 3, yaitu:

* Module ESM
* Konfigurasi aplikasi
* Environment variable
* HTTP Server
* Routing sederhana
* JSON response
* HTTP status code
* File System asynchronous
* Pembacaan data dari file JSON
* Penanganan error

---

## 2. Tujuan

Tujuan dari pembuatan project ini adalah:

1. Membuat module konfigurasi menggunakan ESM.
2. Memisahkan konfigurasi aplikasi dari kode server.
3. Membuat HTTP Server menggunakan module bawaan `node:http`.
4. Membuat minimal tiga endpoint dengan method `GET`.
5. Membuat helper untuk mengirim response dalam format JSON.
6. Membaca data dari file JSON menggunakan operasi asynchronous.
7. Menangani endpoint yang tidak tersedia menggunakan status `404`.
8. Menguji API menggunakan perintah `curl`.

---

## 3. Teknologi yang Digunakan

Project ini menggunakan:

* **Node.js 20+**
* **JavaScript ESM**
* `node:http`
* `node:path`
* `node:fs/promises`
* JSON
* Git dan GitHub

Project dibuat **tanpa Express.js** dan tidak menggunakan library eksternal.

---

## 4. Struktur Folder

```text
pertemuan-3/
└── aktivitas-kelompok/
    ├── latihan-individu/
    │
    └── tugas-2/
        ├── data/
        │   └── students.json
        ├── config.js
        ├── package.json
        ├── README.md
        └── server.js
```

### Penjelasan Struktur

| File/Folder     | Fungsi                                        |
| --------------- | --------------------------------------------- |
| `data/`         | Folder untuk menyimpan data dalam format JSON |
| `students.json` | Menyimpan data mahasiswa                      |
| `config.js`     | Menyimpan konfigurasi aplikasi                |
| `package.json`  | Mengatur informasi project dan penggunaan ESM |
| `server.js`     | Menjalankan HTTP Server dan routing           |
| `README.md`     | Dokumentasi project                           |

---

## 5. Konfigurasi Project

Project menggunakan JavaScript ESM. Hal tersebut diatur pada file `package.json`.

Contoh:

```json
{
  "name": "sistem-informasi-absensi",
  "version": "1.0.0",
  "description": "Tugas 2 Node.js dan HTTP Server Sederhana",
  "type": "module"
}
```

Property `"type": "module"` digunakan agar project dapat menggunakan syntax ESM seperti:

```js
import http from "node:http";
```

dan:

```js
export const APP_NAME = "...";
```

---

## 6. Konfigurasi Aplikasi

File `config.js` digunakan untuk menyimpan konfigurasi aplikasi.

Konfigurasi yang digunakan terdiri dari:

* Nama aplikasi
* Port server
* Environment aplikasi

Kode konfigurasi:

```js
export const APP_NAME =
  process.env.APP_NAME ?? "Sistem Informasi Absensi";

export const PORT =
  Number(process.env.PORT ?? 3004);

export const NODE_ENV =
  process.env.NODE_ENV ?? "development";
```

Nilai default yang digunakan:

```text
APP_NAME  = Sistem Informasi Absensi
PORT      = 3004
NODE_ENV  = development
```

Dengan menggunakan `process.env`, nilai konfigurasi dapat diubah tanpa mengubah kode utama.

---

## 7. Data Mahasiswa

Data mahasiswa disimpan pada:

```text
data/students.json
```

Isi file:

```json
[
  {
    "nim": "240160221008",
    "nama": "Della Kartika"
  },
  {
    "nim": "240160221022",
    "nama": "Marsya Nurdrianti"
  }
]
```

File tersebut digunakan sebagai sumber data untuk endpoint:

```text
GET /students
```

---

## 8. HTTP Server

HTTP Server dibuat menggunakan module bawaan Node.js:

```js
import http from "node:http";
```

Server dibuat menggunakan:

```js
const server = http.createServer(...)
```

Server berjalan pada port:

```text
3004
```

Sehingga alamat server adalah:

```text
http://localhost:3004
```

---

## 9. Endpoint API

Project memiliki tiga endpoint utama dengan method `GET`.

| Method | Endpoint      | Fungsi                         | Status |
| ------ | ------------- | ------------------------------ | ------ |
| GET    | `/`           | Menampilkan informasi aplikasi | 200    |
| GET    | `/health`     | Mengecek status server         | 200    |
| GET    | `/students`   | Menampilkan data mahasiswa     | 200    |
| GET    | endpoint lain | Endpoint tidak ditemukan       | 404    |

---

## 10. Endpoint GET `/`

Endpoint `/` merupakan endpoint utama yang digunakan untuk menampilkan informasi aplikasi dan daftar endpoint yang tersedia.

### Request

```bash
curl -i http://localhost:3004/
```

### Response

```json
{
  "success": true,
  "message": "Selamat datang di Sistem Informasi Absensi",
  "environment": "development",
  "endpoints": [
    "GET /",
    "GET /health",
    "GET /students"
  ]
}
```

Status response:

```text
200 OK
```

---

## 11. Endpoint GET `/health`

Endpoint `/health` digunakan untuk mengecek apakah server sedang berjalan.

### Request

```bash
curl -i http://localhost:3004/health
```

### Response

```json
{
  "success": true,
  "status": "up",
  "node": "v24.x.x"
}
```

Status response:

```text
200 OK
```

Informasi `node` menunjukkan versi Node.js yang sedang digunakan oleh server.

---

## 12. Endpoint GET `/students`

Endpoint `/students` digunakan untuk mengambil data mahasiswa dari file:

```text
data/students.json
```

### Request

```bash
curl -i http://localhost:3004/students
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "nim": "240160221008",
      "nama": "Della Kartika"
    },
    {
      "nim": "240160221022",
      "nama": "Marsya Nurdrianti"
    }
  ]
}
```

Status response:

```text
200 OK
```

---

## 13. Pembacaan File Secara Asynchronous

Project menggunakan module:

```js
import { readFile } from "node:fs/promises";
```

Untuk membaca file JSON, dibuat function:

```js
const bacaJSON = async (namaFile) => {
  const filePath = path.join(import.meta.dirname, namaFile);

  const isiFile = await readFile(filePath, "utf8");

  return JSON.parse(isiFile);
};
```

Function tersebut menggunakan:

* `async`
* `await`
* `readFile()`
* `JSON.parse()`

File yang dibaca adalah:

```text
data/students.json
```

Data tersebut kemudian dikirimkan melalui endpoint:

```text
GET /students
```

Dengan demikian, project telah menerapkan operasi file secara asynchronous.

---

## 14. Helper JSON Response

Untuk membuat response JSON, digunakan helper:

```js
const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  response.end(JSON.stringify(payload, null, 2));
};
```

Function ini menerima tiga parameter:

| Parameter    | Fungsi                              |
| ------------ | ----------------------------------- |
| `response`   | Response dari HTTP Server           |
| `statusCode` | Status HTTP response                |
| `payload`    | Data yang dikirim dalam format JSON |

Helper digunakan pada seluruh endpoint sehingga response memiliki format yang konsisten.

---

## 15. Penanganan Endpoint Tidak Ditemukan

Server memberikan status `404 Not Found` apabila client mengakses endpoint yang tidak tersedia.

### Pengujian

```bash
curl -i http://localhost:3004/tidak-ada
```

### Response

```text
HTTP/1.1 404 Not Found
```

```json
{
  "success": false,
  "message": "Endpoint GET /tidak-ada tidak ditemukan"
}
```

Hal ini menunjukkan bahwa server sudah memiliki penanganan untuk endpoint yang tidak tersedia.

---

## 16. Penanganan Error Pembacaan File

Pada endpoint `/students`, proses pembacaan file dibungkus menggunakan `try...catch`.

```js
try {
  const students = await bacaJSON("data/students.json");

  return sendJSON(response, 200, {
    success: true,
    data: students,
  });
} catch (error) {
  console.error(
    "Gagal membaca data students:",
    error.message
  );

  return sendJSON(response, 500, {
    success: false,
    message: "Gagal membaca data students",
  });
}
```

Jika file `students.json` mengalami masalah atau tidak dapat dibaca, server memberikan response:

```text
500 Internal Server Error
```

---

## 17. Cara Menjalankan Project

Pastikan terminal berada di folder:

```text
tugas-2
```

Kemudian jalankan:

```bash
node server.js
```

Jika berhasil, terminal akan menampilkan:

```text
Sistem Informasi Absensi berjalan di http://localhost:3004
```

Server tetap berjalan selama terminal belum dihentikan.

Untuk menghentikan server:

```text
Ctrl + C
```

---

## 18. Pengujian API

Setelah server berjalan, buka terminal kedua untuk melakukan pengujian.

### 18.1 Pengujian Endpoint `/`

```bash
curl -i http://localhost:3004/
```

Hasil yang diharapkan:

```text
HTTP/1.1 200 OK
```

---

### 18.2 Pengujian Endpoint `/health`

```bash
curl -i http://localhost:3004/health
```

Hasil yang diharapkan:

```text
HTTP/1.1 200 OK
```

---

### 18.3 Pengujian Endpoint `/students`

```bash
curl -i http://localhost:3004/students
```

Hasil yang diharapkan:

```text
HTTP/1.1 200 OK
```

Response berisi data dari `students.json`.

---

### 18.4 Pengujian Endpoint Tidak Tersedia

```bash
curl -i http://localhost:3004/tidak-ada
```

Hasil yang diharapkan:

```text
HTTP/1.1 404 Not Found
```

---

## 19. Pengujian Environment Variable

Selain menggunakan konfigurasi default, nama aplikasi dapat diubah menggunakan environment variable.

Hentikan server terlebih dahulu:

```text
Ctrl + C
```

Kemudian jalankan:

```bash
APP_NAME="Absensi Mahasiswa" node server.js
```

Server akan menampilkan:

```text
Absensi Mahasiswa berjalan di http://localhost:3004
```

Kemudian lakukan request:

```bash
curl -i http://localhost:3004/
```

Response akan menggunakan nama aplikasi yang telah diubah:

```json
{
  "success": true,
  "message": "Selamat datang di Absensi Mahasiswa"
}
```

Pengujian ini menunjukkan bahwa environment variable dapat digunakan untuk mengubah konfigurasi aplikasi tanpa mengubah kode pada `server.js`.

---

## 20. HTTP Status Code

Status code yang digunakan dalam project:

| Status                      | Keterangan                          |
| --------------------------- | ----------------------------------- |
| `200 OK`                    | Request berhasil                    |
| `404 Not Found`             | Endpoint tidak ditemukan            |
| `500 Internal Server Error` | Terjadi kesalahan saat membaca data |

---

## 21. Hasil yang Dicapai

Project telah menerapkan beberapa konsep Node.js Fundamentals, yaitu:

* [x] Module ESM
* [x] Module konfigurasi
* [x] Environment variable
* [x] HTTP Server
* [x] Routing sederhana
* [x] Minimal 3 endpoint GET
* [x] Helper JSON response
* [x] HTTP status code
* [x] Pembacaan file secara asynchronous
* [x] Penanganan error
* [x] Endpoint 404
* [x] Pengujian menggunakan `curl`

---

## 22. Kesimpulan

Tugas 2 berhasil membuat HTTP Server sederhana menggunakan Node.js tanpa Express.js dengan studi kasus **Sistem Informasi Absensi**.

Project memiliki tiga endpoint GET, yaitu `/`, `/health`, dan `/students`. Project juga menggunakan module konfigurasi ESM, environment variable, helper JSON response, serta pembacaan data dari file `students.json` secara asynchronous.

Selain itu, server dapat menangani endpoint yang tidak tersedia dengan status `404` dan kesalahan pembacaan file dengan status `500`.

Dengan project ini, konsep dasar Node.js Fundamentals pada Pertemuan 3 dapat diterapkan dalam sebuah HTTP Server sederhana.
