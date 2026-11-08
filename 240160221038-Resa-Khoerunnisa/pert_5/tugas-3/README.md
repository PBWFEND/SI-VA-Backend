# RESTful API Absensi Organisasi

## 1. Deskripsi Proyek

RESTful API Absensi Organisasi merupakan aplikasi backend yang digunakan untuk mengelola data kehadiran anggota organisasi. API ini dibuat menggunakan Node.js dan Express.js dengan metode HTTP untuk melakukan proses menampilkan, menambahkan, mengubah, dan menghapus data absensi.

Data yang dikelola meliputi ID, nama anggota, jabatan, tanggal absensi, dan status kehadiran.

## 2. Teknologi yang Digunakan

- Node.js
- Express.js
- JavaScript
- Postman untuk pengujian API

## 3. Cara Menjalankan Program

Berikut langkah-langkah menjalankan aplikasi:

1. Buka folder proyek melalui Visual Studio Code.
2. Buka terminal pada folder proyek.
3. Jalankan perintah berikut untuk menginstal dependency:

   ```bash
   npm install
   ```

4. Jalankan aplikasi menggunakan perintah:

   ```bash
   npm start
   ```

5. Jika berhasil, terminal akan menampilkan:

   ```text
   REST API berjalan di http://localhost:3006
   ```

6. API dapat diakses melalui alamat:

   `http://localhost:3006`

## 4. Daftar Endpoint API

| No. | Method | Endpoint | Keterangan |
|---|---|---|---|
| 1 | GET | `/absensi` | Menampilkan seluruh data absensi |
| 2 | GET | `/absensi/:id` | Menampilkan detail absensi berdasarkan ID |
| 3 | POST | `/absensi` | Menambahkan data absensi |
| 4 | PUT | `/absensi/:id` | Mengubah seluruh data absensi |
| 5 | PATCH | `/absensi/:id` | Mengubah sebagian data absensi |
| 6 | DELETE | `/absensi/:id` | Menghapus data absensi |

## 5. Fitur Filter Data

API menyediakan beberapa parameter query untuk melakukan penyaringan data absensi.

| Parameter | Contoh Penggunaan | Keterangan |
|---|---|---|
| status | `/absensi?status=Hadir` | Memfilter berdasarkan status kehadiran |
| jabatan | `/absensi?jabatan=Ketua` | Memfilter berdasarkan jabatan |
| tanggal | `/absensi?tanggal=2026-09-28` | Memfilter berdasarkan tanggal |

## 6. Validasi Data

Pada proses penambahan dan perubahan data, API melakukan validasi terhadap beberapa atribut berikut:

- `nama`: wajib diisi.
- `jabatan`: wajib diisi.
- `tanggal`: wajib diisi dengan format tanggal yang sesuai.
- `status`: wajib diisi dengan pilihan Hadir, Izin, atau Sakit.

Jika data yang dikirim tidak sesuai dengan ketentuan, API akan memberikan respons `400 Bad Request`.

## 7. Struktur Data Absensi

Contoh data absensi yang digunakan:

```json
{
  "id": 1,
  "nama": "Andi",
  "jabatan": "Ketua",
  "tanggal": "2026-09-28",
  "status": "Hadir"
}
```

## 8. Status Code

| Status Code | Keterangan |
|---|---|
| 200 OK | Permintaan berhasil diproses |
| 201 Created | Data berhasil ditambahkan |
| 204 No Content | Data berhasil dihapus tanpa respons body |
| 400 Bad Request | Data yang dikirim tidak valid |
| 404 Not Found | Data atau endpoint tidak ditemukan |
| 500 Internal Server Error | Terjadi kesalahan pada server |

## 9. Hasil Pengujian API

Pengujian dilakukan menggunakan aplikasi Postman dengan hasil pengujian sebagai berikut:

| No. | Pengujian | Method | Hasil yang Diharapkan |
|---|---|---|---|
| 1 | Menampilkan seluruh data absensi | GET | 200 OK |
| 2 | Menampilkan detail absensi | GET | 200 OK |
| 3 | Mencari data yang tidak tersedia | GET | 404 Not Found |
| 4 | Filter berdasarkan status | GET | 200 OK |
| 5 | Filter berdasarkan jabatan | GET | 200 OK |
| 6 | Filter berdasarkan tanggal | GET | 200 OK |
| 7 | Menambahkan data absensi | POST | 201 Created |
| 8 | Mengirim data tidak valid | POST | 400 Bad Request |
| 9 | Mengubah seluruh data absensi | PUT | 200 OK |
| 10 | Mengubah sebagian data absensi | PATCH | 200 OK |
| 11 | Menghapus data absensi | DELETE | 204 No Content |
| 12 | Memastikan data yang dihapus tidak tersedia | GET | 404 Not Found |

## 10. Kesimpulan

RESTful API Absensi Organisasi berhasil dibuat menggunakan Node.js dan Express.js. API menyediakan fitur untuk mengelola data absensi melalui enam endpoint utama, mendukung filter menggunakan query parameter, serta menerapkan validasi data dan penanganan kesalahan. Pengujian dilakukan menggunakan Postman untuk memastikan setiap endpoint berjalan sesuai fungsinya.