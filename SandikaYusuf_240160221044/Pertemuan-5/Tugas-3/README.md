# Tugas 3 — Perancangan dan Implementasi RESTful API

**Nama:** Sandika Yusuf Permana
**NPM:** 240160221044  
**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Pertemuan:** 5  

## 1. Deskripsi

Tugas ini merupakan implementasi RESTful API menggunakan Express.js dengan resource **Anggota** dan **Absensi**.

Data yang digunakan masih disimpan sementara menggunakan array (in-memory), sehingga data akan kembali seperti semula ketika server dijalankan ulang.

## 2. Teknologi

- Node.js
- Express.js
- JavaScript
- Postman

## 3. Struktur Project

```text
pertemuan-05/
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── screenshots/
    ├── 01-get-semua-anggota.png
    ├── 02-get-detail-anggota.png
    ├── 03-filter-anggota.png
    ├── 04-post-anggota.png
    ├── 05-validasi-400.png
    ├── 06-not-found-404.png
    ├── 07-put-anggota.png
    ├── 08-patch-anggota.png
    ├── 09-delete-anggota.png
    ├── 10-get-absensi.png
    └── 11-post-absensi.png
```

## 4. Cara Menjalankan

Install dependency:

```bash
npm install
```

Jalankan server:

```bash
npm start
```

Server berjalan pada:

```text
http://localhost:3008
```

## 5. Kontrak Endpoint

### Resource Anggota

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/anggota` | Menampilkan semua anggota |
| GET | `/anggota/:id` | Menampilkan detail anggota |
| POST | `/anggota` | Menambahkan anggota |
| PUT | `/anggota/:id` | Mengubah seluruh data anggota |
| PATCH | `/anggota/:id` | Mengubah sebagian data anggota |
| DELETE | `/anggota/:id` | Menghapus anggota |

### Resource Absensi

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/absensi` | Menampilkan data absensi |
| POST | `/absensi` | Menambahkan data absensi |

## 6. Query Parameter

Filter anggota:

```text
GET /anggota?divisi=Humas
GET /anggota?status=Aktif
GET /anggota?divisi=Humas&status=Aktif
```

Filter absensi:

```text
GET /absensi?tanggal=2026-10-06
GET /absensi?status=Hadir
```

## 7. Contoh Request

### GET Semua Anggota

```text
GET http://localhost:3008/anggota
```

### GET Detail Anggota

```text
GET http://localhost:3008/anggota/1
```

### POST Anggota

```text
POST http://localhost:3008/anggota
```

Body:

```json
{
  "nama": "Muhammad Zaky",
  "divisi": "Dokumentasi",
  "status": "Aktif"
}
```

### PUT Anggota

```text
PUT http://localhost:3008/anggota/2
```

Body:

```json
{
  "nama": "Sandika Yusuf Permana",
  "divisi": "Humas",
  "status": "Aktif"
}
```

### PATCH Anggota

```text
PATCH http://localhost:3008/anggota/2
```

Body:

```json
{
  "status": "Tidak Aktif"
}
```

### DELETE Anggota

```text
DELETE http://localhost:3008/anggota/3
```

### POST Absensi

```text
POST http://localhost:3008/absensi
```

Body:

```json
{
  "anggotaId": 1,
  "tanggal": "2026-10-06",
  "status": "Hadir"
}
```

## 8. Status Code

| Status Code | Keterangan |
|---|---|
| 200 | Request berhasil |
| 201 | Data berhasil ditambahkan |
| 204 | Data berhasil dihapus tanpa body |
| 400 | Input tidak valid |
| 404 | Resource tidak ditemukan |

## 9. Hasil Pengujian

Pengujian RESTful API dilakukan menggunakan Postman.

### 9.1 GET Semua Anggota

**Method:** GET  
**Endpoint:** `/anggota`  
**Hasil:** `200 OK`

Berhasil menampilkan seluruh data anggota.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/01-get-semua-anggota.png)

---

### 9.2 GET Detail Anggota

**Method:** GET  
**Endpoint:** `/anggota/1`  
**Hasil:** `200 OK`

Berhasil menampilkan detail anggota berdasarkan ID.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/02-get-detail-anggota.png)

---

### 9.3 Filter Anggota

**Method:** GET  
**Endpoint:** `/anggota?divisi=Humas&status=Aktif`  
**Hasil:** `200 OK`

Berhasil melakukan filter berdasarkan dua query parameter.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/03-filter-anggota.png)

---

### 9.4 POST Anggota

**Method:** POST  
**Endpoint:** `/anggota`  
**Hasil:** `201 Created`

Berhasil menambahkan data anggota baru.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/04-post-anggota.png)

---

### 9.5 Validasi Input

**Method:** POST  
**Endpoint:** `/anggota`  
**Hasil:** `400 Bad Request`

Berhasil menolak data anggota yang tidak valid.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/05-post-validasi-400.png)

---

### 9.6 Resource Tidak Ditemukan

**Method:** GET  
**Endpoint:** `/anggota/999`  
**Hasil:** `404 Not Found`

Berhasil memberikan response 404 ketika anggota tidak ditemukan.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/06-get-not-found-404.png)

---

### 9.7 PUT Anggota

**Method:** PUT  
**Endpoint:** `/anggota/2`  
**Hasil:** `200 OK`

Berhasil mengubah seluruh data anggota.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/07-put-anggota.png)

---

### 9.8 PATCH Anggota

**Method:** PATCH  
**Endpoint:** `/anggota/2`  
**Hasil:** `200 OK`

Berhasil mengubah sebagian data anggota.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/08-patch-anggota.png)

---

### 9.9 DELETE Anggota

**Method:** DELETE  
**Endpoint:** `/anggota/2`  
**Hasil:** `204 No Content`

Berhasil menghapus data anggota tanpa response body.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/09-delete-anggota.png)

---

### 9.10 GET Absensi

**Method:** GET  
**Endpoint:** `/absensi`  
**Hasil:** `200 OK`

Berhasil menampilkan data absensi.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/10-get-absensi.png)

---

### 9.11 POST Absensi

**Method:** POST  
**Endpoint:** `/absensi`  
**Hasil:** `201 Created`

Berhasil menambahkan data absensi baru.

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/11-post-absensi.png)

## 10. Ringkasan Pengujian

| No | Pengujian | Status | Hasil |
|---|---|---|---|
| 1 | GET semua anggota | 200 | Berhasil |
| 2 | GET detail anggota | 200 | Berhasil |
| 3 | Filter anggota | 200 | Berhasil |
| 4 | POST anggota | 201 | Berhasil |
| 5 | Validasi input | 400 | Berhasil |
| 6 | Data tidak ditemukan | 404 | Berhasil |
| 7 | PUT anggota | 200 | Berhasil |
| 8 | PATCH anggota | 200 | Berhasil |
| 9 | DELETE anggota | 204 | Berhasil |
| 10 | GET absensi | 200 | Berhasil |
| 11 | POST absensi | 201 | Berhasil |

## 11. Kesimpulan

RESTful API berhasil dibuat menggunakan Express.js dengan resource Anggota dan Absensi. API telah menerapkan method HTTP GET, POST, PUT, PATCH, dan DELETE, route parameter, query parameter, validasi input, serta status code 200, 201, 204, 400, dan 404.

Pengujian menggunakan Postman menunjukkan bahwa endpoint yang dibuat dapat berjalan sesuai dengan fungsi masing-masing.