# TUGAS 4 — Integrasi Database dan ORM untuk REST API

**Nama:** Winda Nurhidayah  
**NPM:** 240160221047  
**Mata Kuliah:** Pemrograman Backend

---

## 1. Deskripsi Project

Project ini merupakan pengembangan REST API dari Tugas 3 dengan menambahkan integrasi database menggunakan Prisma ORM dan SQLite.

Aplikasi ini dibuat untuk mengelola data buku, seperti menampilkan seluruh buku, melihat detail buku, menambahkan buku baru, memperbarui data buku, dan menghapus buku.

**Teknologi yang digunakan:**
- Node.js
- Express.js
- TypeScript
- Prisma ORM versi 7
- SQLite
- Postman

## 2. Struktur Folder Project

```text
tugas-4-backend/
│
├── prisma/
│   ├── generated/
│   ├── migrations/
│   └── schema.prisma
│
├── .env
├── .env.example
├── app.ts
├── server.ts
├── package.json
├── package-lock.json
└── README.md
```

## 3. Instalasi Project

Pastikan Node.js sudah terinstal di laptop.

Langkah instalasi:

1. Buka folder project menggunakan VS Code.
2. Buka Terminal.
3. Jalankan perintah:

```bash
npm install
```

Perintah tersebut digunakan untuk menginstal seluruh dependency yang dibutuhkan project.

## 4. Konfigurasi Environment Variable

Buat file `.env` pada folder utama project.

Isi file `.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
```

File `.env.example` digunakan sebagai contoh konfigurasi environment variable.

Isi file `.env.example`:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
```

## 5. Konfigurasi Database dan Prisma

Database yang digunakan adalah SQLite dengan Prisma ORM.

Entity yang digunakan adalah `Buku`, dengan struktur:

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | Int | Primary Key |
| judul | String | Judul buku |
| penulis | String | Nama penulis |
| tahun | Int | Tahun terbit |
| stok | Int | Jumlah stok buku |

Model database pada file `prisma/schema.prisma`:

```prisma
generator client {
  provider            = "prisma-client"
  output              = "./generated"
  importFileExtension = "ts"
}

datasource db {
  provider = "sqlite"
}

model Buku {
  id      Int    @id @default(autoincrement())
  judul   String
  penulis String
  tahun   Int
  stok    Int    @default(0)

  @@map("buku")
}
```

## 6. Menjalankan Migration

Migration digunakan untuk membuat tabel berdasarkan model yang sudah didefinisikan pada `schema.prisma`.

Jalankan perintah:

```bash
npm run db:migrate
```

Setelah migration berhasil, jalankan:

```bash
npm run db:generate
```

Perintah tersebut digunakan untuk menghasilkan Prisma Client agar aplikasi dapat berkomunikasi dengan database.

## 7. Menjalankan Aplikasi

Jalankan aplikasi menggunakan perintah:

```bash
npm start
```

Jika berhasil, server akan berjalan pada alamat:

```text
http://localhost:3000
```

## 8. Daftar Endpoint REST API

| No. | Method | Endpoint | Fungsi |
|---|---|---|---|
| 1 | GET | /buku | Mengambil seluruh data buku |
| 2 | GET | /buku/:id | Mengambil detail buku berdasarkan ID |
| 3 | POST | /buku | Menambahkan data buku |
| 4 | PATCH | /buku/:id | Memperbarui data buku |
| 5 | DELETE | /buku/:id | Menghapus data buku |

## 9. Contoh Pengujian Request Menggunakan Postman

### A. POST — Menambahkan Buku

Method: `POST`

URL:

```text
http://localhost:3000/buku
```

Body → raw → JSON:

```json
{
  "judul": "Laskar Pelangi",
  "penulis": "Andrea Hirata",
  "tahun": 2005,
  "stok": 10
}
```

Hasil yang diharapkan: `201 Created`.

### B. GET — Mengambil Semua Buku

Method: `GET`

URL:

```text
http://localhost:3000/buku
```

Hasil yang diharapkan: `200 OK` dan menampilkan seluruh data buku.

### C. GET — Mengambil Detail Buku

Method: `GET`

URL:

```text
http://localhost:3000/buku/1
```

Hasil yang diharapkan: `200 OK` dan menampilkan data buku berdasarkan ID.

### D. PATCH — Memperbarui Data Buku

Method: `PATCH`

URL:

```text
http://localhost:3000/buku/1
```

Body → raw → JSON:

```json
{
  "stok": 15
}
```

Hasil yang diharapkan: `200 OK` dan stok buku berubah menjadi 15.

### E. DELETE — Menghapus Data Buku

Method: `DELETE`

URL:

```text
http://localhost:3000/buku/1
```

Hasil yang diharapkan: `204 No Content`, yang berarti data buku berhasil dihapus.

## 10. Validasi dan Penanganan Error

Project ini memiliki beberapa validasi dan penanganan error, yaitu:

1. Memastikan judul, penulis, dan tahun wajib diisi ketika menambahkan buku.
2. Memastikan tahun berupa angka.
3. Memastikan ID buku berupa angka.
4. Menampilkan pesan error apabila data buku tidak ditemukan.
5. Menggunakan status HTTP yang sesuai, seperti 400, 404, dan 500.

## 11. Hasil Pengujian

Pengujian REST API dilakukan menggunakan aplikasi Postman.

Pengujian meliputi:

1. POST untuk menambahkan data buku.
2. GET untuk menampilkan seluruh data buku.
3. GET Detail untuk menampilkan satu data buku.
4. PATCH untuk memperbarui data buku.
5. DELETE untuk menghapus data buku.

## 12. Kesimpulan

Berdasarkan pengerjaan Tugas 4, REST API pengelolaan data buku telah dikembangkan dengan menggunakan Express.js, Prisma ORM, dan database SQLite.

Dengan adanya integrasi database, data buku dapat disimpan dan dikelola secara lebih terstruktur. Aplikasi juga memiliki fitur untuk menampilkan, menambahkan, memperbarui, dan menghapus data buku melalui endpoint REST API.

Pengujian dilakukan menggunakan Postman untuk memastikan setiap endpoint dapat menjalankan fungsinya.