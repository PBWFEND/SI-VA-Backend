# Tugas 1 --- Analisis & Desain API

**Nama:** Marsya Nurdrianti\
**NPM:** 240160221022\
**Domain Sistem:** Absensi Organisasi

## 1. Deskripsi Sistem

Sistem Informasi Absensi Organisasi merupakan sistem yang digunakan oleh
anggota dan admin organisasi untuk mengelola data kehadiran. Anggota
dapat melakukan absensi dan melihat riwayat kehadirannya, sedangkan
admin dapat mengelola data anggota serta melihat dan mengelola data
absensi. Sistem menggunakan REST API sebagai penghubung antara aplikasi
dengan database.

## 2. Diagram Arsitektur

Diagram arsitektur menggambarkan alur komunikasi antara pengguna, Back
End, dan Database.

Alur sistem:

**Client → HTTP Request → Back End → Query/Data → Database → HTTP
Response → Client**

Keterangan: - **Client:** Anggota atau Admin yang menggunakan sistem. -
**HTTP Request:** Permintaan yang dikirim Client kepada Back End. -
**Back End:** REST API yang memproses permintaan dari Client. -
**Database:** Tempat penyimpanan data `users` dan `absensi`. - **HTTP
Response:** Hasil yang dikirim kembali kepada Client setelah permintaan
diproses.

Dalam diagram sederhana, Client dan Back End cukup digambarkan satu
kali. Panah balik menunjukkan response yang kembali kepada Client.

## 3. Resource yang Digunakan

Sistem menggunakan dua resource utama:

### 3.1 Users

Resource `users` digunakan untuk menyimpan data anggota organisasi.

Contoh data: - ID - Nama - Email - Jabatan

### 3.2 Absensi

Resource `absensi` digunakan untuk menyimpan data kehadiran anggota.

Contoh data: - ID - User ID - Tanggal - Status kehadiran

## 4. Tabel Resource dan Endpoint

  --------------------------------------------------------------------------------------
  No         Operasi       Method     Endpoint          Request    Response   Status
                                                        Body       Body       Code
  ---------- ------------- ---------- ----------------- ---------- ---------- ----------
  1          Melihat semua GET        `/users`          Tidak ada  Daftar     200 OK /
             anggota                                               data       500
                                                                   anggota    Internal
                                                                              Server
                                                                              Error

  2          Melihat       GET        `/users/{id}`     Tidak ada  Data       200 OK /
             anggota                                               anggota    404 Not
             berdasarkan                                                      Found
             ID                                                               

  3          Menambah      POST       `/users`          Data       Data       201
             anggota                                    anggota    anggota    Created /
                                                                   yang       400 Bad
                                                                   dibuat     Request

  4          Mengubah      PUT        `/users/{id}`     Data       Data       200 OK /
             anggota                                    anggota    anggota    404 Not
                                                        yang       terbaru    Found
                                                        diubah                

  5          Menghapus     DELETE     `/users/{id}`     Tidak ada  Pesan      200 OK /
             anggota                                               berhasil   404 Not
                                                                   dihapus    Found

  6          Melihat semua GET        `/absensi`        Tidak ada  Daftar     200 OK /
             absensi                                               data       500
                                                                   absensi    Internal
                                                                              Server
                                                                              Error

  7          Melihat       GET        `/absensi/{id}`   Tidak ada  Data       200 OK /
             absensi                                               absensi    404 Not
             berdasarkan                                                      Found
             ID                                                               

  8          Menambah      POST       `/absensi`        Data       Data       201
             absensi                                    absensi    absensi    Created /
                                                                   yang       400 Bad
                                                                   dibuat     Request
  --------------------------------------------------------------------------------------

### Penjelasan Method HTTP

-   **GET** = mengambil atau melihat data.
-   **POST** = menambahkan data baru.
-   **PUT** = mengubah data yang sudah ada.
-   **DELETE** = menghapus data.

### Penjelasan Status Code

-   **200 OK** = permintaan berhasil.
-   **201 Created** = data berhasil dibuat atau ditambahkan.
-   **400 Bad Request** = data atau request yang dikirim tidak sesuai.
-   **404 Not Found** = data yang dicari tidak ditemukan.
-   **500 Internal Server Error** = terjadi kesalahan pada server.

## 5. Contoh JSON Resource Users

### Request Body

``` json
{
  "nama": "Marsya Nurdrianti",
  "email": "marsya@gmail.com",
  "jabatan": "Anggota"
}
```

### Response Body

``` json
{
  "id": 1,
  "nama": "Marsya Nurdrianti",
  "email": "marsya@gmail.com",
  "jabatan": "Anggota"
}
```

## 6. Contoh JSON Resource Absensi

### Request Body

``` json
{
  "user_id": 1,
  "tanggal": "2026-09-17",
  "status": "Hadir"
}
```

### Response Body

``` json
{
  "id": 1,
  "user_id": 1,
  "tanggal": "2026-09-17",
  "status": "Hadir"
}
```

## 7. Skenario Uji

### Skenario 1 --- Berhasil Melihat Data Anggota

**Request:**

``` http
GET /users/1
```

**Response:**

``` json
{
  "id": 1,
  "nama": "Marsya Nurdrianti",
  "email": "marsya@gmail.com",
  "jabatan": "Anggota"
}
```

**Status Code:** `200 OK`

**Keterangan:** Data anggota dengan ID 1 ditemukan dan berhasil
dikembalikan.

### Skenario 2 --- Berhasil Menambahkan Data Absensi

**Request:**

``` http
POST /absensi
```

**Request Body:**

``` json
{
  "user_id": 1,
  "tanggal": "2026-09-17",
  "status": "Hadir"
}
```

**Response:**

``` json
{
  "id": 1,
  "user_id": 1,
  "tanggal": "2026-09-17",
  "status": "Hadir"
}
```

**Status Code:** `201 Created`

**Keterangan:** Data absensi berhasil ditambahkan ke sistem.

### Skenario 3 --- Gagal Karena Data Tidak Ditemukan

**Request:**

``` http
GET /users/99
```

**Response:**

``` json
{
  "message": "User tidak ditemukan"
}
```

**Status Code:** `404 Not Found`

**Keterangan:** Data anggota dengan ID 99 tidak ditemukan di database.

## 8. Kesimpulan

Tugas ini merancang dasar REST API untuk Sistem Informasi Absensi
Organisasi. Sistem memiliki dua resource utama, yaitu `users` dan
`absensi`, dengan total delapan endpoint. Client berkomunikasi dengan
Back End menggunakan HTTP Request, kemudian Back End mengakses Database
dan mengembalikan hasil melalui HTTP Response. Dengan rancangan ini,
pengguna dapat mengelola data anggota dan data kehadiran secara
terstruktur.

## Ringkasan agar Mudah Dipahami

Konsep utama tugas ini dapat diingat dengan sederhana:

**GET = lihat data**\
**POST = tambah data**\
**PUT = ubah data**\
**DELETE = hapus data**

Sedangkan alur API:

**Client → Request → Back End → Database → Response → Client**

Resource yang digunakan hanya:

**Users = data anggota**\
**Absensi = data kehadiran**

Dengan dua resource tersebut sudah dapat dibuat minimal delapan endpoint
sesuai kebutuhan tugas.
