# Tugas Kelompok — Pertemuan 5
## Perancangan RESTful API dengan Express.js

## Anggota Kelompok 1

1. Della Kartika
2. Nadya Zahra Aulia
3. Rico Muhammad F
4. Nabilla Natasya Putri

---

# 1. Identifikasi Resource

Pada Pertemuan 5, pembelajaran berfokus pada perancangan RESTful API menggunakan Express.js. Perancangan dilakukan dengan menentukan resource, endpoint, method HTTP, parameter, status code, dan struktur response JSON yang konsisten.

Domain yang digunakan adalah **Sistem Informasi Perpustakaan**.

Sistem ini digunakan untuk mengelola informasi buku, data anggota, dan transaksi peminjaman buku.

### 1.1 Daftar Resource

| No. | Resource | Fungsi |
|---|---|---|
| 1 | `buku` | Mengelola data buku yang tersedia di perpustakaan. |
| 2 | `anggota` | Mengelola data anggota perpustakaan. |
| 3 | `peminjaman` | Mengelola transaksi peminjaman buku oleh anggota. |

Resource menggunakan kata benda agar URL lebih ringkas, konsisten, dan mudah dipahami oleh client.

Contoh endpoint yang digunakan:

```text
/buku
/anggota
/peminjaman
```

### 1.2 Alasan Pemilihan Resource

Resource `buku` digunakan untuk mengelola koleksi buku, `anggota` digunakan untuk mengelola identitas anggota perpustakaan, sedangkan `peminjaman` digunakan untuk mencatat transaksi peminjaman.

Ketiga resource tersebut mewakili data utama dalam sistem perpustakaan dan dapat dikembangkan menggunakan operasi RESTful API.

---

# 2. Perancangan Kontrak Endpoint

Kontrak endpoint menjelaskan hubungan antara method HTTP, URL, request body, status code, dan response yang diterima client.

Pada rancangan ini, resource `buku` digunakan sebagai contoh utama untuk operasi membaca, menambahkan, mengubah, dan menghapus data.

## 2.1 Tabel Rancangan Endpoint

| No. | Kebutuhan | Method | Endpoint | Request Body | Status Code |
|---|---|---|---|---|---|
| 1 | Mengambil semua buku | GET | `/buku` | Tidak ada | 200 OK |
| 2 | Mengambil detail buku | GET | `/buku/:id` | Tidak ada | 200 OK |
| 3 | Menambahkan buku | POST | `/buku` | Data buku baru | 201 Created |
| 4 | Mengubah seluruh data buku | PUT | `/buku/:id` | Seluruh field buku | 200 OK |
| 5 | Mengubah sebagian data buku | PATCH | `/buku/:id` | Field yang diubah | 200 OK |
| 6 | Menghapus buku | DELETE | `/buku/:id` | Tidak ada | 204 No Content |

Status code `400 Bad Request` digunakan ketika input tidak valid, sedangkan `404 Not Found` digunakan ketika buku yang diminta tidak ditemukan.

## 2.2 Struktur Data Buku

Data buku memiliki atribut sebagai berikut:

```json
{
  "judul": "Designing Data-Intensive Applications",
  "penulis": "Martin Kleppmann",
  "tahun": 2017,
  "stok": 4
}
```

Keterangan:

- `judul`: judul buku.
- `penulis`: nama penulis buku.
- `tahun`: tahun terbit buku.
- `stok`: jumlah buku yang tersedia.

ID buku dibuat oleh server ketika data baru ditambahkan.

---

# 3. Contoh Request dan Response

## 3.1 Mengambil Semua Buku

**Method:**

```text
GET
```

**URL:**

```text
http://localhost:3006/buku
```

**Request Body:** Tidak ada.

**Status Code:**

```text
200 OK
```

**Response JSON:**

```json
{
  "success": true,
  "message": "Daftar buku berhasil diambil",
  "data": [
    {
      "id": 1,
      "judul": "Designing Data-Intensive Applications",
      "penulis": "Martin Kleppmann",
      "tahun": 2017,
      "stok": 4
    }
  ]
}
```

**Keterangan:**

Request berhasil karena endpoint `/buku` digunakan untuk mengambil daftar buku. Server mengembalikan data dalam format JSON dengan status `200 OK`.

## 3.2 Mengambil Detail Buku

**Method:**

```text
GET
```

**URL:**

```text
http://localhost:3006/buku/1
```

**Request Body:** Tidak ada.

**Status Code:**

```text
200 OK
```

**Response JSON:**

```json
{
  "success": true,
  "message": "Detail buku berhasil diambil",
  "data": {
    "id": 1,
    "judul": "Designing Data-Intensive Applications",
    "penulis": "Martin Kleppmann",
    "tahun": 2017,
    "stok": 4
  }
}
```

**Keterangan:**

Route parameter `:id` digunakan untuk menentukan buku yang ingin ditampilkan. Pada request tersebut, ID `1` digunakan untuk mengambil detail buku dengan ID yang sesuai.

## 3.3 Menambahkan Buku

**Method:**

```text
POST
```

**URL:**

```text
http://localhost:3006/buku
```

**Request Body:**

```json
{
  "judul": "Express in Action",
  "penulis": "Evan Hahn",
  "tahun": 2016,
  "stok": 2
}
```

**Status Code:**

```text
201 Created
```

**Response JSON:**

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": 2,
    "judul": "Express in Action",
    "penulis": "Evan Hahn",
    "tahun": 2016,
    "stok": 2
  }
}
```

**Keterangan:**

Request berhasil menambahkan buku baru. Server memberikan ID kepada buku yang dibuat dan mengembalikan status `201 Created`.

## 3.4 Mengubah Seluruh Data Buku

**Method:**

```text
PUT
```

**URL:**

```text
http://localhost:3006/buku/1
```

**Request Body:**

```json
{
  "judul": "Designing Data-Intensive Applications Edisi-2",
  "penulis": "Martin Kleppmann",
  "tahun": 2017,
  "stok": 4
}
```

**Status Code:**

```text
200 OK
```

**Response JSON:**

```json
{
  "success": true,
  "message": "Data buku berhasil diperbarui",
  "data": {
    "id": 1,
    "judul": "Designing Data-Intensive Applications Edisi-2",
    "penulis": "Martin Kleppmann",
    "tahun": 2017,
    "stok": 4
  }
}
```

**Keterangan:**

Method `PUT` digunakan untuk mengganti representasi data buku secara keseluruhan. Request mengirimkan semua field yang diperlukan sesuai kontrak API.

## 3.5 Mengubah Sebagian Data Buku

**Method:**

```text
PATCH
```

**URL:**

```text
http://localhost:3006/buku/1
```

**Request Body:**

```json
{
  "stok": 2
}
```

**Status Code:**

```text
200 OK
```

**Response JSON:**

```json
{
  "success": true,
  "message": "Stok buku berhasil diperbarui",
  "data": {
    "id": 1,
    "judul": "Designing Data-Intensive Applications Edisi-2",
    "penulis": "Martin Kleppmann",
    "tahun": 2017,
    "stok": 2
  }
}
```

**Keterangan:**

Method `PATCH` digunakan untuk memperbarui sebagian data tanpa harus mengirimkan seluruh field buku. Pada contoh ini, hanya stok yang diubah.

## 3.6 Menghapus Buku

**Method:**

```text
DELETE
```

**URL:**

```text
http://localhost:3006/buku/1
```

**Request Body:** Tidak ada.

**Status Code:**

```text
204 No Content
```

**Response Body:** Tidak ada.

**Keterangan:**

Method `DELETE` digunakan untuk menghapus buku berdasarkan ID. Jika penghapusan berhasil, server memberikan status `204 No Content` tanpa response body.

---

# 4. Penggunaan Query Parameter untuk Filter

Query parameter digunakan untuk menyaring data berdasarkan kriteria tertentu tanpa mengubah identitas resource collection.

## 4.1 Filter Berdasarkan Penulis

**Method:** `GET`

**URL:**

```text
http://localhost:3006/buku?penulis=MartinKleppmann
```

**Keterangan:**

Request mengambil buku yang memiliki nama penulis Martin Kleppmann.

## 4.2 Filter Berdasarkan Stok Minimum

**Method:** `GET`

**URL:**

```text
http://localhost:3006/buku?minStok=2
```

**Keterangan:**

Request mengambil buku dengan jumlah stok minimal dua.

## 4.3 Menggunakan Dua Filter

**Method:** `GET`

**URL:**

```text
http://localhost:3006/buku?penulis=MartinKleppmann&minStok=2
```

**Keterangan:**

Request mengambil buku yang ditulis oleh Andi dan memiliki stok minimal dua.

Query parameter perlu divalidasi agar nilai yang tidak sesuai, seperti `minStok=abc`, tidak diproses sebagai jumlah stok yang valid.

---

# 5. Pengujian Kondisi Error

Selain request yang berhasil, API perlu menangani input tidak valid dan resource yang tidak ditemukan.

## 5.1 Input Tidak Valid

**Method:** `POST`

**URL:**

```text
http://localhost:3006/buku
```

**Request Body:**

```json
{
  "judul": "",
  "penulis": "Martin Kleppmann",
  "tahun": 2017,
  "stok": -2
}
```

**Status Code:**

```text
400 Bad Request
```

**Response JSON:**

```json
{
  "success": false,
  "message": "Data buku tidak valid",
  "details": [
    "Field judul wajib diisi",
    "stok harus bilangan bulat minimal 0"
  ]
}
```

**Keterangan:**

Request ditolak karena judul kosong dan nilai stok kurang dari nol. Validasi mencegah data yang tidak sesuai kontrak dimasukkan ke penyimpanan.

## 5.2 Buku Tidak Ditemukan

**Method:** `GET`

**URL:**

```text
http://localhost:3006/buku/99
```

**Status Code:**

```text
404 Not Found
```

**Response JSON:**

```json
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

**Keterangan:**

ID `99` tidak ditemukan dalam data buku sehingga server memberikan status `404 Not Found`.

---

# 6. Rekapitulasi Rancangan dan Pengujian

| No. | Method | Endpoint | Kondisi | Status Code |
|---|---|---|---|---|
| 1 | GET | `/buku` | Mengambil daftar buku | 200 |
| 2 | GET | `/buku/1` | Mengambil detail buku | 200 |
| 3 | POST | `/buku` | Menambahkan buku | 201 |
| 4 | PUT | `/buku/1` | Mengubah seluruh data | 200 |
| 5 | PATCH | `/buku/1` | Mengubah sebagian data | 200 |
| 6 | DELETE | `/buku/1` | Menghapus buku | 204 |
| 7 | POST | `/buku` | Input tidak valid | 400 |
| 8 | GET | `/buku/99` | Buku tidak ditemukan | 404 |
| 9 | GET | `/buku?penulis=Martin Kleppmann` | Filter berdasarkan penulis | 200 jika request valid |
| 10 | GET | `/buku?minStok=2` | Filter berdasarkan stok | 200 jika request valid |

**Catatan:** Tabel ini merupakan rancangan kontrak dan hasil yang diharapkan. Status code serta response aktual perlu dicocokkan kembali setelah endpoint diimplementasikan dan diuji.

---

# 7. Alasan Penggunaan Method HTTP dan Status Code

Method HTTP dipilih berdasarkan operasi yang dilakukan terhadap resource.

- **GET** digunakan untuk membaca daftar atau detail buku.
- **POST** digunakan untuk membuat resource buku baru.
- **PUT** digunakan untuk mengganti seluruh representasi data buku.
- **PATCH** digunakan untuk mengubah sebagian field buku.
- **DELETE** digunakan untuk menghapus buku berdasarkan ID.

Status code digunakan untuk menjelaskan hasil pemrosesan request.

- **200 OK** menunjukkan request berhasil diproses.
- **201 Created** menunjukkan resource baru berhasil dibuat.
- **204 No Content** menunjukkan operasi berhasil tanpa response body.
- **400 Bad Request** menunjukkan request memiliki input yang tidak valid.
- **404 Not Found** menunjukkan resource yang diminta tidak ditemukan.
- **500 Internal Server Error** digunakan jika terjadi kesalahan server yang tidak tertangani.

Penggunaan method HTTP dan status code yang sesuai membuat client lebih mudah memahami hasil request dan menentukan tindakan selanjutnya.

---

# 8. Alasan Penggunaan Route Parameter dan Query Parameter

Route parameter digunakan ketika client ingin mengakses resource tertentu.

Contoh:

```text
GET /buku/1
```

Angka `1` merupakan ID buku yang ingin diakses.

Query parameter digunakan ketika client ingin menyaring data dalam suatu collection.

Contoh:

```text
GET /buku?penulis=MartinKleppmann&minStok=2
```

Request tersebut menyaring buku berdasarkan nama penulis dan jumlah stok minimal.

Dengan pemisahan tersebut, URL memiliki fungsi yang jelas: route parameter mengidentifikasi resource, sedangkan query parameter menentukan kriteria pencarian atau filter.

---

# 9. Konsistensi Response JSON

Response JSON dirancang menggunakan struktur yang konsisten agar mudah diproses oleh client.

Contoh response sukses:

```json
{
  "success": true,
  "message": "Data berhasil diproses",
  "data": {}
}
```

Contoh response error:

```json
{
  "success": false,
  "message": "Data tidak valid",
  "details": [
    "Field judul wajib diisi"
  ]
}
```

Field `success` menunjukkan keberhasilan request, `message` memberikan keterangan singkat, `data` memuat hasil operasi, sedangkan `details` dapat digunakan untuk menjelaskan kesalahan validasi.

Pada response `204 No Content`, server tidak mengirimkan body JSON.

---

# 10. Kesimpulan

Berdasarkan aktivitas kelompok pada Pertemuan 5, perancangan RESTful API dimulai dengan mengidentifikasi resource, menentukan endpoint, memilih method HTTP, menetapkan parameter, serta merancang status code dan response JSON.

Pada domain Sistem Informasi Perpustakaan, resource yang digunakan adalah buku, anggota, dan peminjaman. Resource buku dirancang untuk mendukung operasi GET, POST, PUT, PATCH, dan DELETE.

Penggunaan route parameter membantu client mengakses resource berdasarkan ID, sedangkan query parameter digunakan untuk melakukan filter data. Validasi input dan penggunaan status code yang tepat membantu API menangani request yang berhasil maupun gagal