# Sistem Informasi Absensi API

RESTful API untuk mengelola data absensi anggota organisasi. API dibuat menggunakan Node.js dan Express.js dengan penyimpanan data sementara di dalam memori (*in-memory*).

## Identitas

- **Nama:** Nadya Zahra Aulia
- **NIM:** 240160221030
- **Mata Kuliah:** Pemrograman Berbasis Web Front-End

## Teknologi

- Node.js
- Express.js
- JavaScript ES Modules
- Postman untuk pengujian API

## Persiapan dan Instalasi

Pastikan Node.js dan npm sudah terpasang.

1. Instal dependency:

   ```bash
   npm.cmd install
   ```

2. Jalankan server:

   ```bash
   npm.cmd start
   ```

3. Server berjalan pada:

   `http://localhost:3006`

## Struktur Data Absensi

Setiap data absensi memiliki field berikut:

| Field | Tipe | Keterangan |
|---|---|---|
| `id_absensi` | String | ID absensi yang dibuat otomatis oleh server |
| `id_anggota` | String | ID anggota |
| `nama` | String | Nama anggota |
| `nim` | String | Nomor induk mahasiswa |
| `kegiatan` | String | Nama kegiatan |
| `tanggal` | String | Tanggal dengan format `YYYY-MM-DD` |
| `status` | String | Status kehadiran: `Hadir`, `Izin`, atau `Sakit` |

## Daftar Endpoint

| No. | Method | Endpoint | Fungsi | Status sukses |
|---:|---|---|---|---|
| 1 | GET | `/absensi` | Mengambil seluruh data absensi | 200 |
| 2 | GET | `/absensi/:id` | Mengambil detail absensi berdasarkan ID | 200 |
| 3 | POST | `/absensi` | Menambahkan data absensi | 201 |
| 4 | PUT | `/absensi/:id` | Mengganti seluruh data absensi | 200 |
| 5 | PATCH | `/absensi/:id` | Mengubah sebagian data absensi | 200 |
| 6 | DELETE | `/absensi/:id` | Menghapus data absensi | 204 |

## Filter Data

### Filter berdasarkan status

```http
GET /absensi?status=Hadir
```

Status yang diperbolehkan adalah `Hadir`, `Izin`, dan `Sakit`.

### Filter berdasarkan kegiatan

```http
GET /absensi?kegiatan=Rapat%20Organisasi
```

Kedua filter dapat digunakan bersamaan:

```http
GET /absensi?status=Hadir&kegiatan=Rapat%20Organisasi
```

## Contoh Request

### 1. Menambahkan data absensi

**Method:** `POST`

**URL:** `http://localhost:3006/absensi`

Pilih **Body → raw → JSON** di Postman, kemudian masukkan:

```json
{
  "id_anggota": "AGT004",
  "nama": "Park Chae-young",
  "nim": "260160221014",
  "kegiatan": "Rapat Program Kerja",
  "tanggal": "2026-09-28",
  "status": "Izin"
}
```

Field `id_absensi` tidak perlu dikirim karena ID dibuat otomatis oleh server.

### 2. Memperbarui sebagian data

**Method:** `PATCH`

**URL:** `http://localhost:3006/absensi/ABS001`

```json
{
  "status": "Izin"
}
```

### 3. Menghapus data absensi

**Method:** `DELETE`

**URL:** `http://localhost:3006/absensi/ABS001`

Jika berhasil, server mengembalikan status `204 No Content` tanpa response body.

## Validasi Input

API menerapkan validasi berikut:

- Body harus berupa objek JSON.
- Field wajib tidak boleh kosong.
- Field yang tidak dikenal, seperti `jabatan` atau `id_absensi` pada request penambahan data, ditolak.
- Status kehadiran harus `Hadir`, `Izin`, atau `Sakit`.
- Tanggal harus berupa tanggal valid dengan format `YYYY-MM-DD`.
- Data yang tidak ditemukan akan menghasilkan respons `404 Not Found`.

## Format Respons

### Respons sukses

```json
{
  "success": true,
  "message": "Data absensi berhasil diambil.",
  "data": []
}
```

### Respons gagal

```json
{
  "success": false,
  "message": "Data absensi tidak ditemukan."
}
```

## HTTP Status Code

| Status | Keterangan |
|---|---|
| `200 OK` | Request berhasil |
| `201 Created` | Data berhasil dibuat |
| `204 No Content` | Data berhasil dihapus tanpa response body |
| `400 Bad Request` | Input tidak valid |
| `404 Not Found` | Resource atau endpoint tidak ditemukan |
| `500 Internal Server Error` | Terjadi kesalahan pada server |

## Hasil Pengujian

Isi bagian ini setelah setiap pengujian dilakukan menggunakan Postman.

| No. | Pengujian | Hasil yang diharapkan | Hasil aktual |
|---:|---|---|---|
| 1 | GET seluruh absensi | 200 OK | Belum diuji |
| 2 | GET detail absensi | 200 OK | Belum diuji |
| 3 | Filter status dan kegiatan | 200 OK | Belum diuji |
| 4 | POST data valid | 201 Created | Belum diuji |
| 5 | PUT data absensi | 200 OK | Belum diuji |
| 6 | PATCH data absensi | 200 OK | Belum diuji |
| 7 | Input tidak valid | 400 Bad Request | Belum diuji |
| 8 | Resource tidak ditemukan | 404 Not Found | Belum diuji |
| 9 | DELETE data absensi | 204 No Content | Belum diuji |

## Catatan

Data disimpan sementara di memori aplikasi (*in-memory*). Data akan kembali ke data awal ketika server dihentikan atau dijalankan ulang. API ini belum menggunakan database permanen.