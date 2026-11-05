Nama: Nur Octaviani Tri Wulandari
NIM: 240160221032
Project: REST API Sistem Informasi Perpustakaan
Mata Kuliah: Pemograman web berbasis Backend 

Fitur Utama
Pengelolaan Data Buku:

POST /buku: Menambahkan data buku baru.

GET /buku: Mengambil seluruh data buku.

GET /buku/:id: Mengambil detail buku berdasarkan ID.

PATCH /buku/:id: Memperbarui data buku secara parsial.

DELETE /buku/:id: Menghapus data buku berdasarkan ID.

Pengelolaan Data Anggota:

POST /anggota: Menambahkan data anggota baru.

GET /anggota: Mengambil seluruh data anggota.

GET /anggota/:id: Mengambil detail anggota berdasarkan ID.

PATCH /anggota/:id: Memperbarui data anggota secara parsial.

DELETE /anggota/:id: Menghapus data anggota berdasarkan ID.

Model Data Pengguna:

Menyimpan data pengguna aplikasi.

Memiliki atribut NIM, nama, email, dan role.

NIM dan email dibuat unik agar tidak terjadi duplikasi data.

Integrasi Prisma ORM:

Menggunakan Prisma ORM untuk menghubungkan aplikasi dengan database SQLite.

Mengelola model Buku, Anggota, dan Pengguna.

Menggunakan migrasi database untuk menerapkan perubahan struktur tabel.

Validasi dan Penanganan Error:

Memvalidasi data yang dikirim melalui request.

Menangani data yang tidak ditemukan.

Menangani duplikasi data berdasarkan field unik.

Memberikan respons HTTP sesuai kondisi request.

Graceful Shutdown:

Menangani sinyal SIGINT dan SIGTERM.

Memutus koneksi Prisma Client ketika server dihentikan.

Struktur Direktori Proyek

Struktur direktori proyek disusun dengan pemisahan file berdasarkan fungsinya:

uts-sistem-informasi-perpustakaan/
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── generated/
│   └── migrations/
└── src/
    ├── controller/
    │   ├── buku.controller.ts
    │   └── anggota.controller.ts
    ├── routes/
    │   ├── buku.routes.ts
    │   └── anggota.routes.ts
    └── service/
        ├── buku.service.ts
        └── anggota.service.ts

Kebutuhan Sistem

Node.js: Versi 22.6.0 atau lebih baru.

npm: Digunakan untuk mengelola dependensi project.

Visual Studio Code: Editor untuk pengembangan aplikasi.

Postman: Digunakan untuk melakukan pengujian REST API.

SQLite: Digunakan sebagai basis data aplikasi.

Panduan Instalasi dan Menjalankan Proyek

1. Clone Repository

Clone repository project dari GitHub:

git clone LINK_REPOSITORY

Masuk ke direktori project:

cd nama-folder-project

2. Pasang Dependensi

Jalankan perintah berikut pada terminal:

npm install

3. Siapkan File Environment

Buat file .env pada direktori utama project dengan konfigurasi berikut:

DATABASE_URL="file:./prisma/dev.db"
PORT=3008

4. Jalankan Migrasi Database

Jalankan migrasi untuk membuat struktur tabel berdasarkan schema Prisma:

npx prisma migrate dev --name init

5. Generate Prisma Client

Jalankan perintah:

npx prisma generate

6. Jalankan Server

Untuk menjalankan aplikasi:

npm start

Untuk mode pengembangan:

npm run dev

Server berjalan pada alamat:

http://localhost:3008

7. Menghentikan Server

Tekan kombinasi tombol Ctrl + C pada terminal untuk menghentikan server dan memutus koneksi database Prisma.

Spesifikasi Model Data

Model data didefinisikan pada file prisma/schema.prisma.

1. Model Buku

Field

Tipe Data

Atribut

Keterangan

id

Int

Primary Key, Auto Increment

ID buku

judul

String

-

Judul buku

penulis

String

-

Nama penulis

tahun

Int

-

Tahun terbit buku

stok

Int

-

Jumlah stok buku

2. Model Anggota

Field

Tipe Data

Atribut

Keterangan

id

Int

Primary Key, Auto Increment

ID anggota

nama

String

-

Nama anggota

nim

String

Unique

Nomor Induk Mahasiswa

jurusan

String

-

Program studi anggota

3. Model Pengguna

Field

Tipe Data

Atribut

Keterangan

id

Int

Primary Key, Auto Increment

ID pengguna

nim

String

Unique

Nomor Induk Mahasiswa

nama

String

-

Nama pengguna

email

String

Unique

Email pengguna

role

String

-

Hak akses pengguna

Dokumentasi Endpoint

1. Endpoint Buku

Metode

Endpoint

Keterangan

GET

/buku

Mengambil semua data buku

GET

/buku/:id

Mengambil detail buku

POST

/buku

Menambahkan buku

PATCH

/buku/:id

Memperbarui data buku

DELETE

/buku/:id

Menghapus data buku

2. Endpoint Anggota

Metode

Endpoint

Keterangan

GET

/anggota

Mengambil semua data anggota

GET

/anggota/:id

Mengambil detail anggota

POST

/anggota

Menambahkan anggota

PATCH

/anggota/:id

Memperbarui data anggota

DELETE

/anggota/:id

Menghapus data anggota

Contoh Pengujian API Menggunakan Postman

1. Menambahkan Data Buku

Metode: POST

URL: http://localhost:3008/buku

Body: raw JSON

{
  "judul": "Belajar Node.js",
  "penulis": "Andi",
  "tahun": 2024,
  "stok": 5
}

2. Mengambil Semua Data Buku

Metode: GET

URL: http://localhost:3008/buku

3. Mengambil Detail Buku

Metode: GET

URL: http://localhost:3008/buku/1

4. Memperbarui Data Buku

Metode: PATCH

URL: http://localhost:3008/buku/1

Body: raw JSON

{
  "stok": 10
}

5. Menghapus Data Buku

Metode: DELETE

URL: http://localhost:3008/buku/1

6. Menambahkan Data Anggota

Metode: POST

URL: http://localhost:3008/anggota

Body: raw JSON

{
  "nama": "Nur Octaviani Tri Wulandari",
  "nim": "240160221032",
  "jurusan": "Sistem Informasi"
}

7. Mengambil Semua Data Anggota

Metode: GET

URL: http://localhost:3008/anggota

8. Mengambil Detail Anggota

Metode: GET

URL: http://localhost:3008/anggota/1

9. Memperbarui Data Anggota

Metode: PATCH

URL: http://localhost:3008/anggota/1

Body: raw JSON

{
  "jurusan": "Sistem Informasi"
}

10. Menghapus Data Anggota

Metode: DELETE

URL: http://localhost:3008/anggota/1

Standar Kode Status HTTP

Kode Status

Keterangan

200 OK

Request berhasil diproses.

201 Created

Data berhasil ditambahkan.

204 No Content

Data berhasil dihapus tanpa mengembalikan body.

400 Bad Request

Request atau data yang dikirim tidak valid.

404 Not Found

Data atau endpoint tidak ditemukan.

409 Conflict

Terjadi konflik atau duplikasi data.

500 Internal Server Error

Terjadi kesalahan pada server.

Kesimpulan

Melalui project UTS Mini Project Backend ini, saya mempelajari proses pembuatan REST API menggunakan Express.js, TypeScript, Prisma ORM, dan SQLite. Saya juga memahami penerapan arsitektur berlapis yang memisahkan routes, controller, dan service agar kode program lebih terstruktur dan mudah dikelola.

Project Sistem Informasi Perpustakaan ini memberikan pengalaman dalam mengelola data buku dan anggota melalui operasi CRUD serta melakukan pengujian API menggunakan Postman. Selain itu, saya menjadi lebih memahami proses konfigurasi database, validasi data, penanganan error, dan pengembangan backend secara bertahap.

Lisensi

Proyek ini dibuat untuk memenuhi keperluan akademik UTS Mini Project Backend pada mata kuliah Praktikum Backend Web Development.