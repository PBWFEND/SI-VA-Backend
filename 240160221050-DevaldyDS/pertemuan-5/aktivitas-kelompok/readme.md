# Aktivitas Kelompok — Perancangan RESTful API

## Identitas Kelompok

**Kelompok:** 3

### Anggota Kelompok

| No. | Nama |
|---:|---|
| 1 | Devaldy Zikri S |
| 2 | Eka Bareeq |
| 3 | Faishal Rizky F |
| 4 | Fauzan Zainul Arifin |

---

## 1. Deskripsi Aktivitas

Aktivitas ini bertujuan untuk merancang kontrak RESTful API berdasarkan domain yang dipilih dari Tugas 1. Perancangan meliputi identifikasi resource, penentuan URL dan HTTP method, struktur request dan response JSON, status code, serta pengujian konsistensi antarkomponen API.

Domain yang digunakan sebagai contoh dalam rancangan ini adalah **Sistem Informasi Akademik**.

## 2. Identifikasi Resource

Resource direpresentasikan menggunakan kata benda pada URL, bukan kata kerja.

| No. | Resource | Endpoint dasar | Deskripsi |
|---:|---|---|---|
| 1 | Mahasiswa | `/api/mahasiswa` | Mengelola data mahasiswa. |
| 2 | Mata Kuliah | `/api/mata-kuliah` | Mengelola data mata kuliah. |
| 3 | KRS | `/api/krs` | Mengelola data Kartu Rencana Studi mahasiswa. |

**Alasan pemilihan resource:** Ketiga resource tersebut mewakili data utama dalam sistem akademik. Setiap resource memiliki identitas dan dapat dikelola melalui operasi HTTP yang sesuai.

## 3. Rancangan Kontrak Endpoint

### 3.1 Resource Mahasiswa

Endpoint dasar: `/api/mahasiswa`

| Operasi | HTTP Method | URL | Request Body | Status Code |
|---|---|---|---|---|
| Mengambil seluruh mahasiswa | GET | `/api/mahasiswa` | Tidak ada | `200 OK` |
| Mengambil detail mahasiswa | GET | `/api/mahasiswa/:nim` | Tidak ada | `200 OK`, `404 Not Found` |
| Membuat mahasiswa | POST | `/api/mahasiswa` | Data mahasiswa | `201 Created`, `400 Bad Request` |
| Memperbarui seluruh data mahasiswa | PUT | `/api/mahasiswa/:nim` | Seluruh data mahasiswa | `200 OK`, `400 Bad Request`, `404 Not Found` |
| Memperbarui sebagian data mahasiswa | PATCH | `/api/mahasiswa/:nim` | Field yang diubah | `200 OK`, `400 Bad Request`, `404 Not Found` |
| Menghapus mahasiswa | DELETE | `/api/mahasiswa/:nim` | Tidak ada | `204 No Content`, `404 Not Found` |

### 3.2 Resource Mata Kuliah

Endpoint dasar: `/api/mata-kuliah`

| Operasi | HTTP Method | URL | Request Body | Status Code |
|---|---|---|---|---|
| Mengambil seluruh mata kuliah | GET | `/api/mata-kuliah` | Tidak ada | `200 OK` |
| Mengambil detail mata kuliah | GET | `/api/mata-kuliah/:kode` | Tidak ada | `200 OK`, `404 Not Found` |
| Membuat mata kuliah | POST | `/api/mata-kuliah` | Data mata kuliah | `201 Created`, `400 Bad Request` |
| Memperbarui seluruh data mata kuliah | PUT | `/api/mata-kuliah/:kode` | Seluruh data mata kuliah | `200 OK`, `400 Bad Request`, `404 Not Found` |
| Memperbarui sebagian data mata kuliah | PATCH | `/api/mata-kuliah/:kode` | Field yang diubah | `200 OK`, `400 Bad Request`, `404 Not Found` |
| Menghapus mata kuliah | DELETE | `/api/mata-kuliah/:kode` | Tidak ada | `204 No Content`, `404 Not Found` |

### 3.3 Resource KRS

Endpoint dasar: `/api/krs`

| Operasi | HTTP Method | URL | Request Body | Status Code |
|---|---|---|---|---|
| Mengambil seluruh data KRS | GET | `/api/krs` | Tidak ada | `200 OK` |
| Mengambil detail KRS | GET | `/api/krs/:id` | Tidak ada | `200 OK`, `404 Not Found` |
| Membuat data KRS | POST | `/api/krs` | Data KRS | `201 Created`, `400 Bad Request` |
| Memperbarui seluruh data KRS | PUT | `/api/krs/:id` | Seluruh data KRS | `200 OK`, `400 Bad Request`, `404 Not Found` |
| Memperbarui sebagian data KRS | PATCH | `/api/krs/:id` | Field yang diubah | `200 OK`, `400 Bad Request`, `404 Not Found` |
| Menghapus data KRS | DELETE | `/api/krs/:id` | Tidak ada | `204 No Content`, `404 Not Found` |

**Catatan:** Tabel tersebut merupakan rancangan kontrak, bukan bukti bahwa seluruh endpoint sudah diimplementasikan. Status code juga perlu disesuaikan apabila kelompok memilih perilaku API yang berbeda.

## 4. Contoh Request dan Response

Contoh berikut menggunakan resource Mahasiswa.

### 4.1 Mengambil Seluruh Mahasiswa

**Request**

```http
GET /api/mahasiswa
```

**Response — `200 OK`**

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diambil",
  "data": [
    {
      "nim": "F1D022001",
      "nama": "Jhon Doe",
      "prodi": "Sistem Informasi",
      "angkatan": 2024
    },
    {
      "nim": "F1D022002",
      "nama": "Ani Lestari",
      "prodi": "Sistem Informasi",
      "angkatan": 2023
    }
  ]
}
```

### 4.2 Mengambil Detail Mahasiswa

**Request**

```http
GET /api/mahasiswa/F1D022001
```

**Response — `200 OK`**

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil ditemukan",
  "data": {
    "nim": "F1D022001",
    "nama": "Jhon Doe",
    "prodi": "Sistem Informasi",
    "angkatan": 2024
  }
}
```

Jika NIM tidak ditemukan, API mengembalikan `404 Not Found`.

```json
{
  "success": false,
  "message": "Mahasiswa tidak ditemukan",
  "data": null
}
```

### 4.3 Membuat Mahasiswa

**Request**

```http
POST /api/mahasiswa
Content-Type: application/json
```

**Request Body**

```json
{
  "nim": "F1D022003",
  "nama": "Budi Santoso",
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}
```

**Response — `201 Created`**

```json
{
  "success": true,
  "message": "Mahasiswa berhasil ditambahkan",
  "data": {
    "nim": "F1D022003",
    "nama": "Budi Santoso",
    "prodi": "Sistem Informasi",
    "angkatan": 2024
  }
}
```

Jika field wajib tidak lengkap atau tidak valid, API mengembalikan `400 Bad Request`.

```json
{
  "success": false,
  "message": "Data mahasiswa tidak valid",
  "data": null
}
```

### 4.4 Memperbarui Seluruh Data Mahasiswa

**Request**

```http
PUT /api/mahasiswa/F1D022003
Content-Type: application/json
```

**Request Body**

```json
{
  "nim": "F1D022003",
  "nama": "Budi Santoso",
  "prodi": "Teknik Informatika",
  "angkatan": 2024
}
```

**Response — `200 OK`**

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diperbarui",
  "data": {
    "nim": "F1D022003",
    "nama": "Budi Santoso",
    "prodi": "Teknik Informatika",
    "angkatan": 2024
  }
}
```

PUT digunakan untuk mengganti representasi data secara keseluruhan. Karena itu, field wajib harus dikirim kembali.

### 4.5 Memperbarui Sebagian Data Mahasiswa

**Request**

```http
PATCH /api/mahasiswa/F1D022003
Content-Type: application/json
```

**Request Body**

```json
{
  "prodi": "Sistem Informasi"
}
```

**Response — `200 OK`**

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diperbarui",
  "data": {
    "nim": "F1D022003",
    "nama": "Budi Santoso",
    "prodi": "Sistem Informasi",
    "angkatan": 2024
  }
}
```

PATCH hanya mengubah field yang dikirim, sedangkan field lainnya tetap dipertahankan.

### 4.6 Menghapus Mahasiswa

**Request**

```http
DELETE /api/mahasiswa/F1D022003
```

**Response — `204 No Content`**

Tidak ada response body. Status `204` menunjukkan bahwa penghapusan berhasil.

Jika NIM tidak ditemukan, API mengembalikan `404 Not Found` dengan response JSON yang konsisten dengan format error.

## 5. Aturan Validasi dan Status Code

| Status Code | Arti | Kondisi |
|---|---|---|
| `200 OK` | Permintaan berhasil | Pengambilan atau pembaruan data berhasil. |
| `201 Created` | Resource berhasil dibuat | Data baru berhasil ditambahkan. |
| `204 No Content` | Berhasil tanpa response body | Data berhasil dihapus. |
| `400 Bad Request` | Request tidak valid | Field wajib kosong, format salah, atau nilai tidak memenuhi aturan. |
| `404 Not Found` | Resource tidak ditemukan | ID atau parameter resource tidak cocok dengan data yang tersedia. |

### Ketentuan validasi

1. Field wajib tidak boleh kosong.
2. NIM harus unik.
3. NIM pada URL harus sesuai dengan identitas resource yang diperbarui melalui PUT.
4. PATCH harus mengirim setidaknya satu field yang boleh diperbarui.
5. Data harus divalidasi sebelum disimpan.
6. DELETE yang berhasil harus mengembalikan status `204` tanpa body.

## 6. Konsistensi Desain RESTful API

Rancangan ini menggunakan prinsip berikut:

- **URL berbasis resource:** menggunakan kata benda seperti `/mahasiswa`, `/mata-kuliah`, dan `/krs`.
- **HTTP method sesuai operasi:** GET untuk membaca, POST untuk membuat, PUT untuk memperbarui keseluruhan data, PATCH untuk memperbarui sebagian data, dan DELETE untuk menghapus.
- **Parameter URL untuk detail:** identitas resource ditempatkan pada path, misalnya `/api/mahasiswa/F1D022001`.
- **Response JSON konsisten:** response sukses menggunakan `success`, `message`, dan `data`; response error menggunakan `success: false`, `message`, dan `data: null`.
- **Status code sesuai hasil operasi:** keberhasilan, kesalahan validasi, dan resource yang tidak ditemukan dibedakan dengan jelas.
- **DELETE tanpa body:** respons penghapusan yang berhasil menggunakan `204 No Content`.

## 7. Checklist Pengujian Konsistensi

Checklist berikut digunakan saat kelompok lain memeriksa rancangan.

- [ ] URL menggunakan nama resource berbentuk kata benda.
- [ ] GET tidak digunakan untuk membuat atau menghapus data.
- [ ] POST menghasilkan `201 Created` ketika resource baru berhasil dibuat.
- [ ] PUT meminta data lengkap sesuai kontrak.
- [ ] PATCH hanya memperbarui field yang dikirim.
- [ ] Input tidak valid menghasilkan `400 Bad Request`.
- [ ] Resource yang tidak ditemukan menghasilkan `404 Not Found`.
- [ ] DELETE yang berhasil menghasilkan `204 No Content` tanpa response body.
- [ ] Struktur JSON konsisten pada response sukses dan error.
- [ ] Contoh request sesuai dengan URL, method, body, dan status code pada tabel kontrak.

**Hasil pengujian:** Diisi setelah rancangan benar-benar diperiksa dan diuji oleh kelompok.

## 8. Bahan Presentasi

### Alasan Teknis Desain Endpoint

Desain endpoint dibuat dengan memisahkan setiap jenis resource sehingga URL mudah dibaca dan dipelihara. HTTP method digunakan sesuai dengan tujuan operasi agar klien memahami tindakan yang dilakukan tanpa memerlukan nama endpoint berbentuk kata kerja.

PUT dan PATCH dibedakan untuk memperjelas apakah data diperbarui secara keseluruhan atau hanya sebagian. Status code digunakan untuk menyampaikan hasil operasi secara standar, sedangkan struktur JSON yang konsisten memudahkan frontend memproses response.

### Kesimpulan

Perancangan RESTful API perlu memperhatikan hubungan antara resource, URL, HTTP method, request body, response, dan status code. Kontrak yang konsisten mempermudah implementasi, pengujian, integrasi frontend, serta pemeliharaan sistem.

## 9. Catatan Penyesuaian

Sebelum dikumpulkan:

1. Sesuaikan domain dan tiga resource dengan domain yang benar-benar dipilih dari Tugas 1.
2. Sesuaikan atribut dan contoh data dengan rancangan kelompok.
3. Lakukan pemeriksaan silang dengan kelompok lain.
4. Ganti checklist dan hasil pengujian dengan hasil yang benar-benar diperoleh.
5. Lampirkan minimal lima contoh request-response sesuai instruksi aktivitas.
