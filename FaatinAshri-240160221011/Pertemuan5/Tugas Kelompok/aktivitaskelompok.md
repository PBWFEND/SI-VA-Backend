# AKTIVITAS KELOMPOK — PERTEMUAN 5 Perancangan RESTful API Sistem Informasi Perpustakaan

## Anggota Kelompok 6

1. Dadika Yudiana — 240160221006
2. Faatin Ashri Widiatin — 240160221011
3. Marsya Nurdrianti — 240160221022

## 1. Deskripsi Sistem

**Sistem Informasi Perpustakaan** merupakan sistem berbasis API yang dirancang untuk membantu pengelolaan operasional perpustakaan. Sistem ini digunakan untuk mengelola data buku, data anggota, serta aktivitas peminjaman dan pengembalian buku.

Sistem memiliki tiga resource utama:

1. **Buku**: mengelola informasi koleksi buku perpustakaan.
2. **Anggota**: mengelola informasi anggota yang terdaftar di perpustakaan.
3. **Peminjaman**: mencatat transaksi peminjaman dan pengembalian buku.

API menggunakan arsitektur REST dengan HTTP Method untuk menjalankan operasi CRUD (Create, Read, Update, Delete). Data dikirim dan diterima menggunakan format JSON.

## 2. Identifikasi Resource

| Resource | Deskripsi | Contoh atribut |
|---|---|---|
| `buku` | Menyimpan informasi koleksi buku | id, judul, penulis, kategori, tahun_terbit, stok |
| `anggota` | Menyimpan informasi anggota perpustakaan | id, nama, alamat, email, no_telepon |
| `peminjaman` | Menyimpan transaksi peminjaman dan pengembalian | id, buku_id, anggota_id, tanggal_pinjam, tenggat_kembali, tanggal_dikembalikan, status |

Nama resource menggunakan kata benda, bukan kata kerja. Contohnya menggunakan `/buku`, bukan `/ambilBuku`.

## 3. Rancangan Kontrak Endpoint

Semua endpoint menggunakan prefix `/api`.

### A. Resource Buku

| No. | Operasi | Method | Endpoint | Request Body | Sukses | Gagal |
|---:|---|---|---|---|---|---|
| 1 | Mengambil seluruh buku | GET | `/api/buku` | - | 200 | 500 |
| 2 | Mengambil detail buku | GET | `/api/buku/:id` | - | 200 | 404 |
| 3 | Menambahkan buku | POST | `/api/buku` | Data buku lengkap | 201 | 400 |
| 4 | Memperbarui seluruh data buku | PUT | `/api/buku/:id` | Data buku lengkap | 200 | 400, 404 |
| 5 | Memperbarui sebagian data buku | PATCH | `/api/buku/:id` | Field yang diubah | 200 | 400, 404 |
| 6 | Menghapus buku | DELETE | `/api/buku/:id` | - | 204 | 404 |

**Contoh request body buku:**

```json
{
  "judul": "Laskar Pelangi",
  "penulis": "Andrea Hirata",
  "kategori": "Novel",
  "tahun_terbit": 2005,
  "stok": 5
}
```

### B. Resource Anggota

| No. | Operasi | Method | Endpoint | Request Body | Sukses | Gagal |
|---:|---|---|---|---|---|---|
| 1 | Mengambil seluruh anggota | GET | `/api/anggota` | - | 200 | 500 |
| 2 | Mengambil detail anggota | GET | `/api/anggota/:id` | - | 200 | 404 |
| 3 | Menambahkan anggota | POST | `/api/anggota` | Data anggota lengkap | 201 | 400 |
| 4 | Memperbarui seluruh data anggota | PUT | `/api/anggota/:id` | Data anggota lengkap | 200 | 400, 404 |
| 5 | Memperbarui sebagian data anggota | PATCH | `/api/anggota/:id` | Field yang diubah | 200 | 400, 404 |
| 6 | Menghapus anggota | DELETE | `/api/anggota/:id` | - | 204 | 404 |

**Contoh request body anggota:**

```json
{
  "nama": "Budi Santoso",
  "alamat": "Jl. Merdeka No. 10",
  "email": "budi@example.com",
  "no_telepon": "081234567890"
}
```

### C. Resource Peminjaman

| No. | Operasi | Method | Endpoint | Request Body | Sukses | Gagal |
|---:|---|---|---|---|---|---|
| 1 | Mengambil seluruh peminjaman | GET | `/api/peminjaman` | - | 200 | 500 |
| 2 | Mengambil detail peminjaman | GET | `/api/peminjaman/:id` | - | 200 | 404 |
| 3 | Mencatat peminjaman baru | POST | `/api/peminjaman` | Data peminjaman | 201 | 400, 404 |
| 4 | Memperbarui seluruh data peminjaman | PUT | `/api/peminjaman/:id` | Data peminjaman lengkap | 200 | 400, 404 |
| 5 | Memperbarui sebagian data peminjaman | PATCH | `/api/peminjaman/:id` | Field yang diubah | 200 | 400, 404 |
| 6 | Menghapus data peminjaman | DELETE | `/api/peminjaman/:id` | - | 204 | 404 |

**Contoh request body peminjaman:**

```json
{
  "buku_id": 1,
  "anggota_id": 1,
  "tanggal_pinjam": "2026-09-20",
  "tenggat_kembali": "2026-09-27"
}
```

Status awal peminjaman ditentukan oleh sistem, yaitu `DIPINJAM`.

## 4. Standar Struktur Response JSON

Agar response API konsisten, setiap response yang memiliki body menggunakan struktur berikut.

### A. Response Berhasil

```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": {}
}
```

### B. Response Gagal

```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

### C. Response Validasi Gagal

```json
{
  "success": false,
  "message": "Data tidak valid",
  "details": [
    "Field judul wajib diisi",
    "Stok harus berupa bilangan bulat minimal 0"
  ]
}
```

### D. Response Penghapusan Berhasil

Penghapusan yang berhasil menggunakan status `204 No Content`, sehingga server tidak mengirimkan response body.

## 5. HTTP Status Code

| Status Code | Keterangan | Penggunaan |
|---|---|---|
| 200 OK | Request berhasil diproses | GET, PUT, dan PATCH berhasil |
| 201 Created | Resource baru berhasil dibuat | POST berhasil |
| 204 No Content | Resource berhasil dihapus | DELETE berhasil |
| 400 Bad Request | Request atau data input tidak valid | Field wajib kosong atau tipe data salah |
| 404 Not Found | Resource tidak ditemukan | ID buku, anggota, atau peminjaman tidak tersedia |
| 500 Internal Server Error | Terjadi kesalahan pada server | Kesalahan internal saat memproses request |

## 6. Pengujian API Menggunakan CURL 
Pengujian API dirancang menggunakan perintah `curl` melalui terminal Visual Studio Code. Server diasumsikan berjalan pada alamat `http://localhost:3000`.

Setiap request menggunakan header `Content-Type: application/json` jika mengirimkan JSON. Opsi `-i` digunakan untuk menampilkan HTTP Status Code beserta response header.

### Persiapan

Jalankan server API terlebih dahulu. Setelah server aktif, buka terminal VS Code dan gunakan perintah berikut:

```bash
curl -i http://localhost:3000/api/buku
```

### Skenario 1 — Menambahkan Buku Baru

**Request di Terminal VS Code:**

```bash
curl -i -X POST http://localhost:3000/api/buku \
-H "Content-Type: application/json" \
-d '{
  "judul": "Filosofi Teras",
  "penulis": "Henry Manampiring",
  "kategori": "Filsafat",
  "tahun_terbit": 2019,
  "stok": 3
}'
```

**Output Terminal:**

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": 1,
    "judul": "Filosofi Teras",
    "penulis": "Henry Manampiring",
    "kategori": "Filsafat",
    "tahun_terbit": 2019,
    "stok": 3
  }
}
```

**Keterangan:** Data buku berhasil ditambahkan ke dalam sistem dengan status `201 Created`.

### Skenario 2 — Mengambil Seluruh Data Buku

**Request di Terminal VS Code:**

```bash
curl -i http://localhost:3000/api/buku
```

**Output Terminal:**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "message": "Daftar buku berhasil diambil",
  "data": {
    "total": 1,
    "data": [
      {
        "id": 1,
        "judul": "Filosofi Teras",
        "penulis": "Henry Manampiring",
        "kategori": "Filsafat",
        "tahun_terbit": 2019,
        "stok": 3
      }
    ]
  }
}
```

**Keterangan:** Server berhasil menampilkan daftar buku yang tersedia dengan status `200 OK`.

### Skenario 3 — Mengambil Detail Buku yang Tidak Ada

**Request di Terminal VS Code:**

```bash
curl -i http://localhost:3000/api/buku/999
```

**Output Terminal:**

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "success": false,
  "message": "Buku dengan ID 999 tidak ditemukan"
}
```

**Keterangan:** Data buku dengan ID 999 tidak ditemukan sehingga server mengembalikan status `404 Not Found`.

### Skenario 4 — Menambahkan Anggota Perpustakaan

**Request di Terminal VS Code:**

```bash
curl -i -X POST http://localhost:3000/api/anggota \
-H "Content-Type: application/json" \
-d '{
  "nama": "Budi Santoso",
  "alamat": "Jl. Merdeka No. 10",
  "email": "budi@example.com",
  "no_telepon": "081234567890"
}'
```

**Output Terminal:**

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "success": true,
  "message": "Anggota berhasil didaftarkan",
  "data": {
    "id": 1,
    "nama": "Budi Santoso",
    "alamat": "Jl. Merdeka No. 10",
    "email": "budi@example.com",
    "no_telepon": "081234567890"
  }
}
```

**Keterangan:** Anggota baru berhasil didaftarkan dengan status `201 Created`.

### Skenario 5 — Mencatat Peminjaman Buku

**Request di Terminal VS Code:**

```bash
curl -i -X POST http://localhost:3000/api/peminjaman \
-H "Content-Type: application/json" \
-d '{
  "buku_id": 1,
  "anggota_id": 1,
  "tanggal_pinjam": "2026-09-20",
  "tenggat_kembali": "2026-09-27"
}'
```

**Output Terminal:**

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "success": true,
  "message": "Peminjaman berhasil dicatat",
  "data": {
    "id": 1,
    "buku_id": 1,
    "anggota_id": 1,
    "tanggal_pinjam": "2026-09-20",
    "tenggat_kembali": "2026-09-27",
    "tanggal_dikembalikan": null,
    "status": "DIPINJAM"
  }
}
```

**Keterangan:** Transaksi peminjaman berhasil dicatat dengan status awal `DIPINJAM` dan HTTP Status Code `201 Created`.

### Skenario 6 — Memperbarui Status Pengembalian Buku

**Request di Terminal VS Code:**

```bash
curl -i -X PATCH http://localhost:3000/api/peminjaman/1 \
-H "Content-Type: application/json" \
-d '{
  "tanggal_dikembalikan": "2026-09-25",
  "status": "DIKEMBALIKAN"
}'
```

**Output Terminal:**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "message": "Pengembalian buku berhasil dicatat",
  "data": {
    "id": 1,
    "buku_id": 1,
    "anggota_id": 1,
    "tanggal_pinjam": "2026-09-20",
    "tenggat_kembali": "2026-09-27",
    "tanggal_dikembalikan": "2026-09-25",
    "status": "DIKEMBALIKAN"
  }
}
```

**Keterangan:** Data peminjaman berhasil diperbarui menggunakan metode PATCH dengan status `200 OK`.

## 7. Aturan Validasi Data

Untuk menjaga konsistensi data, API menerapkan beberapa aturan validasi:

### A. Validasi Buku
- Judul, penulis, dan kategori wajib diisi.
- Tahun terbit harus berupa bilangan bulat.
- Stok harus berupa bilangan bulat minimal 0.

### B. Validasi Anggota
- Nama, alamat, email, dan nomor telepon wajib diisi.
- Email harus memiliki format yang valid.
- Nomor telepon disimpan sebagai teks yang berisi nomor kontak.

### C. Validasi Peminjaman
- `buku_id` harus mengacu pada buku yang tersedia.
- `anggota_id` harus mengacu pada anggota yang terdaftar.
- Tanggal peminjaman dan tenggat pengembalian wajib diisi.
- Tenggat pengembalian tidak boleh lebih awal dari tanggal peminjaman.
- Buku hanya dapat dipinjam jika stok tersedia.
- Status peminjaman menggunakan nilai `DIPINJAM` atau `DIKEMBALIKAN`.

Jika data tidak memenuhi aturan validasi, API mengembalikan status `400 Bad Request`. Jika ID yang diminta tidak ditemukan, API mengembalikan status `404 Not Found`.

## 8. Alasan Pemilihan Endpoint dan Struktur JSON

Perancangan endpoint menggunakan prinsip RESTful API dengan beberapa pertimbangan teknis:

1. **Resource menggunakan kata benda:** Nama endpoint seperti `/buku`, `/anggota`, dan `/peminjaman` menunjukkan objek yang dikelola oleh sistem.
2. **HTTP Method sesuai fungsi:** GET digunakan untuk membaca data, POST untuk membuat data, PUT untuk memperbarui seluruh data, PATCH untuk memperbarui sebagian data, dan DELETE untuk menghapus data.
3. **Parameter ID:** Penggunaan `:id` membantu server mengidentifikasi satu resource tertentu.
4. **Struktur JSON konsisten:** Properti `success`, `message`, dan `data` membuat response lebih mudah dipahami oleh client.
5. **Status code sesuai hasil operasi:** Setiap request memberikan status code yang menggambarkan hasil pemrosesan server.
6. **Relasi antar-resource:** Data peminjaman menggunakan `buku_id` dan `anggota_id` untuk menghubungkan transaksi dengan buku dan anggota yang terkait.

## 9. Kesimpulan

Perancangan RESTful API Sistem Informasi Perpustakaan menghasilkan tiga resource utama, yaitu `buku`, `anggota`, dan `peminjaman`. Ketiga resource tersebut memiliki endpoint untuk operasi GET, POST, PUT, PATCH, dan DELETE.

Rancangan ini menerapkan penggunaan HTTP Method sesuai fungsinya, struktur response JSON yang konsisten, validasi data, serta HTTP Status Code yang sesuai. Contoh pengujian menggunakan CURL menggambarkan cara client mengirimkan request melalui terminal dan menerima response dari server.

Dengan rancangan tersebut, API dapat digunakan sebagai dasar pengembangan sistem informasi perpustakaan yang mengelola koleksi buku, anggota, dan transaksi peminjaman secara terstruktur.