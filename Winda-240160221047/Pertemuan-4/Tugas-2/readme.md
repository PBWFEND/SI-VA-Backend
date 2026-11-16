# TUGAS 2 — REST ENDPOINT DENGAN EXPRESS.JS


|  |  |
|---|---|
| Nama | Winda Nurhidayah |
| NIM | 240160221047 |
| Mata Kuliah | Pemrograman Berbasis Web Back End |
| Pertemuan | 4 |

---

## 1. Deskripsi

Pada tugas ini dibuat sebuah REST API menggunakan Express.js dengan resource **Buku**.

Aplikasi ini digunakan untuk menampilkan data buku, mencari buku berdasarkan ID, melakukan filter berdasarkan ketersediaan, menambahkan data buku baru, dan menghapus data buku.

Fitur yang diterapkan dalam tugas ini meliputi:

- Pemisahan file `app.js` dan `server.js`.
- Middleware JSON parser.
- Middleware logger.
- Route parameter.
- Query parameter.
- POST dan DELETE request.
- Validasi input.
- Penggunaan HTTP status code yang sesuai.
- Handler 404 untuk route yang tidak ditemukan.
- Error middleware.

## 2. Teknologi yang Digunakan

Teknologi yang digunakan dalam pembuatan REST API ini adalah:

1. Node.js
2. Express.js
3. JavaScript (ES Modules)
4. JSON
5. Postman

## 3. Struktur Folder

Struktur folder proyek adalah sebagai berikut:

```text
Tugas-2/
├── app.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

**Keterangan:**

- `app.js`: Mengatur konfigurasi Express, middleware, routing, dan error handler.
- `server.js`: Menjalankan server pada port yang telah ditentukan.
- `package.json`: Menyimpan informasi proyek, dependency, dan script.
- `package-lock.json`: Menyimpan detail versi dependency.
- `README.md`: Dokumentasi proyek dan hasil pengujian.

## 4. Cara Menjalankan Project

Berikut langkah-langkah untuk menjalankan proyek:

**1. Masuk ke folder proyek**

```bash
cd Tugas-2
```

**2. Install dependency**

```bash
npm install
```

**3. Jalankan server**

```bash
npm start
```

Jika berhasil, terminal akan menampilkan pesan:

```text
Express API berjalan di http://localhost:3004
```

Setelah server berjalan, API dapat diuji menggunakan Postman melalui alamat:

```text
http://localhost:3004
```

## 5. Endpoint yang Tersedia

Berikut daftar endpoint yang tersedia pada REST API Buku:

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Menampilkan informasi API |
| GET | `/health` | Mengecek kondisi API |
| GET | `/api/buku` | Menampilkan semua daftar buku |
| GET | `/api/buku?tersedia=true` | Filter buku berdasarkan ketersediaan |
| GET | `/api/buku/:id` | Menampilkan detail buku berdasarkan ID |
| POST | `/api/buku` | Menambahkan data buku baru |
| DELETE | `/api/buku/:id` | Menghapus buku berdasarkan ID |
| GET | `/salah` | Menguji endpoint yang tidak ditemukan (404) |

## 6. Pengujian Menggunakan Postman

Pengujian dilakukan menggunakan Postman untuk memastikan setiap endpoint dapat berjalan sesuai fungsinya dan memberikan HTTP status code yang sesuai.

### 6.1 GET Root (Informasi API)

- **Method:** GET
- **Request:** `http://localhost:3004/`
- **Hasil:** `200 OK`

Endpoint berhasil menampilkan informasi REST API Buku dan daftar endpoint yang tersedia.

### 6.2 GET Health Check

- **Method:** GET
- **Request:** `http://localhost:3004/health`
- **Hasil:** `200 OK`

Endpoint menampilkan status server `"up"` yang menandakan sistem berjalan normal.

### 6.3 GET Semua Buku

- **Method:** GET
- **Request:** `http://localhost:3004/api/buku`
- **Hasil:** `200 OK`

Endpoint berhasil mengembalikan seluruh daftar data buku.

### 6.4 GET Filter Buku (Query Parameter)

- **Method:** GET
- **Request:** `http://localhost:3004/api/buku?tersedia=true`
- **Hasil:** `200 OK`

Endpoint berhasil menampilkan daftar buku yang tersedia berdasarkan query parameter `tersedia=true`.

### 6.5 GET Detail Buku (Route Parameter)

- **Method:** GET
- **Request:** `http://localhost:3004/api/buku/1`
- **Hasil:** `200 OK`

Endpoint berhasil menampilkan informasi detail buku berdasarkan ID yang diminta.

### 6.6 POST Tambah Buku (Berhasil)

- **Method:** POST
- **Request:** `http://localhost:3004/api/buku`
- **Body:** raw → JSON

```json
{
  "judul": "Pemrograman Express.js",
  "penulis": "Winda",
  "tersedia": true
}
```

- **Hasil:** `201 Created`

Data buku baru berhasil ditambahkan ke dalam server.

### 6.7 POST Validasi Input (Gagal)

- **Method:** POST
- **Request:** `http://localhost:3004/api/buku`
- **Body:** raw → JSON

```json
{
  "judul": "Buku Tanpa Penulis"
}
```

- **Hasil:** `400 Bad Request`

Server menolak data karena field wajib, yaitu penulis, tidak diisi.

### 6.8 Handler 404 (Endpoint Tidak Ditemukan)

- **Method:** GET
- **Request:** `http://localhost:3004/salah`
- **Hasil:** `404 Not Found`

Pengujian berhasil memastikan server memberikan respons 404 ketika pengguna mengakses endpoint yang tidak terdaftar.

## 7. Kesimpulan

Berdasarkan pengerjaan Tugas 2, REST API dengan resource Buku telah dibuat menggunakan Express.js.

Aplikasi menerapkan routing berdasarkan method HTTP, penggunaan route parameter dan query parameter, middleware JSON parser dan logger, validasi input, serta penanganan endpoint yang tidak ditemukan dan error.

Pengujian dilakukan menggunakan Postman untuk memastikan setiap endpoint memberikan respons dan HTTP status code sesuai dengan fungsinya.