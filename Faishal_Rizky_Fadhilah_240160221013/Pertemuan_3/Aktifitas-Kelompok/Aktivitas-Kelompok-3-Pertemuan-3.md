# Aktivitas Kelompok — Pertemuan 3

## Identitas Kelompok

**Kelompok:** 3

**Anggota Kelompok:**
1. Devaldy Zikri S
2. Eka Bareeq
3. Faishal Rizky F
4. Fauzan Zainul Arifin

---

# 1. Analisis Runtime

## 1.1 Pengertian Runtime

Runtime merupakan lingkungan tempat program dijalankan. Pada pembelajaran ini, kami membandingkan JavaScript yang dijalankan pada browser dengan JavaScript yang dijalankan menggunakan Node.js.

Walaupun sama-sama menggunakan bahasa JavaScript, browser dan Node.js menyediakan lingkungan serta API yang berbeda sesuai dengan kebutuhan masing-masing.

## 1.2 Perbandingan Browser dan Node.js

| Browser | Node.js |
|---|---|
| Digunakan untuk menjalankan JavaScript pada sisi client | Digunakan untuk menjalankan JavaScript pada sisi server/runtime |
| Memiliki `window` | Memiliki `process` |
| Memiliki `document` untuk mengakses DOM | Memiliki module seperti `node:fs`, `node:http`, dan `node:path` |
| Berinteraksi dengan halaman web | Dapat membuat HTTP server |
| Memiliki Web API | Memiliki Built-in Node.js API |
| Tidak dapat mengakses filesystem secara bebas | Dapat mengakses filesystem melalui API Node.js |

## 1.3 Contoh API Browser

Beberapa contoh API yang umum digunakan pada browser:

```js
window
document
localStorage
fetch()
```

API tersebut berhubungan dengan halaman web, browser, dan interaksi pengguna.

## 1.4 Contoh API Node.js

Node.js menyediakan beberapa module bawaan yang dapat digunakan untuk kebutuhan backend, contohnya:

```js
process
node:http
node:fs
node:fs/promises
node:path
```

Contoh:

```js
import http from "node:http";
```

Module tersebut dapat digunakan untuk membuat HTTP server tanpa membutuhkan framework tambahan.

## 1.5 Kesimpulan Analisis Runtime

Dari analisis yang dilakukan, dapat disimpulkan bahwa browser dan Node.js sama-sama dapat menjalankan JavaScript, tetapi memiliki lingkungan dan API yang berbeda.

Browser lebih berfokus pada kebutuhan aplikasi web di sisi client, sedangkan Node.js menyediakan kemampuan yang diperlukan untuk membangun aplikasi backend seperti HTTP server, pengelolaan file, environment variable, dan proses server.

---

# 2. Perancangan Module

## 2.1 Pengertian Module

Module digunakan untuk memisahkan kode program berdasarkan fungsi atau tanggung jawabnya.

Dengan menggunakan module, kode dapat dibuat lebih terstruktur sehingga setiap file memiliki fungsi yang lebih jelas dan mudah dikembangkan.

## 2.2 Perancangan Module pada Backend

Dalam contoh aplikasi backend sederhana, kode dapat dipisahkan menjadi beberapa bagian:

```text
project/
├── config.js
├── server.js
└── data/
    └── mahasiswa.json
```

### `config.js`

Digunakan untuk menyimpan konfigurasi aplikasi seperti:

- Nama aplikasi
- Port server
- Environment aplikasi

Contoh:

```js
export const APP_NAME = process.env.APP_NAME ?? "API Mahasiswa";
export const PORT = Number(process.env.PORT ?? 3004);
export const NODE_ENV = process.env.NODE_ENV ?? "development";
```

### `server.js`

Digunakan untuk:

- Membuat HTTP server
- Membuat routing
- Menangani request
- Membaca data
- Mengirim response JSON
- Menangani error

### `data/mahasiswa.json`

Digunakan untuk menyimpan data mahasiswa dalam format JSON.

## 2.3 Keuntungan Pemisahan Module

Pemisahan module memberikan beberapa keuntungan:

1. Kode lebih terorganisir.
2. Setiap file memiliki tanggung jawab yang jelas.
3. Kode lebih mudah dibaca.
4. Kode lebih mudah diperbaiki.
5. Pengembangan aplikasi menjadi lebih terstruktur.

## 2.4 Kesimpulan Perancangan Module

Pemisahan module membantu membuat aplikasi backend lebih terstruktur. Konfigurasi dapat dipisahkan dari server, sedangkan data dapat disimpan pada file tersendiri.

---

# 3. Uji Endpoint

## 3.1 Menjalankan Server

Server dijalankan menggunakan Node.js tanpa menggunakan Express.js.

Perintah yang digunakan:

```bash
node server.js
```

Jika server berhasil dijalankan, muncul informasi:

```text
API Mahasiswa berjalan di http://localhost:3004
```

Server kemudian dapat diuji melalui browser atau aplikasi pengujian HTTP.

---

## 3.2 Daftar Endpoint

Endpoint yang digunakan dalam aplikasi:

| No | Method | Endpoint | Status | Keterangan |
|---:|---|---|---:|---|
| 1 | GET | `/` | 200 | Menampilkan informasi API |
| 2 | GET | `/health` | 200 | Mengecek status server |
| 3 | GET | `/mahasiswa` | 200 | Menampilkan data mahasiswa |
| 4 | GET | `/tidak-ada` | 404 | Menguji endpoint yang tidak tersedia |

---

## 3.3 Pengujian Endpoint `GET /`

Request:

```text
GET /
```

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

Status:

```text
200 OK
```

Hasil pengujian menunjukkan bahwa endpoint utama dapat diakses dan memberikan informasi aplikasi serta daftar endpoint.

---

## 3.4 Pengujian Endpoint `GET /health`

Request:

```text
GET /health
```

Response:

```json
{
  "success": true,
  "status": "up",
  "node": "v24.15.0"
}
```

Status:

```text
200 OK
```

Endpoint tersebut menunjukkan bahwa server sedang berjalan dan menampilkan versi Node.js yang digunakan.

---

## 3.5 Pengujian Endpoint `GET /mahasiswa`

Request:

```text
GET /mahasiswa
```

Endpoint ini membaca data dari:

```text
data/mahasiswa.json
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Fauzan Zainul Arifin",
      "nim": "240160221014",
      "jurusan": "Informatika"
    },
    {
      "id": 2,
      "nama": "Faishal Rizky F",
      "nim": "240160221013",
      "jurusan": "Informatika"
    },
    {
      "id": 3,
      "nama": "Devaldy Zikri S",
      "nim": "240160221012",
      "jurusan": "Informatika"
    }
  ]
}
```

Status:

```text
200 OK
```

Hasil pengujian menunjukkan bahwa server berhasil membaca file JSON secara asynchronous dan mengembalikan datanya sebagai response JSON.

---

## 3.6 Ringkasan Hasil Pengujian

| No | Request | Status | Hasil |
|---:|---|---:|---|
| 1 | `GET /` | 200 | Berhasil |
| 2 | `GET /health` | 200 | Berhasil |
| 3 | `GET /mahasiswa` | 200 | Berhasil |
| 4 | `GET /tidak-ada` | 404 | Berhasil ditangani |

---

# 4. Diskusi Error

## 4.1 Pengujian Endpoint yang Tidak Tersedia

Untuk menguji penanganan error, dilakukan request terhadap endpoint yang tidak tersedia.

Request:

```text
GET /tidak-ada
```

Endpoint tersebut tidak terdapat pada routing server.

Server memberikan response:

```json
{
  "success": false,
  "message": "Endpoint GET /tidak-ada tidak ditemukan"
}
```

Status:

```text
404 Not Found
```

## 4.2 Analisis Error 404

Status code `404 Not Found` menunjukkan bahwa server menerima request, tetapi resource atau endpoint yang diminta tidak tersedia.

Dalam aplikasi, kondisi tersebut ditangani dengan routing default:

```js
return sendJSON(response, 404, {
  success: false,
  message: `Endpoint ${method} ${url} tidak ditemukan`,
});
```

Dengan adanya penanganan tersebut, server tidak berhenti ketika menerima request menuju endpoint yang tidak tersedia.

---

## 4.3 Penanganan Error Pembacaan File

Pada endpoint `GET /mahasiswa`, proses pembacaan file dilakukan menggunakan `try/catch`.

Contoh:

```js
try {
  const data = await readFile(fileMahasiswa, "utf8");
  const mahasiswa = JSON.parse(data);

  return sendJSON(response, 200, {
    success: true,
    data: mahasiswa,
  });
} catch (error) {
  return sendJSON(response, 500, {
    success: false,
    message: "Gagal membaca data mahasiswa",
  });
}
```

Jika file tidak dapat dibaca atau terjadi kesalahan ketika memproses JSON, server memberikan response dengan status:

```text
500 Internal Server Error
```

## 4.4 Tujuan Penanganan Error

Penanganan error diperlukan agar aplikasi dapat memberikan informasi yang jelas kepada client ketika terjadi masalah.

Beberapa kondisi yang ditangani:

- Endpoint tidak tersedia → `404`
- File data gagal dibaca → `500`
- Request berhasil diproses → `200`

---

# 5. Analisis Alur Request dan Response

Proses kerja aplikasi dapat digambarkan sebagai berikut:

```text
Client / Browser
       |
       | HTTP Request
       v
   HTTP Server
       |
       | Pemeriksaan Method & URL
       v
     Routing
       |
       +--------------------+
       |                    |
       v                    v
  Endpoint tersedia    Endpoint tidak tersedia
       |                    |
       v                    v
Proses data              Response 404
       |
       v
Baca mahasiswa.json
       |
       v
JSON.parse()
       |
       v
Response JSON
       |
       v
     Client
```

Pada endpoint `GET /mahasiswa`, alurnya adalah:

1. Client mengirim request `GET /mahasiswa`.
2. HTTP server menerima request.
3. Server memeriksa method dan URL.
4. Server menemukan routing `/mahasiswa`.
5. Server membaca `data/mahasiswa.json`.
6. Data JSON diubah menjadi object JavaScript.
7. Server mengirim response JSON.
8. Client menerima data mahasiswa.

---

# 6. Konsep Asynchronous File System

Salah satu bagian penting dalam aktivitas ini adalah membaca file menggunakan asynchronous filesystem API.

Module yang digunakan:

```js
import { readFile } from "node:fs/promises";
```

Proses pembacaan:

```js
const data = await readFile(fileMahasiswa, "utf8");
```

Penggunaan `await` membuat proses asynchronous lebih mudah dibaca karena kode dapat ditulis dengan urutan yang lebih jelas.

Setelah file berhasil dibaca, data JSON diproses menggunakan:

```js
const mahasiswa = JSON.parse(data);
```

Hasilnya kemudian dikirim kepada client menggunakan response JSON.

---

# 7. Pembagian Tanggung Jawab dalam Aplikasi

| Komponen | Tanggung Jawab |
|---|---|
| `config.js` | Menyediakan konfigurasi aplikasi |
| `server.js` | Membuat server dan routing |
| `node:http` | Menangani HTTP request dan response |
| `node:fs/promises` | Membaca file secara asynchronous |
| `node:path` | Membantu menentukan lokasi file |
| `mahasiswa.json` | Menyimpan data mahasiswa |
| Client/Browser | Mengirim request dan menerima response |

Pembagian tanggung jawab tersebut membuat struktur aplikasi lebih mudah dipahami.

---

# 8. Hasil Pembelajaran Kelompok

Berdasarkan aktivitas yang dilakukan, kelompok memperoleh beberapa pemahaman:

1. Memahami perbedaan runtime browser dan Node.js.
2. Memahami fungsi built-in module Node.js.
3. Memahami cara membuat HTTP server tanpa Express.js.
4. Memahami dasar routing berdasarkan method dan URL.
5. Memahami penggunaan environment variable.
6. Memahami cara membaca file JSON menggunakan `node:fs/promises`.
7. Memahami penggunaan asynchronous process dengan `async/await`.
8. Memahami penggunaan HTTP status code.
9. Memahami penanganan error menggunakan `try/catch`.
10. Memahami alur request dan response pada aplikasi backend.

---

# 9. Kesimpulan

Aktivitas kelompok Pertemuan 3 membantu memahami dasar Node.js sebagai runtime yang dapat digunakan untuk membangun aplikasi backend.

Dari analisis runtime, dapat diketahui bahwa browser dan Node.js memiliki lingkungan dan API yang berbeda. Node.js menyediakan built-in module yang dapat digunakan untuk kebutuhan backend seperti membuat HTTP server, membaca file, mengelola path, dan menggunakan environment variable.

Pada bagian perancangan module, kode aplikasi dipisahkan berdasarkan tanggung jawabnya agar lebih terstruktur. Pada bagian uji endpoint, kelompok berhasil menjalankan beberapa endpoint menggunakan HTTP server tanpa Express.js.

Pengujian juga menunjukkan bahwa server dapat memberikan response `200` untuk endpoint yang tersedia dan `404` untuk endpoint yang tidak tersedia. Selain itu, penggunaan `try/catch` pada pembacaan file membantu menangani kemungkinan error dengan response `500`.

Secara keseluruhan, aktivitas ini memberikan pemahaman mengenai hubungan antara runtime, module, HTTP server, routing, filesystem, asynchronous process, request, response, dan error handling dalam aplikasi backend berbasis Node.js.

---

## Dokumentasi

File ini digunakan sebagai dokumentasi aktivitas kelompok Pertemuan 3.

**Kelompok 3:**
- Devaldy Zikri S
- Eka Bareeq
- Faishal Rizky F
- Fauzan Zainul Arifin
