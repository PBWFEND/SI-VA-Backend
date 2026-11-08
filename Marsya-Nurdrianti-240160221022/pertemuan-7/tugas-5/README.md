
# TUGAS 5 — CRUD REST API DENGAN POLA SERVICE/CONTROLLER

## 1. Identitas Mahasiswa

| Keterangan | Identitas |
|---|---|
| Nama | Marsya Nurdrianti |
| NIM | 240160221022 |
| Program Studi | Sistem Informasi |
| Kelas | SI-VA |
| Mata Kuliah | Pemrograman Berbasis Web Back End |
| Pertemuan | 7 |
| Tugas | Tugas 5 |

---

## 2. Deskripsi Tugas

Pada Tugas 5 ini dilakukan pengembangan REST API dengan menerapkan pola Service dan Controller. Pengembangan dilakukan dengan melanjutkan aplikasi Sistem Informasi Absensi Organisasi dari tugas sebelumnya.

Aplikasi ini digunakan untuk mengelola data absensi anggota organisasi. Fitur yang dikembangkan meliputi menampilkan seluruh data absensi, melihat detail data berdasarkan ID, menambahkan data absensi, memperbarui data, dan menghapus data absensi.

Dalam pengerjaannya, struktur program dipisahkan menjadi tiga bagian utama, yaitu Routes, Controller, dan Service. Pemisahan ini bertujuan agar setiap bagian memiliki tanggung jawab masing-masing sehingga kode program lebih terstruktur dan mudah dikembangkan.

Selain fitur CRUD, aplikasi juga dilengkapi dengan validasi input, penggunaan HTTP status code, middleware 404, dan error handler untuk menangani kesalahan pada aplikasi.

---

## 3. Teknologi yang Digunakan

| Teknologi | Keterangan |
|---|---|
| Node.js | Menjalankan aplikasi backend |
| Express.js | Membuat REST API |
| TypeScript | Bahasa pemrograman dengan dukungan tipe data |
| Prisma ORM | Mengelola komunikasi aplikasi dengan database |
| SQLite | Menyimpan data anggota dan absensi |
| Postman | Melakukan pengujian endpoint API |
| Git dan GitHub | Mengelola dan menyimpan kode program |

---

## 4. Struktur Folder

Berikut struktur folder proyek Tugas 5:

```text
tugas-5/
├── generated/
├── prisma/
│   ├── migrations/
│   │   ├── 20261023105612_init/
│   │   ├── 20261023110051_absensi/
│   │   └── migration_lock.toml
│   └── schema.prisma
├── src/
│   ├── controller/
│   │   └── absensiController.ts
│   ├── routes/
│   │   └── absensiRoutes.ts
│   ├── service/
│   │   └── absensiService.ts
│   ├── app.ts
│   ├── client.ts
│   └── server.ts
├── screenshots/
│   ├── 01-get-semua-data-absensi.png
│   ├── 02-post-tambah-data-absensi.png
│   ├── 03-get-detail-data-absensi.png
│   ├── 04-patch-ubah-data-absensi.png
│   ├── 05-get-verifikasi-perubahan.png
│   ├── 06-delete-hapus-data-absensi.png
│   ├── 07-get-verifikasi-penghapusan.png
│   ├── 08-post-validasi-input.png
│   └── 09-get-middleware-404.png
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

### Keterangan Struktur Folder

1. `generated/` digunakan untuk menyimpan hasil generate Prisma Client.
2. `prisma/` berisi schema Prisma dan folder migrasi database.
3. `prisma/migrations/` menyimpan riwayat perubahan struktur database.
4. `src/routes/` berisi pengaturan endpoint API.
5. `src/controller/` berisi fungsi untuk menangani request, validasi input, dan response API.
6. `src/service/` berisi proses pengolahan data menggunakan Prisma ORM.
7. `src/app.ts` berisi konfigurasi Express, routes, middleware 404, dan error handler.
8. `src/client.ts` berisi konfigurasi koneksi Prisma Client.
9. `src/server.ts` digunakan untuk menjalankan server aplikasi.
10. `screenshots/` digunakan untuk menyimpan dokumentasi hasil pengujian API.
11. `.gitignore` mengatur file dan folder yang tidak perlu diunggah ke GitHub.
12. `package.json` berisi informasi proyek dan dependency yang digunakan.
13. `prisma.config.ts` berisi konfigurasi Prisma.
14. `tsconfig.json` berisi konfigurasi TypeScript.

---

## 5. Cara Menjalankan Aplikasi

Berikut langkah-langkah untuk menjalankan aplikasi Tugas 5.

### 5.1 Masuk ke Folder Proyek

Buka terminal Git Bash, kemudian masuk ke folder Tugas 5.

```bash
cd pertemuan-7/tugas-5
```

### 5.2 Instalasi Dependency

Jalankan perintah berikut untuk menginstal dependency yang dibutuhkan.

```bash
npm install
```

### 5.3 Konfigurasi Environment

Pastikan file `.env` memiliki konfigurasi berikut.

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3011
```

### 5.4 Validasi Schema Prisma

Jalankan perintah berikut untuk memeriksa schema Prisma.

```bash
npx prisma validate
```

### 5.5 Menjalankan Migrasi Database

Jalankan perintah berikut untuk memastikan struktur database sesuai dengan riwayat migrasi.

```bash
npx prisma migrate dev
```

### 5.6 Generate Prisma Client

Jalankan perintah berikut untuk menghasilkan Prisma Client.

```bash
npx prisma generate
```

### 5.7 Pemeriksaan TypeScript

Untuk memeriksa kesalahan pada kode TypeScript, jalankan perintah berikut.

```bash
npx tsc --noEmit
```

### 5.8 Menjalankan Server

Jalankan aplikasi menggunakan perintah:

```bash
npm start
```

Jika berhasil, terminal akan menampilkan pesan:

```text
API Absensi berjalan di http://localhost:3011
```

Aplikasi menggunakan alamat berikut:

```text
http://localhost:3011
```

---

## 6. Penerapan Pola Routes, Controller, dan Service

Pada Tugas 5, aplikasi dikembangkan dengan menerapkan pemisahan tiga bagian utama, yaitu Routes, Controller, dan Service.

### 6.1 Routes

Routes berfungsi untuk mengatur endpoint API dan menghubungkan setiap request yang masuk dengan fungsi Controller.

File yang digunakan:

`src/routes/absensiRoutes.ts`

Pada bagian ini terdapat pengaturan endpoint GET, POST, PATCH, dan DELETE untuk resource Absensi.

### 6.2 Controller

Controller berfungsi untuk menerima request dari pengguna, melakukan validasi input, memanggil fungsi Service, dan mengirimkan response sesuai hasil proses.

File yang digunakan:

`src/controller/absensiController.ts`

Controller juga menangani kondisi ketika ID tidak valid, data tidak ditemukan, atau input yang dikirimkan tidak sesuai ketentuan.

### 6.3 Service

Service berfungsi untuk menangani proses pengolahan data ke database menggunakan Prisma ORM.

File yang digunakan:

`src/service/absensiService.ts`

Proses yang ditangani meliputi:

- Mengambil seluruh data absensi.
- Mengambil detail absensi berdasarkan ID.
- Menambahkan data absensi.
- Memperbarui data absensi.
- Menghapus data absensi.

### 6.4 Alur Kerja Aplikasi

Berikut alur kerja REST API dengan pola Routes, Controller, dan Service.

```text
       Pengguna / Postman
                |
                v
              Routes
                |
                v
            Controller
                |
                v
              Service
                |
                v
            Prisma ORM
                |
                v
          SQLite Database
                |
                v
            Response API
```

Dengan pemisahan tersebut, setiap bagian memiliki tugas masing-masing sehingga kode program lebih terstruktur dan mudah dipelihara.

---

## 7. Daftar Endpoint API

Resource utama yang digunakan pada Tugas 5 adalah **Absensi**.

Base URL:

```text
http://localhost:3011
```

| No. | Method | Endpoint | Fungsi |
|---|---|---|---|
| 1 | GET | `/absensi` | Menampilkan seluruh data absensi |
| 2 | GET | `/absensi/:id` | Menampilkan detail absensi berdasarkan ID |
| 3 | POST | `/absensi` | Menambahkan data absensi |
| 4 | PATCH | `/absensi/:id` | Memperbarui data absensi |
| 5 | DELETE | `/absensi/:id` | Menghapus data absensi |

---

## 8. Pengujian Endpoint Menggunakan cURL

Pengujian endpoint dilakukan untuk memastikan setiap fitur API dapat berjalan sesuai fungsinya. Selain menggunakan Postman, endpoint juga dapat diuji melalui perintah cURL.

### 8.1 GET Semua Data Absensi

Perintah:

```bash
curl -i http://localhost:3011/absensi
```

Fungsi:

Mengambil seluruh data absensi yang tersimpan di database.

Status yang diharapkan: `200 OK`.

### 8.2 POST Tambah Data Absensi

Perintah:

```bash
curl -i -X POST http://localhost:3011/absensi \
-H "Content-Type: application/json" \
-d '{"anggotaId":2,"tanggal":"2026-11-01T00:00:00.000Z","waktuMasuk":"08:00","status":"Hadir","keterangan":"Hadir tepat waktu"}'
```

Fungsi:

Menambahkan data absensi baru dengan mengirimkan data melalui JSON.

Keterangan:

- `anggotaId` harus menggunakan ID anggota yang tersedia di database.
- `tanggal` berisi tanggal absensi.
- `waktuMasuk` berisi waktu kehadiran.
- `status` berisi status kehadiran.
- `keterangan` berisi informasi tambahan.

Status yang diharapkan: `201 Created`.

### 8.3 GET Detail Data Absensi

Perintah:

```bash
curl -i http://localhost:3011/absensi/ID
```

Ganti `ID` dengan ID absensi yang diperoleh dari hasil POST.

Fungsi:

Mengambil satu data absensi berdasarkan ID.

Status yang diharapkan:

- `200 OK` jika data ditemukan.
- `404 Not Found` jika data tidak ditemukan.

### 8.4 PATCH Ubah Data Absensi

Perintah:

```bash
curl -i -X PATCH http://localhost:3011/absensi/ID \
-H "Content-Type: application/json" \
-d '{"status":"Izin","keterangan":"Izin karena keperluan keluarga"}'
```

Ganti `ID` dengan ID absensi yang ingin diperbarui.

Fungsi:

Memperbarui sebagian data absensi berdasarkan ID.

Status yang diharapkan: `200 OK` jika data berhasil diperbarui.

### 8.5 DELETE Hapus Data Absensi

Perintah:

```bash
curl -i -X DELETE http://localhost:3011/absensi/ID
```

Ganti `ID` dengan ID absensi yang ingin dihapus.

Fungsi:

Menghapus data absensi berdasarkan ID.

Status yang diharapkan:

- `204 No Content` jika data berhasil dihapus.
- `404 Not Found` jika data tidak ditemukan.

---

## 9. Hasil Pengujian API

Pengujian dilakukan menggunakan Postman untuk memastikan seluruh endpoint berjalan sesuai dengan fungsinya. Setiap hasil pengujian didokumentasikan dalam bentuk screenshot dan disimpan di dalam folder `screenshots/`.

### 9.1 Pengujian GET Semua Data Absensi

Pengujian dilakukan untuk mengambil seluruh data absensi yang tersimpan di database.

- Method: GET
- Endpoint: `/absensi`
- Hasil: Data absensi berhasil ditampilkan.
- Status: `200 OK`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/01-get-semua-data-absensi.png)

### 9.2 Pengujian POST Tambah Data Absensi

Pengujian dilakukan untuk menambahkan data absensi baru ke dalam database menggunakan request body JSON.

- Method: POST
- Endpoint: `/absensi`
- Hasil: Data absensi berhasil ditambahkan.
- Status: `201 Created`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/02-post-tambah-data-absensi.png)

### 9.3 Pengujian GET Detail Data Absensi

Pengujian dilakukan untuk menampilkan detail data absensi berdasarkan ID tertentu.

- Method: GET
- Endpoint: `/absensi/:id`
- Hasil: Detail data absensi berhasil ditampilkan.
- Status: `200 OK`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/03-get-detail-data-absensi.png)

### 9.4 Pengujian PATCH Ubah Data Absensi

Pengujian dilakukan untuk memperbarui data absensi, seperti mengubah status kehadiran dan keterangan.

- Method: PATCH
- Endpoint: `/absensi/:id`
- Hasil: Data absensi berhasil diperbarui.
- Status: `200 OK`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/04-patch-ubah-data-absensi.png)

### 9.5 Pengujian GET Verifikasi Perubahan

Pengujian dilakukan kembali menggunakan GET untuk memastikan perubahan data melalui PATCH sudah tersimpan di database.

- Method: GET
- Endpoint: `/absensi/:id`
- Hasil: Data yang sudah diperbarui berhasil ditampilkan.
- Status: `200 OK`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/05-get-verifikasi-perubahan.png)

### 9.6 Pengujian DELETE Hapus Data Absensi

Pengujian dilakukan untuk menghapus data absensi berdasarkan ID tertentu.

- Method: DELETE
- Endpoint: `/absensi/:id`
- Hasil: Data absensi berhasil dihapus.
- Status: `204 No Content`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/06-delete-hapus-data-absensi.png)

### 9.7 Pengujian GET Verifikasi Penghapusan

Setelah data dihapus, dilakukan pengujian GET kembali menggunakan ID yang sama untuk memastikan data sudah tidak tersedia di database.

- Method: GET
- Endpoint: `/absensi/:id`
- Hasil: Data absensi tidak ditemukan.
- Status: `404 Not Found`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/07-get-verifikasi-penghapusan.png)

### 9.8 Pengujian Validasi Input

Pengujian dilakukan dengan mengirimkan data yang tidak sesuai dengan ketentuan validasi.

- Method: POST
- Endpoint: `/absensi`
- Hasil: API menolak data yang tidak valid.
- Status: `400 Bad Request`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/08-post-validasi-input.png)

### 9.9 Pengujian Middleware 404

Pengujian dilakukan dengan mengakses endpoint yang tidak tersedia untuk memastikan middleware 404 berjalan.

- Method: GET
- Endpoint: `/tes`
- Hasil: API memberikan pesan bahwa endpoint tidak ditemukan.
- Status: `404 Not Found`

**Screenshot:** [📷 Lihat Hasil Pengujian](screenshots/09-get-middleware-404.png)

---

## 10. Ringkasan Hasil Pengujian

| No. | Pengujian | Method | Status yang Diharapkan |
|---|---|---|---|
| 1 | Menampilkan semua data absensi | GET | 200 OK |
| 2 | Menambahkan data absensi | POST | 201 Created |
| 3 | Menampilkan detail absensi | GET | 200 OK |
| 4 | Memperbarui data absensi | PATCH | 200 OK |
| 5 | Verifikasi perubahan data | GET | 200 OK |
| 6 | Menghapus data absensi | DELETE | 204 No Content |
| 7 | Verifikasi penghapusan data | GET | 404 Not Found |
| 8 | Validasi input tidak valid | POST | 400 Bad Request |
| 9 | Mengakses endpoint tidak tersedia | GET | 404 Not Found |

---

## 11. Validasi Input dan Error Handling

Pada aplikasi ini diterapkan validasi input untuk memastikan data yang dikirimkan sesuai dengan ketentuan sebelum diproses ke database.

Validasi yang diterapkan meliputi:

1. `anggotaId` harus berupa bilangan bulat positif.
2. `tanggal` harus berupa tanggal yang valid.
3. `status` hanya menerima nilai Hadir, Izin, Sakit, atau Alpa.
4. `waktuMasuk` harus berupa string atau null.
5. `keterangan` harus berupa string atau null.
6. ID absensi harus berupa bilangan bulat positif.
7. Data perubahan PATCH tidak boleh kosong.
8. Input yang tidak sesuai ketentuan akan menghasilkan response `400 Bad Request`.

Selain validasi input, aplikasi menggunakan middleware 404 dan error handler untuk menangani kesalahan.

| Status Code | Keterangan |
|---|---|
| 200 | Request berhasil diproses |
| 201 | Data berhasil dibuat |
| 204 | Data berhasil dihapus tanpa response body |
| 400 | Input yang dikirim tidak valid |
| 404 | Data atau endpoint tidak ditemukan |
| 500 | Terjadi kesalahan pada server |

Penanganan error Prisma juga diterapkan, yaitu:

- `P2025` untuk menangani data yang tidak ditemukan.
- `P2003` untuk menangani masalah relasi data.

---

## 12. Kesimpulan

Berdasarkan pengerjaan Tugas 5, aplikasi REST API Sistem Informasi Absensi Organisasi dikembangkan dengan menerapkan pola Service dan Controller menggunakan Express.js, TypeScript, Prisma ORM, dan SQLite.

Pemisahan struktur Routes, Controller, dan Service membuat kode program lebih terorganisasi karena setiap bagian memiliki tanggung jawab masing-masing. Fitur CRUD disediakan untuk mengelola data absensi, mulai dari menampilkan, menambahkan, memperbarui, hingga menghapus data.

Selain itu, aplikasi dilengkapi dengan validasi input, penggunaan HTTP status code, middleware 404, dan error handler. Pengujian menggunakan Postman dilakukan untuk memeriksa fungsi setiap endpoint dan response yang diberikan.

Melalui pengerjaan tugas ini, saya memperoleh pemahaman mengenai pengembangan REST API dengan pola Service dan Controller serta penggunaan Prisma ORM dalam aplikasi backend.
