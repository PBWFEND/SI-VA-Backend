# Pertemuan 7 — REST API Pengelolaan Data Pengguna
**Nama:** Faatin Ashri Widiatin

**NPM:** 240160221011

### 1. Menjalankan Server

Jalankan aplikasi menggunakan perintah:

```bash
node --experimental-strip-types latihan.ts
```

Jika berhasil, terminal menampilkan:

```text
API Latihan Pengguna berjalan di http://localhost:3009
```

Server berjalan pada port 3009.

### 2. Daftar Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/pengguna` | Mengambil seluruh data pengguna |
| GET | `/pengguna?nim={nim}` | Mengambil pengguna berdasarkan NIM |
| POST | `/pengguna` | Menambahkan pengguna baru |
| DELETE | `/pengguna/:nim` | Menghapus pengguna berdasarkan NIM |

### 3. Implementasi dan Pengujian API

#### GET Seluruh Pengguna
Perintah pengujian:

```bash
curl http://localhost:3009/pengguna
```

Hasil pengujian:

```json
{
  "success": true,
  "message": "Daftar pengguna",
  "data": []
}
```

Status: **200 OK**

Endpoint berhasil mengambil seluruh data pengguna. Pada pengujian awal, tabel masih kosong.

#### POST Menambahkan Pengguna
Perintah pengujian:

```bash
curl -X POST http://localhost:3009/pengguna \
-H "Content-Type: application/json" \
-d '{
  "nim": "240160221011",
  "nama": "Faatin Ashri Widiatin",
  "email": "faatinashri@gmail.com",
  "role": "mahasiswa"
}'
```

Hasil pengujian:

```json
{
  "success": true,
  "message": "Pengguna berhasil ditambahkan",
  "data": {
    "id": 1,
    "nim": "240160221011",
    "nama": "Faatin Ashri Widiatin",
    "email": "faatinashri@gmail.com",
    "role": "mahasiswa"
  }
}
```

Status: **201 Created**

Data pengguna berhasil ditambahkan ke database.

#### GET Pengguna Berdasarkan NIM
Perintah pengujian:

```bash
curl "http://localhost:3009/pengguna?nim=240160221011"
```

Hasil pengujian:

```json
{
  "success": true,
  "message": "Daftar pengguna",
  "data": [
    {
      "id": 1,
      "nim": "240160221011",
      "nama": "Faatin Ashri Widiatin",
      "email": "faatinashri@gmail.com",
      "role": "mahasiswa"
    }
  ]
}
```

Status: **200 OK**

API berhasil menampilkan data pengguna berdasarkan NIM yang diminta.

#### POST dengan Data Tidak Valid
Perintah pengujian:

```bash
curl -X POST http://localhost:3009/pengguna \
-H "Content-Type: application/json" \
-d '{
  "nim": "",
  "nama": "",
  "email": "email-salah",
  "role": "mahasiswa"
}'
```

Hasil pengujian:

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [
    "NIM wajib diisi",
    "Nama wajib diisi",
    "Email tidak valid"
  ]
}
```

Status: **400 Bad Request**

Validasi berhasil mendeteksi kesalahan input dan menolak data yang tidak memenuhi persyaratan.

#### DELETE Menghapus Pengguna
Perintah pengujian:

```bash
curl -X DELETE http://localhost:3009/pengguna/240160221011 -i
```

Hasil pengujian:

```http
HTTP/1.1 204 No Content
```

Status: **204 No Content**

Data pengguna berhasil dihapus dari database. Tidak terdapat body response karena penghapusan berhasil.

#### GET Setelah Penghapusan
Perintah pengujian:

```bash
curl "http://localhost:3009/pengguna?nim=240160221011"
```

Hasil pengujian:

```json
{
  "success": true,
  "message": "Daftar pengguna",
  "data": []
}
```

Status: **200 OK**

Data tidak lagi ditemukan sehingga proses penghapusan berhasil.

### 4. Ringkasan Hasil Pengujian

| No. | Pengujian | Status | Hasil |
|---|---|---|---|
| 1 | GET seluruh pengguna | 200 OK | Berhasil |
| 2 | POST pengguna valid | 201 Created | Berhasil |
| 3 | GET berdasarkan NIM | 200 OK | Berhasil |
| 4 | POST data tidak valid | 400 Bad Request | Berhasil |
| 5 | DELETE pengguna | 204 No Content | Berhasil |
| 6 | GET setelah DELETE | 200 OK | Berhasil |

### 5. Kesimpulan

Berdasarkan hasil implementasi dan pengujian, REST API pengelolaan data pengguna berhasil dibuat menggunakan Express.js, TypeScript, Prisma ORM, dan SQLite.

Fitur GET berhasil digunakan untuk mengambil seluruh data pengguna maupun mencari berdasarkan NIM. Fitur POST berhasil menambahkan data pengguna dan melakukan validasi terhadap input yang diberikan. Sementara itu, fitur DELETE berhasil menghapus data berdasarkan NIM.

Seluruh endpoint yang diuji memberikan respons sesuai dengan hasil yang diharapkan. Dengan demikian, implementasi REST API pada Latihan Individu Pertemuan 7 telah berhasil dilakukan dan diuji menggunakan cURL.