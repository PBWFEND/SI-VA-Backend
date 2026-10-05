## Deskripsi

Pada latihan ini digunakan HTTP server sederhana menggunakan Node.js.
Server menyediakan beberapa endpoint untuk menampilkan informasi API,
status server, dan data mahasiswa dari file JSON.

Project juga menggunakan environment variable `COURSE_CODE` yang memiliki
nilai default `CPMK115`.

## Cara Menjalankan

Masuk ke folder project:

```bash
cd Pertemuan3/Latihan
```

Kemudian jalankan server dengan:

```bash
COURSE_CODE=CPMK115 node server.js
```

Kemudian server berjalan pada:

```text
http://localhost:3003
```

## Endpoint

### 1. GET /

Endpoint utama untuk menampilkan informasi API dan daftar endpoint yang tersedia.

Perintah:

```bash
curl -i http://localhost:3003/
```

Hasil:

```text
HTTP/1.1 200 OK
```

Response berisi:

```json
{
  "success": true,
  "message": "Selamat datang di API Pertemuan 3",
  "endpoints": [
    "GET /",
    "GET /health",
    "GET /students"
  ]
}
```

### 2. GET /health

Endpoint untuk mengetahui status server.

Perintah:

```bash
curl -i http://localhost:3003/health
```

Endpoint ini mengembalikan status server dan versi Node.js yang digunakan.

### 3. GET /students

Endpoint untuk mengambil data mahasiswa dari file:

```text
data/students.json
```

Perintah:

```bash
curl -i http://localhost:3003/students
```

Response memiliki `courseCode` dan data mahasiswa.

Contoh:

```json
{
  "success": true,
  "courseCode": "CPMK115",
  "data": [
    {
      "id": 1,
      "nama": "Faatin Ashri",
      "nim": "240160221011"
    },
    {
      "id": 2,
      "nama": "Tafdiel Haqqi",
      "nim": "240160221012"
    },
    {
      "id": 3,
      "nama": "Fajar Nugraha",
      "nim": "240160221013"
    }
  ]
}
```

### 4. Endpoint tidak ditemukan

Untuk menguji endpoint yang tidak tersedia:

```bash
curl -i http://localhost:3003/tidak-ada
```

Hasil:

```text
HTTP/1.1 404 Not Found
```

Response:

```json
{
  "success": false,
  "message": "Endpoint GET /tidak-ada tidak ditemukan"
}
```

## Environment Variable

Project menggunakan environment variable `COURSE_CODE`.

Nilai default:

```text
CPMK115
```

Server dapat dijalankan menggunakan nilai lain, misalnya:

```bash
COURSE_CODE=ABC123 node server.js
```

Kemudian lakukan pengujian:

```bash
curl -i http://localhost:3003/students
```

Hasil menunjukkan:

```json
{
  "success": true,
  "courseCode": "ABC123"
}
```

Hal ini menunjukkan bahwa nilai `COURSE_CODE` dapat diubah melalui
environment variable.

## Pengujian

Pengujian yang dilakukan:

| Pengujian                    | Perintah                                  | Hasil           |
| ---------------------------- | ----------------------------------------- | --------------- |
| Endpoint utama tersedia      | `curl -i http://localhost:3003/`          | `200 OK`        |
| Endpoint students tersedia   | `curl -i http://localhost:3003/students`  | `200 OK`        |
| Endpoint tidak tersedia      | `curl -i http://localhost:3003/tidak-ada` | `404 Not Found` |
| Environment variable default | `COURSE_CODE=CPMK115 node server.js`      | `CPMK115`       |
| Environment variable diubah  | `COURSE_CODE=ABC123 node server.js`       | `ABC123`        |

