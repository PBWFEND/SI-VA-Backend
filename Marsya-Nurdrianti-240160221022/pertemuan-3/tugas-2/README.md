# Tugas 2 — Node.js Fundamentals

**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Pertemuan:** 3 — Node.js Fundamentals  
**Nama:** Marsya Nurdrianti  
**NIM:** 240160221022  

---

## 1. Deskripsi Project

Project ini merupakan implementasi HTTP Server sederhana menggunakan **Node.js tanpa Express.js**.

Project menerapkan beberapa materi Node.js Fundamentals, yaitu:

- Module ESM
- Environment variable
- HTTP Server
- Routing sederhana
- JSON response
- HTTP status code
- Pembacaan file JSON secara asynchronous
- Penanganan error

## 2. Struktur Folder

```text
tugas-2/
├── data/
│   └── students.json
├── config.js
├── server.js
└── README.md
```

### Keterangan

| File/Folder | Fungsi |
|---|---|
| `data/students.json` | Menyimpan data mahasiswa |
| `config.js` | Menyimpan konfigurasi aplikasi |
| `server.js` | Menjalankan server dan routing |
| `README.md` | Dokumentasi project |

## 3. Konfigurasi

Project menggunakan JavaScript ESM dan environment variable.

Konfigurasi utama:

```text
APP_NAME    = API Pertemuan 3
PORT        = 3003
NODE_ENV    = development
COURSE_CODE = CPMK115
```

## 4. Endpoint API

| Method | Endpoint | Fungsi | Status |
|---|---|---|---|
| GET | `/` | Menampilkan informasi aplikasi | 200 |
| GET | `/health` | Mengecek status server | 200 |
| GET | `/students` | Menampilkan data mahasiswa | 200 |
| GET | endpoint lain | Endpoint tidak ditemukan | 404 |

## 5. Menjalankan Project

Buka terminal pada folder `tugas-2`, kemudian jalankan:

```bash
node server.js
```

Jika berhasil, server berjalan di:

```text
http://localhost:3003
```

Untuk menghentikan server:

```text
Ctrl + C
```

## 6. Pengujian API

### Endpoint `/`

```bash
curl -i http://localhost:3003/
```

### Endpoint `/health`

```bash
curl -i http://localhost:3003/health
```

### Endpoint `/students`

```bash
curl -i http://localhost:3003/students
```

### Endpoint yang tidak tersedia

```bash
curl -i http://localhost:3003/tidak-ada
```

Endpoint yang tidak tersedia akan menghasilkan:

```text
404 Not Found
```

## 7. Pembacaan Data JSON

Data mahasiswa berada pada:

```text
data/students.json
```

File dibaca menggunakan module `node:fs/promises` dengan fungsi `readFile()` secara asynchronous. Data JSON kemudian diproses menggunakan `JSON.parse()`.

## 8. Penanganan Error

Project menggunakan `try...catch` untuk menangani kesalahan saat membaca file JSON.

Jika data mahasiswa gagal dibaca, server memberikan response:

```text
500 Internal Server Error
```

Sedangkan jika endpoint tidak ditemukan, server memberikan:

```text
404 Not Found
```

## 9. Environment Variable

Contoh mengubah `COURSE_CODE` pada PowerShell:

```powershell
$env:COURSE_CODE="SI-VA"
node server.js
```

Dengan cara tersebut, nilai `COURSE_CODE` dapat diubah tanpa mengedit `server.js`.

## 10. Kesimpulan

Project ini berhasil menerapkan dasar Node.js untuk membuat HTTP Server sederhana tanpa Express.js. Project memiliki tiga endpoint GET, menggunakan konfigurasi melalui environment variable, membaca data dari file JSON secara asynchronous, serta menangani endpoint yang tidak ditemukan dan kesalahan pembacaan file.
