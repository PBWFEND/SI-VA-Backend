# Aktivitas Kelompok — Pertemuan 4

## Express.js: Middleware, Routing, dan Pengujian Request

---

## Identitas Kelompok

**Kelompok:** 3

### Anggota Kelompok

| No | Nama |
|---:|---|
| 1 | Devaldy Zikri S |
| 2 | Eka Bareeq |
| 3 | Faishal Rizky F |
| 4 | Fauzan Zainul Arifin |

---

# 1. Pemetaan Alur

Pada Pertemuan 3, aplikasi menggunakan module `node:http` untuk membuat server dan menangani request secara manual berdasarkan method dan URL.

Pada Pertemuan 4, salah satu route tersebut dikembangkan menggunakan **Express.js**. Express.js digunakan untuk membuat routing, middleware, parsing JSON, serta penanganan error menjadi lebih terstruktur.

## Alur Sebelum Menggunakan Express.js

```text
Client
   ↓
HTTP Request
   ↓
Server node:http
   ↓
Pengecekan Method dan URL
   ↓
Handler
   ↓
Response JSON
```

## Alur Setelah Menggunakan Express.js

```text
Client
   ↓
HTTP Request
   ↓
Logger Middleware
   ↓
JSON Parser
   ↓
Route Express.js
   ↓
Handler
   ↓
Response JSON
```

Apabila endpoint tidak ditemukan:

```text
Client
   ↓
HTTP Request
   ↓
Logger
   ↓
JSON Parser
   ↓
Route
   ↓
404 Handler
   ↓
Response JSON 404
```

Apabila terjadi kesalahan pada server:

```text
Client
   ↓
HTTP Request
   ↓
Logger
   ↓
JSON Parser
   ↓
Route
   ↓
Error
   ↓
Error Middleware
   ↓
Response JSON 500
```

---

# 2. Susunan Middleware

Urutan middleware yang digunakan:

```text
1. Logger
2. express.json()
3. Route
4. Handler 404
5. Error Handler
```

## 2.1 Logger Middleware

Logger digunakan untuk mencatat setiap request yang masuk ke server.

Contoh:

```text
GET /buku
GET /buku/1
POST /buku
```

Logger diletakkan di bagian awal agar setiap request dapat dicatat, termasuk request menuju endpoint yang tidak tersedia.

Contoh implementasi:

```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
```

## 2.2 JSON Parser

Express menyediakan middleware:

```js
app.use(express.json());
```

Middleware tersebut digunakan agar aplikasi dapat membaca request body dalam format JSON.

Contoh:

```json
{
  "judul": "Belajar Express.js",
  "penulis": "Fauzan Zainul Arifin"
}
```

## 2.3 Route

Request diteruskan ke route yang sesuai.

Contoh route:

```text
GET  /buku
GET  /buku/:id
POST /buku
```

Route parameter digunakan untuk mengambil data berdasarkan ID.

## 2.4 Handler 404

Jika URL yang diminta tidak memiliki route yang sesuai, request diteruskan ke handler `404`.

Contoh:

```json
{
  "success": false,
  "message": "Endpoint tidak ditemukan"
}
```

## 2.5 Error Middleware

Error middleware digunakan untuk menangani error yang terjadi pada aplikasi.

Contoh:

```js
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server"
  });
});
```

Error middleware diletakkan paling akhir.

---

# 3. Pengujian Request Menggunakan cURL

Pengujian dilakukan untuk memastikan route, middleware, parameter, validasi body, handler `404`, dan error middleware bekerja dengan baik.

Server dijalankan menggunakan:

```bash
npm start
```

Server berjalan pada:

```text
http://localhost:3006
```

---

# 4. Pengujian GET Daftar Data

## Request

```bash
curl http://localhost:3006/buku
```

**Method:** `GET`

**URL:** `http://localhost:3006/buku`

**Status Code:** `200 OK`

Contoh response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Sata"
    },
    {
      "id": 2,
      "nama": "Devaldy"
    }
  ]
}
```

Request ini digunakan untuk memastikan endpoint daftar data dapat diakses dengan benar.

---

# 5. Pengujian GET Detail Menggunakan Route Parameter

## Request

```bash
curl http://localhost:3006/buku/1
```

**Method:** `GET`

**URL:** `http://localhost:3006/buku/1`

**Status Code:** `200 OK`

Format route:

```text
/buku/:id
```

Angka setelah `/buku/` merupakan nilai parameter `id`.

Contoh:

```text
/buku/1
/buku/2
/buku/3
```

---

# 6. Pengujian Data yang Tidak Ditemukan

## Request

```bash
curl http://localhost:3006/buku/999
```

**Method:** `GET`

**Status Code:** `404 Not Found`

Contoh response:

```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

Pengujian ini memastikan aplikasi dapat menangani ID yang tidak tersedia.

---

# 7. Pengujian Query Parameter

Query parameter digunakan untuk memberikan parameter tambahan melalui URL.

## Request

```bash
curl "http://localhost:3006/buku?tersedia=true"
```

**Method:** `GET`

**URL:** `/buku?tersedia=true`

**Query Parameter:** `tersedia=true`

**Status Code:** `200 OK`

Contoh ini menunjukkan penggunaan query parameter untuk melakukan filtering data.

Perbedaannya:

```text
Route Parameter:
GET /buku/1

Query Parameter:
GET /buku?tersedia=true
```

---

# 8. Pengujian POST Data

## Request

```bash
curl -X POST http://localhost:3006/buku \
  -H "Content-Type: application/json" \
  -d '{"judul":"Belajar Express.js","penulis":"Fauzan Zainul Arifin"}'
```

**Method:** `POST`

**Status Code:** `201 Created`

Request body:

```json
{
  "judul": "Belajar Express.js",
  "penulis": "Fauzan Zainul Arifin"
}
```

Contoh response:

```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "judul": "Belajar Express.js",
    "penulis": "Fauzan Zainul Arifin"
  }
}
```

Status `201 Created` digunakan karena request berhasil membuat data baru.

---

# 9. Pengujian POST dengan Body Tidak Lengkap

## Request

```bash
curl -X POST http://localhost:3006/buku \
  -H "Content-Type: application/json" \
  -d '{"judul":"Belajar Express.js"}'
```

Field `penulis` tidak diberikan.

**Method:** `POST`

**Status Code:** `400 Bad Request`

Contoh response:

```json
{
  "success": false,
  "message": "Field judul dan penulis wajib diisi"
}
```

Status `400 Bad Request` digunakan karena request dari client tidak memenuhi data yang diwajibkan.

---

# 10. Pengujian Endpoint yang Tidak Tersedia

## Request

```bash
curl http://localhost:3006/endpoint-tidak-ada
```

**Method:** `GET`

**Status Code:** `404 Not Found`

Response:

```json
{
  "success": false,
  "message": "Endpoint tidak ditemukan"
}
```

Pengujian ini memastikan handler `404` telah bekerja.

---

# 11. Rekapitulasi Hasil Pengujian

| No | Method | URL | Status Code | Hasil |
|---:|---|---|---:|---|
| 1 | GET | `/buku` | 200 | Berhasil mengambil daftar data |
| 2 | GET | `/buku/1` | 200 | Berhasil mengambil detail data |
| 3 | GET | `/buku/999` | 404 | Data tidak ditemukan |
| 4 | GET | `/buku?tersedia=true` | 200 | Query parameter berhasil digunakan |
| 5 | POST | `/buku` | 201 | Data berhasil ditambahkan |
| 6 | POST | `/buku` | 400 | Body request tidak lengkap |
| 7 | GET | `/endpoint-tidak-ada` | 404 | Endpoint tidak tersedia |

---

# 12. Alasan Penggunaan Status Code

| Status Code | Keterangan | Penggunaan |
|---:|---|---|
| `200 OK` | Request berhasil | GET berhasil mengambil data |
| `201 Created` | Data berhasil dibuat | POST berhasil menambahkan data |
| `400 Bad Request` | Request tidak valid | Body tidak lengkap atau format tidak sesuai |
| `404 Not Found` | Data/endpoint tidak ditemukan | ID tidak tersedia atau route tidak ada |
| `500 Internal Server Error` | Kesalahan pada server | Error yang tidak dapat diproses aplikasi |

Penggunaan status code yang sesuai membantu client mengetahui kondisi dari request yang dikirim.

---

# 13. Review Kode

Berdasarkan hasil review kelompok, Express.js memberikan struktur aplikasi yang lebih sederhana dan mudah dipahami dibandingkan penggunaan `node:http` secara langsung.

Beberapa alasan penggunaan Express.js:

1. Routing lebih mudah dibuat dan dibaca.
2. Middleware dapat digunakan untuk kebutuhan umum.
3. Request JSON dapat diproses menggunakan `express.json()`.
4. Logger dapat mencatat request yang masuk.
5. Route parameter dapat digunakan untuk mengambil data berdasarkan ID.
6. Query parameter dapat digunakan untuk filtering atau pencarian.
7. Response dapat diberikan dalam format JSON.
8. Status code dapat disesuaikan dengan kondisi request.
9. Handler `404` dapat dibuat secara terpisah.
10. Error middleware dapat menangani error secara terpusat.

---

# 14. Struktur Middleware

```text
                    REQUEST
                       │
                       ▼
               ┌───────────────┐
               │    Logger     │
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │ express.json()│
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │     Route     │
               └───────┬───────┘
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        Route ditemukan      Route tidak ada
             │                   │
             ▼                   ▼
          Handler            404 Handler
             │                   │
             └─────────┬─────────┘
                       │
                       ▼
                Response JSON

       Jika terjadi error pada proses:
                       │
                       ▼
                Error Handler
                       │
                       ▼
                Response 500
```

---

