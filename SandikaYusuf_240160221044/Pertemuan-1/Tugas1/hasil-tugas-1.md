# Tugas 1 — Analisis dan Desain API

**Nama:** Sandika Yusuf Permana  
**NPM:** 240160221044

---

## 1. Deskripsi Sistem

Sistem Informasi Perpustakaan merupakan sistem yang dirancang untuk membantu petugas perpustakaan dalam mengelola data buku dan anggota secara terstruktur melalui API. Sistem menyediakan layanan untuk melihat, menambahkan, mengubah, dan menghapus data sesuai dengan operasi yang tersedia. Data buku mencakup informasi seperti ID, judul, penulis, tahun terbit, dan stok, sedangkan data anggota mencakup ID, nama, NIM, dan jurusan. Perancangan API ini bertujuan untuk memberikan gambaran mengenai bagaimana client berkomunikasi dengan backend melalui HTTP untuk mengelola data perpustakaan.

---

## 2. Diagram Arsitektur API

Diagram arsitektur menggambarkan alur komunikasi antara client, backend API, dan database pada Sistem Informasi Perpustakaan.

![Diagram Arsitektur API](diagram.png)

### Alur Komunikasi

1. Client mengirimkan HTTP Request kepada Backend API.
2. Backend API menerima dan memproses request dari client.
3. Backend API melakukan query atau pengolahan data pada database.
4. Database menyimpan dan menyediakan data buku serta anggota perpustakaan.
5. Backend API menerima data dari database.
6. Backend API mengirimkan HTTP Response kembali kepada client.

### Komponen Sistem

| Komponen | Fungsi |
|---|---|
| Client | Mengirim request dan menerima response dari API. Contohnya Web atau Postman. |
| Backend API | Memproses request dari client dan mengelola komunikasi dengan database. |
| Database | Menyimpan data buku dan anggota perpustakaan. |
| HTTP Request | Permintaan yang dikirim client kepada backend API. |
| HTTP Response | Respons yang dikirim backend API kepada client. |


## 3. Resource dan Endpoint

Sistem menggunakan dua resource utama, yaitu **Buku** dan **Anggota**.

### 3.1 Resource Buku

Resource Buku digunakan untuk mengelola data buku yang tersedia di perpustakaan.

| No | Operasi | Method | Endpoint | Request Body | Response Body | Sukses | Gagal |
|---:|---|---|---|---|---|---:|---:|
| 1 | Daftar buku | GET | `/buku` | - | Daftar buku | 200 | 500 |
| 2 | Detail buku | GET | `/buku/:id` | - | Detail buku | 200 | 404 |
| 3 | Tambah buku | POST | `/buku` | Data buku | Data buku | 201 | 400 |
| 4 | Ubah buku | PUT | `/buku/:id` | Data buku | Data buku | 200 | 400 / 404 |
| 5 | Hapus buku | DELETE | `/buku/:id` | - | - | 204 | 404 |

### 3.2 Resource Anggota

Resource Anggota digunakan untuk mengelola data anggota perpustakaan.

| No | Operasi | Method | Endpoint | Request Body | Response Body | Sukses | Gagal |
|---:|---|---|---|---|---|---:|---:|
| 6 | Daftar anggota | GET | `/anggota` | - | Daftar anggota | 200 | 500 |
| 7 | Detail anggota | GET | `/anggota/:id` | - | Detail anggota | 200 | 404 |
| 8 | Tambah anggota | POST | `/anggota` | Data anggota | Data anggota | 201 | 400 |

**Total endpoint: 8**

---

## 4. Struktur Data dan Contoh JSON

### 4.1 Resource Buku

Data buku terdiri dari:

- `id`
- `judul`
- `penulis`
- `tahun`
- `stok`

#### Contoh Request Body

Digunakan pada `POST /buku`:

```json
{
  "judul": "Belajar Node.js",
  "penulis": "Yosep Hidayat",
  "tahun": 2024,
  "stok": 5
}
```

#### Contoh Response Body

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": 1,
    "judul": "Belajar Node.js",
    "penulis": "Yosep Hidayat",
    "tahun": 2024,
    "stok": 5
  }
}
```

### 4.2 Resource Anggota

Data anggota terdiri dari:

- `id`
- `nama`
- `nim`
- `jurusan`

#### Contoh Request Body

Digunakan pada `POST /anggota`:

```json
{
  "nama": "Sandika",
  "nim": "240160221044",
  "jurusan": "FIKES"
}
```

#### Contoh Response Body

```json
{
  "success": true,
  "message": "Anggota berhasil ditambahkan",
  "data": {
    "id": 1,
    "nama": "Sandika",
    "nim": "240160221044",
    "jurusan": "FIKES"
  }
}
```

---

## 5. HTTP Status Code

Status code digunakan untuk menunjukkan hasil dari request yang dikirimkan oleh client.

| Status Code | Keterangan | Penggunaan |
|---:|---|---|
| 200 OK | Request berhasil diproses | GET dan PUT berhasil |
| 201 Created | Resource baru berhasil dibuat | POST berhasil |
| 204 No Content | Request berhasil dan tidak mengembalikan isi response | DELETE berhasil |
| 400 Bad Request | Request atau data yang dikirim tidak valid | POST atau PUT gagal karena data tidak valid |
| 404 Not Found | Resource yang diminta tidak ditemukan | GET, PUT, atau DELETE dengan ID yang tidak tersedia |
| 500 Internal Server Error | Terjadi kesalahan pada server | GET daftar data ketika terjadi masalah pada server |

---

## 6. Skenario Pengujian

### Skenario 1 — Mengambil Daftar Buku

**Request:**

```http
GET /buku
```

**Hasil yang diharapkan:**

```text
Status Code: 200 OK
```

Server mengembalikan daftar buku yang tersedia.

Contoh response:

```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "id": 1,
      "judul": "Belajar Node.js",
      "penulis": "Yosep Hidayat",
      "tahun": 2024,
      "stok": 5
    },
    {
      "id": 2,
      "judul": "Pemrograman Web",
      "penulis": "Dika Ruhiat",
      "tahun": 2023,
      "stok": 3
    }
  ]
}
```

---

### Skenario 2 — Menambahkan Buku

**Request:**

```http
POST /buku
```

**Request Body:**

```json
{
  "judul": "Belajar Node.js",
  "penulis": "Yosep Hidayat",
  "tahun": 2024,
  "stok": 5
}
```

**Hasil yang diharapkan:**

```text
Status Code: 201 Created
```

Server berhasil membuat resource buku baru dan mengembalikan data buku tersebut.

Contoh response:

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": 1,
    "judul": "Belajar Node.js",
    "penulis": "Yosep Hidayat",
    "tahun": 2024,
    "stok": 5
  }
}
```

---

### Skenario 3 — Mengakses Buku yang Tidak Ditemukan

**Request:**

```http
GET /buku/999
```

Diasumsikan buku dengan ID `999` tidak tersedia.

**Hasil yang diharapkan:**

```text
Status Code: 404 Not Found
```

Contoh response:

```json
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

Skenario ini merupakan contoh pengujian gagal untuk memastikan API dapat memberikan respons yang sesuai ketika resource yang diminta tidak ditemukan.

---

## 7. Kesimpulan

Perancangan API Sistem Informasi Perpustakaan terdiri dari dua resource utama, yaitu Buku dan Anggota, dengan total delapan endpoint. Endpoint dirancang menggunakan metode HTTP seperti GET, POST, PUT, dan DELETE sesuai dengan fungsi masing-masing operasi.

Perancangan juga mencakup struktur request dan response JSON, HTTP status code, serta skenario pengujian berhasil dan gagal. Dengan rancangan ini, komunikasi antara client, backend API, dan database dapat digambarkan secara terstruktur sebelum API diimplementasikan ke dalam program.
