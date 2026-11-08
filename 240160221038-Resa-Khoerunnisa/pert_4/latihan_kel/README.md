# Latihan Kelompok Pertemuan 4
## Konversi Node.js HTTP menjadi Express.js

### 1. Deskripsi Proyek

Latihan kelompok ini bertujuan untuk mengubah route yang sebelumnya menggunakan `node:http` pada Pertemuan 3 menjadi route menggunakan Express.js.

Pada latihan ini dibuat REST API sederhana untuk mengelola data mahasiswa. API memiliki fitur menampilkan seluruh mahasiswa, menampilkan detail mahasiswa berdasarkan NIM, dan menambahkan data mahasiswa baru.

### 2. Teknologi yang Digunakan

- Node.js
- Express.js
- JavaScript
- JSON
- Visual Studio Code
- PowerShell dan curl

### 3. Anggota Kelompok

1. Resa Khoerunnisa
2. Aldi Restu Fauzi
3. Khoirunnisa Sholeha


### 4. Susunan Middleware

Middleware disusun berdasarkan urutan berikut:

1. **Logger:** mencatat setiap request yang masuk, termasuk method dan URL.
2. **Parser JSON:** membaca data JSON yang dikirim melalui request.
3. **Route:** memproses request GET dan POST.
4. **Handler 404:** menangani endpoint yang tidak tersedia.
5. **Error Handler:** menangani kesalahan yang terjadi pada aplikasi.

### 5. Daftar Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/students` | Menampilkan seluruh data mahasiswa |
| GET | `/students/:nim` | Menampilkan detail mahasiswa berdasarkan NIM |
| POST | `/students` | Menambahkan data mahasiswa |

### 6. Cara Menjalankan Program

1. Buka folder `latihan_kelompok` menggunakan Visual Studio Code.
2. Buka terminal pada folder tersebut.
3. Jalankan perintah untuk memasang Express.js:

```bash
npm install
```

 Jalankan server menggunakan perintah:

```bash
npm start
```

Jika berhasil, server akan berjalan pada alamat:

```text
http://localhost:3006
```

### 7. Contoh Pengujian API

Pengujian dilakukan menggunakan `curl.exe` melalui PowerShell.

**a. Menampilkan seluruh data mahasiswa**

```bash
curl.exe -i http://localhost:3006/students
```

Status code yang diharapkan: `200 OK`.

**b. Menampilkan mahasiswa berdasarkan NIM**

```bash
curl.exe -i http://localhost:3006/students/240160221038
```

Status code yang diharapkan: `200 OK`.

**c. Mengirim data dengan body tidak lengkap**

```bash
curl.exe -i -X POST http://localhost:3006/students -H "Content-Type: application/json" -d "{\"nim\":\"240160221041\"}"
```

Status code yang diharapkan: `400 Bad Request`.

**d. Mencari NIM yang tidak ditemukan**

```bash
curl.exe -i http://localhost:3006/students/999999
```

Status code yang diharapkan: `404 Not Found`.

**e. Mengakses endpoint yang tidak tersedia**

```bash
curl.exe -i http://localhost:3006/alamat-salah
```

Status code yang diharapkan: `404 Not Found`.

**f. Menambahkan data mahasiswa baru**

```bash
curl.exe -i -X POST http://localhost:3006/students -H "Content-Type: application/json" -d "{\"nim\":\"240160221041\",\"nama\":\"Dina\"}"
```

Status code yang diharapkan: `201 Created`.

### 9. Tabel Hasil Pengujian

| No. | Method | URL | Status Code | Keterangan |
|---|---|---|---|---|
| 1 | GET | `/students` | 200 | Menampilkan seluruh data mahasiswa |
| 2 | GET | `/students/240160221038` | 200 | Menampilkan detail mahasiswa |
| 3 | POST | `/students` | 400 | Body request tidak lengkap |
| 4 | GET | `/students/999999` | 404 | NIM tidak ditemukan |
| 5 | GET | `/alamat-salah` | 404 | Endpoint tidak tersedia |
| 6 | POST | `/students` | 201 | Berhasil menambahkan mahasiswa |
| 7 | GET | `/students` | 200 | Memeriksa data setelah penambahan |

*Catatan: Status code pada tabel merupakan hasil yang diharapkan dan perlu disesuaikan dengan hasil pengujian aktual.*

### 8. Alasan Penggunaan Status Code

- **200 OK:** digunakan ketika request berhasil dan data dapat ditampilkan.
- **201 Created:** digunakan ketika data mahasiswa baru berhasil ditambahkan.
- **400 Bad Request:** digunakan ketika data yang dikirim tidak lengkap.
- **404 Not Found:** digunakan ketika data mahasiswa atau endpoint tidak ditemukan.
- **409 Conflict:** digunakan ketika NIM yang dimasukkan sudah terdaftar.
- **500 Internal Server Error:** digunakan ketika terjadi kesalahan pada server.

### 9. Kesimpulan

Berdasarkan latihan kelompok yang dilakukan, Express.js dapat digunakan untuk menyederhanakan pembuatan REST API dibandingkan penggunaan `node:http` secara langsung.

Dengan Express.js, pengelolaan route dan middleware menjadi lebih terstruktur. API yang dibuat dapat menampilkan data mahasiswa, mencari data berdasarkan NIM, menambahkan data baru, serta menangani request yang tidak sesuai.

Data mahasiswa pada latihan ini masih disimpan sementara dalam array JavaScript dan belum menggunakan database.