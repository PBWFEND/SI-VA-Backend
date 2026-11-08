# Latihan Individu Pertemuan 5
## RESTful API Mahasiswa dengan Express.js

### 1. Deskripsi
Latihan ini mengembangkan RESTful API mahasiswa menggunakan Express.js. API menyediakan fitur menampilkan data, mencari mahasiswa berdasarkan NIM, filter program studi, menambahkan data, dan memperbarui sebagian data mahasiswa.

### 2. Cara Menjalankan
1. Buka terminal pada folder latihan_individu.
2. Jalankan perintah `npm install express`.
3. Jalankan server menggunakan `node latihan.js`.
4. API berjalan pada `http://localhost:3007`.

### 3. Daftar Endpoint

| Method | URL | Status Code | Keterangan |
|---|---|---:|---|
| GET | `/mahasiswa` | 200 | Menampilkan seluruh data mahasiswa |
| GET | `/mahasiswa/240160221038` | 200 | Menampilkan detail mahasiswa |
| GET | `/mahasiswa/999` | 404 | NIM tidak ditemukan |
| GET | `/mahasiswa?prodi=Sistem%20Informasi` | 200 | Filter berdasarkan program studi |
| POST | `/mahasiswa` | 201 | Menambahkan mahasiswa baru |
| POST | `/mahasiswa` | 400 | Data tidak lengkap atau tidak valid |
| PATCH | `/mahasiswa/240160221038` | 204 | Memperbarui sebagian data mahasiswa |

### 4. Contoh Request

**GET `/mahasiswa`**

Menampilkan seluruh data mahasiswa.

**GET `/mahasiswa/240160221038`**

Menampilkan detail mahasiswa berdasarkan NIM.

**GET `/mahasiswa?prodi=Sistem%20Informasi`**

Menampilkan mahasiswa dari program studi Sistem Informasi.

**POST `/mahasiswa`**

Contoh body JSON:

```json
{
  "nim": "240160221038",
  "nama": "Resa Khoerunnisa",
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}

```

### 5. Pengujian API

Seluruh endpoint telah diuji menggunakan Thunder Client.

| No. | Pengujian | Hasil |
|---:|---|---|
| 1 | GET seluruh mahasiswa | Berhasil |
| 2 | GET detail mahasiswa | Berhasil |
| 3 | GET NIM tidak ditemukan | Berhasil |
| 4 | GET filter program studi | Berhasil |
| 5 | POST data mahasiswa | Berhasil |
| 6 | POST data tidak lengkap | Berhasil |
| 7 | PATCH sebagian data mahasiswa | Berhasil |

### 6. Kesimpulan

Berdasarkan hasil pengujian, RESTful API mahasiswa berhasil dikembangkan menggunakan Express.js. API telah menerapkan middleware logger, route parameter, query parameter, POST, PATCH, validasi data, serta penggunaan status code HTTP sesuai kebutuhan.