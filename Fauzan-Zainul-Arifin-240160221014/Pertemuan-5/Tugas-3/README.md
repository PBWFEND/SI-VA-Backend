# Tugas 3 — Perancangan dan Implementasi RESTful API

## 1. Deskripsi

Tugas ini mengimplementasikan RESTful API untuk pengelolaan data mahasiswa menggunakan Node.js dan Express.js.

API menyediakan fitur mengambil daftar mahasiswa, melihat detail berdasarkan NIM, menambahkan data, mengganti data, memperbarui sebagian data, dan menghapus data mahasiswa.

Data disimpan sementara dalam array JavaScript.

## 2. Teknologi

- Node.js
- Express.js
- Postman untuk pengujian API

## 3. Cara Menjalankan Project

Pastikan Node.js sudah terpasang.

1. Buka terminal pada folder `Tugas-3`.
2. Instal dependensi:

   ```bash
   npm install
   ```

3. Jalankan server:

   ```bash
   node api.js
   ```

4. Server berjalan di `http://localhost:3008`.

## 4. Kontrak Endpoint

| Method | Endpoint | Fungsi | Status sukses |
|---|---|---|---|
| GET | `/mahasiswa` | Mengambil seluruh data mahasiswa | 200 OK |
| GET | `/mahasiswa/:nim` | Mengambil detail mahasiswa berdasarkan NIM | 200 OK |
| POST | `/mahasiswa` | Menambahkan mahasiswa baru | 201 Created |
| PUT | `/mahasiswa/:nim` | Mengganti data mahasiswa secara keseluruhan | 200 OK |
| PATCH | `/mahasiswa/:nim` | Memperbarui sebagian data mahasiswa | 200 OK |
| DELETE | `/mahasiswa/:nim` | Menghapus mahasiswa berdasarkan NIM | 204 No Content |

## 5. Query Parameter

### Filter berdasarkan program studi

```http
GET /mahasiswa?prodi=Sistem%20Informasi
```

### Filter berdasarkan angkatan

```http
GET /mahasiswa?angkatan=2024
```

### Menggabungkan filter

```http
GET /mahasiswa?prodi=Sistem%20Informasi&angkatan=2024
```

Semua filter menggunakan endpoint collection `/mahasiswa`.

## 6. Contoh Request

### POST — Menambahkan mahasiswa

Endpoint: `POST /mahasiswa`

```json
{
  "nim": "F1D022003",
  "nama": "Budi Santoso",
  "prodi": "Informatika",
  "angkatan": 2025
}
```

Respons sukses: `201 Created`.

### PUT — Mengganti data mahasiswa

Endpoint: `PUT /mahasiswa/F1D022003`

```json
{
  "nim": "F1D022003",
  "nama": "Budi Santoso",
  "prodi": "Sistem Informasi",
  "angkatan": 2025
}
```

Respons sukses: `200 OK`.

### PATCH — Memperbarui sebagian data

Endpoint: `PATCH /mahasiswa/F1D022003`

```json
{
  "nama": "Budi Santoso Updated"
}
```

Respons sukses: `200 OK`.

### DELETE — Menghapus mahasiswa

Endpoint: `DELETE /mahasiswa/F1D022003`

Respons sukses: `204 No Content` tanpa response body.

## 7. Validasi dan Penanganan Error

| Status | Kondisi |
|---|---|
| 400 Bad Request | Input tidak valid, field wajib tidak lengkap, atau NIM duplikat |
| 404 Not Found | Mahasiswa dengan NIM yang diminta tidak ditemukan |
| 204 No Content | Penghapusan berhasil tanpa response body |

Respons error menggunakan format JSON, misalnya:

```json
{
  "success": false,
  "message": "Mahasiswa tidak ditemukan"
}
```

## 8. Middleware Logger

Middleware logger mencatat HTTP method dan URL setiap request yang diterima server.

Contoh log:

```text
GET /mahasiswa
POST /mahasiswa
PATCH /mahasiswa/F1D022003
DELETE /mahasiswa/F1D022003
```

## 9. Hasil Pengujian

Pengujian dilakukan menggunakan Postman.

| No. | Pengujian | Status yang diharapkan | Hasil |
|---:|---|---|---|
| 1 | GET seluruh mahasiswa | 200 OK | Berhasil |
| 2 | GET berdasarkan prodi | 200 OK | Berhasil |
| 3 | GET berdasarkan angkatan | 200 OK | Berhasil |
| 4 | GET detail mahasiswa ditemukan | 200 OK | Berhasil |
| 5 | GET NIM tidak ditemukan | 404 Not Found | Berhasil |
| 6 | POST data valid | 201 Created | Berhasil |
| 7 | POST data tidak valid | 400 Bad Request | Berhasil |
| 8 | POST NIM duplikat | 400 Bad Request | Berhasil |
| 9 | PUT data valid | 200 OK | Berhasil |
| 10 | PUT data tidak lengkap | 400 Bad Request | Berhasil |
| 11 | PUT NIM tidak ditemukan | 404 Not Found | Berhasil |
| 12 | PATCH data valid | 200 OK | Berhasil |
| 13 | PATCH data tidak valid | 400 Bad Request | Berhasil |
| 14 | PATCH NIM tidak ditemukan | 404 Not Found | Berhasil |
| 15 | DELETE data ditemukan | 204 No Content | Berhasil |
| 16 | DELETE NIM tidak ditemukan | 404 Not Found | Berhasil |
| 17 | GET setelah data dihapus | 404 Not Found | Berhasil |

## 10. Catatan

Data mahasiswa disimpan di dalam array JavaScript sehingga hanya tersedia selama proses server berjalan. Data yang ditambahkan, diperbarui, atau dihapus tidak tersimpan permanen. Ketika server dimulai ulang, data kembali ke kondisi awal yang ditentukan dalam kode.
