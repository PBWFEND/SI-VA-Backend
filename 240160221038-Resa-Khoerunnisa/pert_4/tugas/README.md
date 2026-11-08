# Tugas 2 Pertemuan 4 — REST API Absensi Organisasi

## 1. Deskripsi Proyek
Proyek ini merupakan REST API sederhana untuk mengelola data absensi anggota organisasi menggunakan Express.js dan Node.js.

API menyediakan fitur untuk melihat seluruh data absensi, melihat detail berdasarkan ID, melakukan pencarian berdasarkan tanggal dan status, serta menambahkan data absensi baru.

## 2. Teknologi yang Digunakan
- Node.js
- Express.js
- JavaScript
- JSON

## 3. Struktur Folder

```text
tugas/
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── node_modules/
└── README.md
```

## 4. Cara Menjalankan Program

1. Buka folder proyek melalui Visual Studio Code.
2. Buka terminal pada folder `tugas`.
3. Jalankan perintah:

```bash
npm install
```

4. Jalankan server:

```bash
npm start
```

5. Buka browser dan akses:

```text
http://localhost:3004
```

## 5. Daftar Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | / | Menampilkan informasi API |
| GET | /health | Memeriksa status server |
| GET | /absensi | Menampilkan seluruh data absensi |
| GET | /absensi/:id | Menampilkan detail absensi berdasarkan ID |
| GET | /absensi?tanggal=2026-09-28 | Memfilter berdasarkan tanggal |
| GET | /absensi?status=Hadir | Memfilter berdasarkan status |
| POST | /absensi | Menambahkan data absensi |

## 6. Contoh Request POST

URL:

```text
http://localhost:3004/absensi
```

Method: POST

Body JSON:

```json
{
  "nama": "Dina",
  "jabatan": "Anggota",
  "tanggal": "2026-09-28",
  "status": "Hadir"
}
```

## 7. Hasil Pengujian

Pengujian dilakukan menggunakan browser dan Thunder Client.

Pengujian yang dilakukan meliputi:
1. Menampilkan informasi API.
2. Memeriksa status server.
3. Menampilkan seluruh data absensi.
4. Menampilkan detail absensi berdasarkan ID.
5. Memfilter data berdasarkan status.
6. Memfilter data berdasarkan tanggal.
7. Menguji ID yang tidak ditemukan.
8. Menguji endpoint yang tidak tersedia.
9. Menambahkan data absensi menggunakan POST.
10. Memastikan data baru berhasil ditambahkan.

Hasil pengujian menunjukkan bahwa endpoint API dapat berjalan sesuai dengan fungsinya.

## 8. Kesimpulan

REST API Absensi Organisasi berhasil dibuat menggunakan Express.js. API dapat menampilkan, mencari, dan menambahkan data absensi serta menangani permintaan yang tidak ditemukan dan kesalahan pada server.