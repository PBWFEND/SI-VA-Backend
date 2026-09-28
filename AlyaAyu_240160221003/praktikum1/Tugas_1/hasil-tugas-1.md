# Tugas 1 — Analisis dan Desain API

**Nama:** Alya Ayu  
**NPM:** 240160221003

---

## 1. Deskripsi Sistem

Sistem Informasi Perpustakaan merupakan sistem yang digunakan untuk membantu petugas dalam mengelola data buku dan anggota perpustakaan melalui API. Sistem menyediakan beberapa layanan seperti melihat data, menambahkan data, memperbarui data, serta menghapus data sesuai kebutuhan. Data buku mencakup informasi seperti ID, kode buku, judul, kategori, penerbit, tahun terbit, dan jumlah tersedia. Sementara itu, data anggota mencakup ID, nama, NIM, program studi, dan nomor telepon. API digunakan sebagai penghubung antara client dengan backend sehingga proses pengelolaan data perpustakaan dapat dilakukan secara terstruktur.

---

## 2. Diagram Arsitektur API

Diagram arsitektur menggambarkan proses komunikasi antara client, backend API, dan database pada Sistem Informasi Perpustakaan.

![Diagram Arsitektur API](diagram.iopng)

### Alur Komunikasi

1. Client mengirimkan HTTP Request kepada Backend API.
2. Backend API menerima dan memproses request yang dikirimkan oleh client.
3. Backend API melakukan proses pengambilan atau perubahan data pada database.
4. Database menyimpan data buku dan data anggota perpustakaan.
5. Backend API menerima hasil pengolahan data dari database.
6. Backend API mengirimkan HTTP Response kepada client.

### Komponen Sistem

| Komponen | Fungsi |
|---|---|
| Client | Mengirimkan request dan menerima response dari API, misalnya melalui Web atau Postman. |
| Backend API | Memproses request dan mengatur komunikasi antara client dengan database. |
| Database | Menyimpan data buku dan anggota perpustakaan. |
| HTTP Request | Permintaan yang dikirimkan client kepada backend API. |
| HTTP Response | Respons yang diberikan backend API kepada client. |

### File Diagram

- [Lihat file sumber diagram (diagram.iopng)](SistemInformasiPerpustakaan.diagram.iopng)
---

## 3. Resource dan Endpoint

Sistem Informasi Perpustakaan menggunakan dua resource utama, yaitu **Buku** dan **Anggota**, Kedua resource tersebut menyediakan endprint untuk melihat, menambahkan, memperbarui, dan menghapus data.
### 3.1 Resource Buku

Resource Buku digunakan untuk mengelola informasi koleksi buku yang tersedia di perpustakaan.

| No | Operasi | Method | Endpoint | Request Body | Response Body | Sukses | Gagal |
|---:|---|---|---|---|---|---:|---:|
| 1 | Melihat seluruh buku | GET | `/buku` | - | Daftar buku | 200 | 500 |
| 2 | Melihat detail buku | GET | `/buku/:id` | - | Detail buku | 200 | 404 |
| 3 | Menambahkan buku | POST | `/buku` | Data buku | Data buku | 201 | 400 |
| 4 | Memperbarui buku | PUT | `/buku/:id` | Data buku | Data buku | 200 | 400 / 404 |
| 5 | Menghapus buku | DELETE | `/buku/:id` | - | - | 204 | 404 |

### 3.2 Resource Anggota

Resource Anggota digunakan untuk mengelola data pengguna yang terdaftar sebagai anggota perpustakaan.

| No | Operasi | Method | Endpoint | Request Body | Response Body | Sukses | Gagal |
|---:|---|---|---|---|---|---:|---:|
| 6 | Melihat seluruh anggota | GET | `/anggota` | - | Daftar anggota | 200 | 500 |
| 7 | Melihat detail anggota | GET | `/anggota/:id` | - | Detail anggota | 200 | 404 |
| 8 | Menambahkan anggota | POST | `/anggota` | Data anggota | Data anggota | 201 | 400 |

**Total endpoint: 8**


---

## 4. Struktur Data dan Contoh JSON

### 4.1 Resource Buku

Data buku terdiri dari:
- `id`
- `kode_buku`
- `judul`
- `kategori`
- `penerbit`
- `tahun_terbit`
- `jumlah_tersedia`

#### Contoh Request Body

Digunakan pada `POST /buku`:

```json
{
  "kode_buku": "BK-001",
  "judul": "Atomic Habits",
  "kategori": "Pengembangan Diri",
  "penerbit": "Gramedia",
  "tahun_terbit": 2019,
  "jumlah_tersedia": 4
}

```

### 4.2 Resource Anggota

Data anggota terdiri dari:

- `id`
- `nama`
- `nim`
- `program_studi`
- `no_telepon`

#### Contoh Request Body

Digunakan pada `POST /anggota`:

```json
{
  "nama": "Alya Ayu",
  "nim": "240160221003",
  "program_studi": "Sistem Informasi",
  "no_telepon": "081234567890"
}
```

#### Contoh Response Body

```json
{
  {
  "success": true,
  "message": "Data anggota berhasil ditambahkan",
  "data": {
    "id": 1,
    "nama": "Alya Ayu",
    "nim": "240160221003",
    "program_studi": "Sistem Informasi",
    "no_telepon": "081234567890"
  }
}
  }

```

---

## 5. HTTP Status Code

HTTP status code digunakan untuk menunjukkan hasil dari request yang dikirimkan client kepada server.

| Status Code | Keterangan | Penggunaan |
|---:|---|---|
| 200 OK | Request berhasil diproses | GET dan PUT berhasil |
| 201 Created | Data baru berhasil dibuat | POST berhasil |
| 204 No Content | Request berhasil tanpa response body | DELETE berhasil |
| 400 Bad Request | Data atau request yang dikirim tidak sesuai | POST atau PUT gagal |
| 404 Not Found | Data yang diminta tidak ditemukan | GET, PUT, atau DELETE dengan ID yang tidak tersedia |
| 500 Internal Server Error | Terjadi kesalahan pada sisi server | GET data ketika server mengalami masalah |

---

## 6. Skenario Pengujian

### Skenario 1 — Melihat Daftar Buku

**Request:**

```http
GET /buku
```

**Hasil yang diharapkan:**

```text
Status Code: 200 OK
```

Server mengembalikan daftar buku yang tersedia di perpustakaan.

Contoh response:

```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "id": 1,
      "kode_buku": "BK-001",
      "judul": "Atomic Habits",
      "kategori": "Pengembangan Diri",
      "penerbit": "Gramedia",
      "tahun_terbit": 2019,
      "jumlah_tersedia": 4
    },
    {
      "id": 2,
      "kode_buku": "BK-002",
      "judul": "Laskar Pelangi",
      "kategori": "Novel",
      "penerbit": "Bentang Pustaka",
      "tahun_terbit": 2005,
      "jumlah_tersedia": 2
    }
  ]
}
```

---

### Skenario 2 — Menambahkan Buku

**Request:**

```http
POST /anggota
```

**Request Body:**

```json
{
  {
  "nama": "Alya Ayu",
  "nim": "240160221003",
  "program_studi": "Sistem Informasi",
  "no_telepon": "081234567890"
}
}
```

**Hasil yang diharapkan:**

```text
Status Code: 201 Created
```

Server berhasil menyimpan data anggota baru dan mengembalikan data anggota tersebut.

Contoh response:

```json
{
  "success": true,
  "message": "Data anggota berhasil ditambahkan",
  "data": {
    "id": 2,
    "nama": "Alya Ayu",
    "nim": "240160221003",
    "program_studi": "Sistem Informasi",
    "no_telepon": "081234567890"
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

Skenario ini digunakan untuk menguji kondisi ketika client meminta data buku dengan ID yang tidak tersedia di dalam database.

---

## 7. Kesimpulan

Perancangan API Sistem Informasi Perpustakaan menggunakan dua resource utama, yaitu Buku dan Anggota, dengan total delapan endpoint. Setiap endpoint menggunakan metode HTTP yang disesuaikan dengan kebutuhan pengelolaan data, seperti GET untuk mengambil data, POST untuk menambahkan data, PUT untuk memperbarui data, dan DELETE untuk menghapus data.

Perancangan API juga mencakup struktur data dalam bentuk JSON, HTTP status code, serta beberapa skenario pengujian untuk memastikan request berhasil maupun menangani kondisi ketika data tidak ditemukan. Dengan rancangan tersebut, proses komunikasi antara client, backend API, dan database dapat digambarkan dengan lebih terstruktur sebelum API dikembangkan ke tahap implementasi.
