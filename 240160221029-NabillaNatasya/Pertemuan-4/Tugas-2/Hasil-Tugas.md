# Tugas 4 — REST API Sistem Informasi Absensi dengan Express.js

**Nama:** Nadya Zahra Aulia  
**NIM:** 240160221030  
**Pertemuan:** 4

## 1. Deskripsi

Project ini merupakan aplikasi REST API sederhana untuk resource Anggota pada Sistem Informasi Absensi yang dibuat menggunakan Node.js dan Express.js.

Aplikasi menerapkan konsep dasar REST API, meliputi:

- GET daftar anggota
- GET detail anggota berdasarkan ID
- POST menambahkan anggota
- PUT memperbarui data anggota
- DELETE menghapus anggota
- Query parameter untuk filter jabatan
- Route parameter untuk ID anggota
- Middleware JSON
- Middleware logger
- Validasi input
- Handler 404
- Error middleware
- Response JSON dengan HTTP status code yang sesuai

Data anggota masih disimpan di dalam array sehingga belum menggunakan database.

## 2. Tujuan Pembelajaran

Setelah menyelesaikan tugas ini, diharapkan dapat:

- Membuat aplikasi REST API menggunakan Express.js.
- Memisahkan aplikasi menjadi `app.js` dan `server.js`.
- Membuat routing berdasarkan method HTTP.
- Menggunakan route parameter dan query parameter.
- Menggunakan middleware pada Express.js.
- Membuat response JSON dengan status code yang tepat.
- Menangani endpoint yang tidak ditemukan.
- Membuat validasi request.
- Menguji REST API menggunakan Postman.

## 3. Teknologi

- Node.js
- Express.js
- npm
- Postman
- JSON

## 4. Struktur Project

```text
tugas4/
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
└── Screenshoot/
```

Folder `Screenshoot/` digunakan untuk menyimpan bukti pengujian Postman. Sesuaikan nama folder dengan yang benar-benar ada di proyek.

## 5. Fungsi File

| File/Folder | Fungsi |
|---|---|
| `app.js` | Konfigurasi Express, middleware, data anggota, routing, handler 404, dan error middleware. |
| `server.js` | Menjalankan aplikasi Express pada port 3006. |
| `package.json` | Informasi project, script, dan dependency. |
| `package-lock.json` | Mencatat versi dependency yang digunakan. |
| `README.md` | Dokumentasi project dan hasil pengujian. |
| `.gitignore` | Mengabaikan file atau folder tertentu dari Git. |
| `Screenshoot/` | Menyimpan bukti hasil pengujian Postman. |

## 6. Instalasi

Pastikan Node.js dan npm sudah terpasang.

Masuk ke folder proyek:

```bash
cd pertemuan-4/tugas4
```

Install dependency:

```bash
npm install
```

Perintah tersebut digunakan untuk memasang dependency yang tercantum di `package.json`.

## 7. Menjalankan Server

Jalankan server menggunakan perintah:

```bash
node server.js
```

Server berjalan pada:

```text
http://localhost:3006
```

Tekan `Ctrl + C` untuk menghentikan server.

Selama pengujian menggunakan Postman, terminal harus tetap menjalankan server.

## 8. Daftar Endpoint

| No. | Method | Endpoint | Keterangan |
|---:|---|---|---|
| 1 | GET | `/anggota` | Menampilkan seluruh anggota |
| 2 | GET | `/anggota/:id` | Menampilkan detail anggota berdasarkan ID |
| 3 | POST | `/anggota` | Menambahkan anggota baru |
| 4 | PUT | `/anggota/:id` | Memperbarui data anggota |
| 5 | DELETE | `/anggota/:id` | Menghapus anggota |
| 6 | GET | `/anggota?jabatan=Ketua` | Filter anggota berdasarkan jabatan |

## 9. Route Parameter

Route parameter digunakan untuk mengambil ID anggota dari URL.

Contoh request:

```http
GET /anggota/AGT001
```

Parameter `AGT001` merupakan ID anggota yang dicari.

Format endpoint:

```text
/anggota/:id
```

Jika anggota dengan ID tersebut tidak ditemukan, API mengembalikan status `404 Not Found`.

## 10. Query Parameter

Query parameter digunakan untuk memfilter anggota berdasarkan jabatan.

### Filter Ketua

```http
GET /anggota?jabatan=Ketua
```

### Filter Sekretaris

```http
GET /anggota?jabatan=Sekretaris
```

### Filter Bendahara

```http
GET /anggota?jabatan=Bendahara
```

Jika parameter `jabatan` tidak digunakan:

```http
GET /anggota
```

API akan menampilkan seluruh anggota.

## 11. Contoh Request dan Response

### 11.1 GET — Daftar Anggota

**Request**

```http
GET http://localhost:3006/anggota
```

**Contoh response**

```json
{
  "success": true,
  "total": 4,
  "data": [
    {
            "id_anggota": "AGT001",
            "nama": "Ende",
            "nim": "2601602210118",
            "jabatan": "Ketua"
        },
        {
            "id_anggota": "AGT002",
            "nama": "Pingkan",
            "nim": "260160221015",
            "jabatan": "Wakil Ketua"
        },
        {
            "id_anggota": "AGT003",
            "nama": "Qeylla",
            "nim": "260160221014",
            "jabatan": "Sekretaris"
        },
        {
            "id_anggota": "AGT004",
            "nama": "Shifa",
            "nim": "260160221014",
            "jabatan": "Bendahara"
        }
  ]
}
```

**Status:** `200 OK`

### 11.2 GET — Detail Anggota

**Request**

```http
GET http://localhost:3006/anggota/AGT001
```

**Contoh response**

```json
{
  "success": true,
  "data": {
    "id_anggota": "AGT001",
        "nama": "Ende",
        "nim": "2601602210118",
        "jabatan": "Ketua"
  }
}
```

**Status:** `200 OK`

### 11.3 POST — Menambahkan Anggota

**Request**

```http
POST http://localhost:3006/anggota
```

Header:

```text
Content-Type: application/json
```

Body pada Postman, pilih **Body → raw → JSON**:

```json
{
  "nama": "Nadya Zahra Aulia",
  "nim": "240160221030",
  "jabatan": "Sekretaris"
}
```

**Contoh response**

```json
{
  "success": true,
  "message": "Anggota berhasil ditambahkan",
  "data": {
    "id_anggota": "AGT005",
    "nama": "Nadya Zahra Aulia",
    "nim": "240160221030",
    "jabatan": "Sekretaris"
  }
}
```

**Status:** `201 Created`

ID anggota dibuat secara otomatis oleh API. Karena data awal menggunakan ID `AGT001` sampai `AGT004`, anggota baru akan mendapatkan ID `AGT005`.

### 11.4 PUT — Memperbarui Anggota

**Request**

```http
PUT http://localhost:3006/anggota/AGT002
```

Header:

```text
Content-Type: application/json
```

Contoh body untuk mengubah jabatan:

```json
{
  "jabatan": "Bendahara"
}
```

**Status berhasil:** `200 OK`

Endpoint ini dapat memperbarui field `nama`, `nim`, dan `jabatan`. Field yang tidak dikirim akan tetap menggunakan nilai sebelumnya.

### 11.5 DELETE — Menghapus Anggota

**Request**

```http
DELETE http://localhost:3006/anggota/AGT004
```

**Contoh response**

```json
{
  "success": true,
  "message": "Anggota berhasil dihapus",
  "data": {
    "id_anggota": "AGT004",
        "nama": "Shifa",
        "nim": "260160221014",
        "jabatan": "Bendahara"
  }
}
```

**Status berhasil:** `200 OK`

## 12. Pengujian Error dan Validasi

### 12.1 GET Anggota yang Tidak Ditemukan

**Request**

```http
GET http://localhost:3006/anggota/AGT011
```

**Response**

```json
{
  "success": false,
  "message": "Anggota tidak ditemukan"
}
```

**Status:** `404 Not Found`

### 12.2 Filter Anggota Berdasarkan Jabatan

**Request**

```http
GET http://localhost:3006/anggota?jabatan=bendahara
```

Hasil hanya menampilkan anggota yang memiliki jabatan `bendahara`.

**Status:** `200 OK`

### 12.3 Validasi POST

Request untuk menguji validasi dapat menggunakan body berikut:

```json
{
  "nama": "Nadya Zahra Aulia",
  "nim": "240160221030"
}
```

Field `jabatan` sengaja tidak disertakan.

**Response**

```json
{
  "success": false,
  "message": "Field nama, nim, dan jabatan wajib diisi"
}
```

**Status:** `400 Bad Request`

### 12.4 Endpoint Tidak Ditemukan

**Request**

```http
GET http://localhost:3006/halaman-tidak-ada
```

**Response**

```json
{
  "success": false,
  "message": "Endpoint tidak ditemukan"
}
```

**Status:** `404 Not Found`

## 13. Middleware

### 13.1 Middleware JSON

Aplikasi menggunakan:

```javascript
app.use(express.json());
```

Middleware ini digunakan untuk membaca request body dengan format JSON, terutama pada endpoint POST dan PUT.

### 13.2 Middleware Logger

Aplikasi menggunakan middleware logger untuk mencatat waktu, HTTP method, dan URL request di terminal.

Contoh output:

```text
[12/10/2026, 20.30.00] POST /anggota
```

Waktu pada contoh tersebut hanya ilustrasi. Output sebenarnya mengikuti waktu saat request diterima.

## 14. Handler 404

Aplikasi menyediakan handler khusus untuk endpoint yang tidak tersedia.

Contoh request:

```http
GET /halaman-tidak-ada
```

Response:

```json
{
  "success": false,
  "message": "Endpoint tidak ditemukan"
}
```

Status:

`404 Not Found`

## 15. Error Middleware

Aplikasi menggunakan error middleware Express untuk menangani error yang diteruskan ke middleware tersebut.

Format error middleware:

```javascript
(error, request, response, next)
```

Jika terjadi error yang diteruskan ke middleware tersebut, aplikasi dapat memberikan response JSON dengan status:

`500 Internal Server Error`

## 16. Hasil Pengujian

| No. | Skenario | Method | Status yang Diharapkan |
|---:|---|---|---|
| 1 | Menampilkan daftar anggota | GET | 200 OK |
| 2 | Menampilkan detail anggota | GET | 200 OK |
| 3 | Menambahkan anggota | POST | 201 Created |
| 4 | Memperbarui data anggota | PUT | 200 OK |
| 5 | Menghapus anggota | DELETE | 200 OK |
| 6 | Mencari ID anggota yang tidak ada | GET | 404 Not Found |
| 7 | Filter anggota berdasarkan jabatan | GET | 200 OK |
| 8 | Validasi data POST | POST | 400 Bad Request |
| 9 | Endpoint tidak ditemukan | GET | 404 Not Found |

Catatan: hasil aktual perlu disesuaikan dengan pengujian yang benar-benar dilakukan di Postman.

## 17. Bukti Screenshot Pengujian

Simpan screenshot hasil pengujian Postman ke dalam folder `Screenshoot/`.

Contoh dokumentasi yang dapat disimpan:

1. GET daftar anggota
2. GET detail anggota
3. POST menambahkan anggota
4. PUT memperbarui anggota
5. DELETE anggota
6. GET anggota tidak ditemukan
7. Filter anggota berdasarkan jabatan
8. Validasi POST
9. Endpoint tidak ditemukan

Sesuaikan nama file screenshot dengan file yang benar-benar tersimpan di folder proyek.

## 18. Catatan

Aplikasi menggunakan penyimpanan data berupa array di dalam program.

Artinya:

- Belum menggunakan database.
- Data hanya tersimpan selama proses server berjalan.
- Data kembali ke kondisi awal setelah server dimulai ulang.
- ID anggota dibuat otomatis menggunakan format `AGT001`, `AGT002`, dan seterusnya.
- Project berfokus pada penerapan REST API menggunakan Express.js.

## 19. Kesimpulan

Pada Tugas 4 ini telah dibuat REST API sederhana menggunakan Express.js untuk mengelola data anggota pada Sistem Informasi Absensi.

Aplikasi menerapkan:

- GET daftar anggota.
- GET detail anggota.
- POST data anggota.
- PUT data anggota.
- DELETE data anggota.
- Route parameter.
- Query parameter.
- Middleware JSON.
- Middleware logger.
- Validasi input.
- HTTP status code.
- Handler 404.
- Error middleware.
- Pengujian menggunakan Postman.

Dengan demikian, project ini menjadi penerapan dasar pembuatan REST API menggunakan Express.js pada Pertemuan 4.