# RANCANGAN RESTFUL API
# SISTEM INFORMASI ABSENSI ORGANISASI

**AKTIVITAS KELOMPOK PRAKTIKUM BACK END PERTEMUAN 5**

## Anggota Kelompok

1. Aldi Restu Fauzi (240160221001)
2. Resa Khoerunnisa (240160221038)
3. Khoerunnisa Shaleha (240160221018)

---

# 1. IDENTIFIKASI RESOURCE

## 1.1 Domain yang Dipilih

Domain yang dipilih dalam perancangan RESTful API ini adalah **Sistem Informasi Absensi Organisasi**. Sistem ini digunakan untuk membantu proses pencatatan dan pengelolaan kehadiran anggota organisasi.

Sistem ini memiliki fitur untuk mencatat kehadiran, mengelola jadwal absensi, serta melihat hasil rekapitulasi kehadiran. Dengan adanya RESTful API, pengelolaan data dapat dilakukan melalui beberapa metode HTTP sehingga lebih terstruktur dan mudah diakses.

## 1.2 Identifikasi Resource

Berdasarkan kebutuhan sistem, terdapat tiga resource utama yang digunakan, yaitu:

| No. | Resource | Keterangan |
|---|---|---|
| 1 | Absensi | Mengelola pencatatan kehadiran anggota organisasi. |
| 2 | Jadwal | Mengelola jadwal pelaksanaan absensi organisasi. |
| 3 | Rekapitulasi | Menampilkan hasil rangkuman data kehadiran anggota organisasi. |

Ketiga resource tersebut menggunakan kata benda karena REST API berfokus pada objek atau data yang dikelola oleh sistem.

---

# 2. PERANCANGAN KONTRAK ENDPOINT

Perancangan kontrak endpoint bertujuan untuk menentukan URL, HTTP method, fungsi, request body, dan status code yang digunakan dalam setiap proses pengelolaan data.

## 2.1 Resource Absensi

**Base URL:** `/absensi`

| Method | Endpoint | Fungsi | Status Code |
|---|---|---|---|
| GET | `/absensi` | Menampilkan seluruh data absensi | 200 |
| GET | `/absensi/:id` | Menampilkan detail absensi berdasarkan ID | 200, 404 |
| POST | `/absensi` | Menambahkan data absensi | 201, 400 |
| PUT | `/absensi/:id` | Mengubah seluruh data absensi | 200, 400, 404 |
| PATCH | `/absensi/:id` | Mengubah sebagian data absensi | 200, 400, 404 |
| DELETE | `/absensi/:id` | Menghapus data absensi | 204, 404 |

**Contoh Request Body POST:**

```json
{
  "nama": "Andi",
  "jabatan": "Ketua",
  "tanggal": "2026-10-31",
  "status": "Hadir"
}
```

**Contoh Request Body PUT:**

```json
{
  "nama": "Andi Wijaya",
  "jabatan": "Ketua",
  "tanggal": "2026-10-31",
  "status": "Hadir"
}
```

**Contoh Request Body PATCH:**

```json
{
  "status": "Izin"
}
```

## 2.2 Resource Jadwal

**Base URL:** `/jadwal`

| Method | Endpoint | Fungsi | Status Code |
|---|---|---|---|
| GET | `/jadwal` | Menampilkan seluruh jadwal absensi | 200 |
| GET | `/jadwal/:id` | Menampilkan detail jadwal berdasarkan ID | 200, 404 |
| POST | `/jadwal` | Menambahkan jadwal absensi | 201, 400 |
| PUT | `/jadwal/:id` | Mengubah seluruh data jadwal | 200, 400, 404 |
| PATCH | `/jadwal/:id` | Mengubah sebagian data jadwal | 200, 400, 404 |
| DELETE | `/jadwal/:id` | Menghapus jadwal absensi | 204, 404 |

**Contoh Request Body POST:**

```json
{
  "nama_kegiatan": "Rapat Organisasi",
  "tanggal": "2026-11-05",
  "waktu": "09:00",
  "keterangan": "Rapat rutin anggota"
}
```

**Contoh Request Body PUT:**

```json
{
  "nama_kegiatan": "Rapat Evaluasi Organisasi",
  "tanggal": "2026-11-06",
  "waktu": "10:00",
  "keterangan": "Evaluasi kegiatan organisasi"
}
```

**Contoh Request Body PATCH:**

```json
{
  "waktu": "13:00"
}
```

## 2.3 Resource Rekapitulasi

**Base URL:** `/rekapitulasi`

Rekapitulasi merupakan resource yang berisi hasil rangkuman dari data absensi. Data rekapitulasi dihasilkan berdasarkan catatan kehadiran yang sudah tersimpan sehingga endpoint utamanya digunakan untuk mengambil dan melihat informasi.

| Method | Endpoint | Fungsi | Status Code |
|---|---|---|---|
| GET | `/rekapitulasi` | Menampilkan seluruh rekapitulasi absensi | 200 |
| GET | `/rekapitulasi/:id` | Menampilkan detail rekapitulasi berdasarkan ID | 200, 404 |
| GET | `/rekapitulasi?status=Hadir` | Memfilter rekapitulasi berdasarkan status | 200 |
| GET | `/rekapitulasi?tanggal=2026-10-31` | Memfilter rekapitulasi berdasarkan tanggal | 200 |
| GET | `/rekapitulasi?nama=Andi` | Memfilter rekapitulasi berdasarkan nama | 200 |

**Request Body:**

Resource rekapitulasi tidak memerlukan request body untuk proses pengambilan data karena hasilnya diperoleh dari data absensi yang sudah tersimpan.

**Alasan tidak menggunakan POST, PUT, PATCH, dan DELETE:**

Rekapitulasi merupakan hasil pengolahan data absensi, bukan data yang diinput atau diubah secara langsung. Oleh karena itu, proses penambahan, perubahan, dan penghapusan dilakukan melalui resource absensi, sedangkan rekapitulasi akan menampilkan hasil terbarunya.

---

# 3. STRUKTUR RESPONSE JSON

Untuk menjaga konsistensi, response API menggunakan tiga atribut utama, yaitu:

| Atribut | Keterangan |
|---|---|
| success | Menunjukkan apakah permintaan berhasil atau gagal. |
| message | Memberikan informasi mengenai hasil permintaan. |
| data | Berisi data yang diminta atau hasil pengolahan data. |

**Contoh Response Berhasil:**

```json
{
  "success": true,
  "message": "Data absensi berhasil diambil",
  "data": {
    "id": 1,
    "nama": "Andi",
    "jabatan": "Ketua",
    "tanggal": "2026-10-31",
    "status": "Hadir"
  }
}
```

**Contoh Response Gagal:**

```json
{
  "success": false,
  "message": "Data absensi tidak ditemukan",
  "data": null
}
```

---

# 4. CONTOH REQUEST DAN RESPONSE

Berikut enam contoh request dan response dari rancangan RESTful API Sistem Informasi Absensi Organisasi.

## 4.1 Menampilkan Seluruh Data Absensi

**Request:**

- Method: GET
- URL: `/absensi`

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Daftar absensi berhasil diambil",
  "data": {
    "total": 2,
    "data": [
      {
        "id": 1,
        "nama": "Andi",
        "jabatan": "Ketua",
        "tanggal": "2026-10-31",
        "status": "Hadir"
      },
      {
        "id": 2,
        "nama": "Siti",
        "jabatan": "Sekretaris",
        "tanggal": "2026-10-31",
        "status": "Izin"
      }
    ]
  }
}
```

## 4.2 Menampilkan Detail Absensi

**Request:**

- Method: GET
- URL: `/absensi/1`

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Detail absensi berhasil diambil",
  "data": {
    "id": 1,
    "nama": "Andi",
    "jabatan": "Ketua",
    "tanggal": "2026-10-31",
    "status": "Hadir"
  }
}
```

## 4.3 Menambahkan Data Absensi

**Request:**

- Method: POST
- URL: `/absensi`

**Request Body:**

```json
{
  "nama": "Dina",
  "jabatan": "Anggota",
  "tanggal": "2026-10-31",
  "status": "Hadir"
}
```

**Response: 201 Created**

```json
{
  "success": true,
  "message": "Data absensi berhasil ditambahkan",
  "data": {
    "id": 3,
    "nama": "Dina",
    "jabatan": "Anggota",
    "tanggal": "2026-10-31",
    "status": "Hadir"
  }
}
```

## 4.4 Mengubah Sebagian Data Absensi

**Request:**

- Method: PATCH
- URL: `/absensi/1`

**Request Body:**

```json
{
  "status": "Izin"
}
```

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Data absensi berhasil diperbarui",
  "data": {
    "id": 1,
    "nama": "Andi",
    "jabatan": "Ketua",
    "tanggal": "2026-10-31",
    "status": "Izin"
  }
}
```

## 4.5 Menampilkan Rekapitulasi Absensi

**Request:**

- Method: GET
- URL: `/rekapitulasi?status=Hadir`

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Rekapitulasi absensi berhasil diambil",
  "data": {
    "total": 2,
    "hadir": 2,
    "izin": 0,
    "sakit": 0
  }
}
```

## 4.6 Menghapus Data Absensi

**Request:**

- Method: DELETE
- URL: `/absensi/2`

**Response: 204 No Content**

Tidak terdapat response body karena data berhasil dihapus.

---

# 5. UJI KONSISTENSI RANCANGAN

Uji konsistensi dilakukan untuk memastikan bahwa URL, HTTP method, request, response, dan status code sudah sesuai dengan fungsi masing-masing endpoint.

Beberapa aturan yang digunakan dalam rancangan ini adalah:

1. URL menggunakan kata benda yang menggambarkan resource, seperti `/absensi`, `/jadwal`, dan `/rekapitulasi`.
2. GET digunakan untuk mengambil atau menampilkan data.
3. POST digunakan untuk menambahkan data baru.
4. PUT digunakan untuk mengubah seluruh data.
5. PATCH digunakan untuk mengubah sebagian data.
6. DELETE digunakan untuk menghapus data.
7. Status code 200 digunakan ketika permintaan berhasil diproses.
8. Status code 201 digunakan ketika data baru berhasil dibuat.
9. Status code 204 digunakan ketika data berhasil dihapus tanpa response body.
10. Status code 400 digunakan ketika data yang dikirim tidak valid.
11. Status code 404 digunakan ketika resource tidak ditemukan.

Berdasarkan aturan tersebut, rancangan endpoint diharapkan memiliki pola yang konsisten dan mudah dipahami.

---

# 6. ALASAN TEKNIS DESAIN ENDPOINT

## 6.1 Penggunaan URL Berbasis Resource

URL menggunakan kata benda karena REST API berorientasi pada resource atau objek yang dikelola. Contohnya `/absensi`, `/jadwal`, dan `/rekapitulasi`.

## 6.2 Penggunaan HTTP Method

Setiap HTTP method memiliki fungsi yang berbeda. GET untuk mengambil data, POST untuk menambahkan data, PUT untuk memperbarui seluruh data, PATCH untuk memperbarui sebagian data, dan DELETE untuk menghapus data.

## 6.3 Penggunaan Parameter ID

Parameter `:id` digunakan untuk mengakses satu data tertentu berdasarkan identitasnya. Contohnya `/absensi/1` untuk mengambil data absensi dengan ID 1.

## 6.4 Penggunaan Query Parameter

Query parameter digunakan untuk melakukan penyaringan data tanpa mengubah alamat utama resource. Contohnya `/rekapitulasi?status=Hadir` untuk menampilkan rekapitulasi berdasarkan status kehadiran.

## 6.5 Penggunaan Struktur JSON yang Konsisten

Struktur JSON menggunakan atribut `success`, `message`, dan `data` agar response lebih mudah dibaca dan dipahami oleh pengguna API.

## 6.6 Penggunaan Status Code HTTP

Status code digunakan untuk memberikan informasi mengenai hasil setiap permintaan sehingga client dapat mengetahui apakah permintaan berhasil atau mengalami kesalahan.

---

# 7. KESIMPULAN

Berdasarkan hasil perancangan, RESTful API Sistem Informasi Absensi Organisasi memiliki tiga resource utama, yaitu absensi, jadwal, dan rekapitulasi.

Resource absensi digunakan untuk mencatat dan mengelola kehadiran anggota, resource jadwal digunakan untuk mengelola jadwal pelaksanaan absensi, sedangkan resource rekapitulasi digunakan untuk menampilkan rangkuman hasil kehadiran.

Setiap resource menggunakan endpoint yang disesuaikan dengan fungsinya. Rancangan ini juga menerapkan HTTP method, struktur response JSON yang konsisten, serta status code yang sesuai.

Dengan demikian, pengelolaan data absensi organisasi dapat dirancang secara lebih terstruktur dan mudah dipahami.

---

# 8. BAHAN PRESENTASI KELOMPOK

Berikut poin-poin yang dapat digunakan saat menjelaskan hasil rancangan:

**1. Mengapa memilih domain Absensi Organisasi?**

Karena sistem ini berfokus pada pengelolaan kehadiran anggota organisasi agar pencatatan absensi dapat dilakukan secara lebih terstruktur.

**2. Mengapa menggunakan tiga resource?**

Karena sistem memiliki tiga kebutuhan utama, yaitu pencatatan absensi, pengelolaan jadwal, dan penyajian rekapitulasi kehadiran.

**3. Mengapa URL menggunakan kata benda?**

Karena URL REST API menggambarkan resource atau data yang dikelola, bukan tindakan yang dilakukan.

**4. Mengapa menggunakan HTTP method yang berbeda?**

Karena setiap method mempunyai fungsi masing-masing sehingga proses pengambilan, penambahan, perubahan, dan penghapusan data dapat dibedakan dengan jelas.

**5. Mengapa menggunakan format JSON?**

Karena JSON memiliki struktur sederhana, mudah dibaca, dan umum digunakan untuk pertukaran data antara client dan server.

**6. Mengapa rekapitulasi hanya menggunakan GET?**

Karena rekapitulasi merupakan hasil rangkuman dari data absensi yang sudah tersimpan. Oleh sebab itu, data rekapitulasi ditampilkan berdasarkan data yang tersedia, bukan diubah secara langsung melalui endpoint rekapitulasi.