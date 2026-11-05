# REST API Sistem Informasi Perpustakaan — Tugas 5 Pertemuan 7

Aplikasi REST API untuk mengelola data perpustakaan yang dibangun menggunakan arsitektur berlapis (*layered architecture*) dengan pola **Service / Controller**, menggunakan Node.js, Express.js, TypeScript, Prisma ORM v7, dan SQLite.

Tugas ini merupakan kelanjutan dan penyempurnaan dari tugas sebelumnya, dengan pemisahan tanggung jawab (*separation of concerns*) antara routing, controller, dan service. Aplikasi menyediakan operasi CRUD untuk mengelola data buku dan anggota perpustakaan, dilengkapi validasi data serta penanganan error.

---

## 1. Teknologi yang Digunakan

| Komponen | Teknologi | Peran |
|---|---|---|
| Runtime | Node.js | Menjalankan aplikasi backend |
| Web Framework | Express.js | Mengelola server HTTP dan routing API |
| ORM | Prisma ORM v7 | Mengelola interaksi dengan database |
| Database Adapter | @prisma/adapter-better-sqlite3 | Menghubungkan Prisma dengan SQLite |
| Database Engine | better-sqlite3 | Menjalankan database SQLite |
| Konfigurasi Environment | dotenv | Membaca variabel lingkungan dari `.env` |
| Bahasa Pemrograman | TypeScript | Menambahkan tipe data pada kode |
| API Testing | Postman | Menguji endpoint REST API |

---

## 2. Struktur Direktori Proyek

```text
Praktikum7/Tugas5/
├── .env
├── package.json
├── tsconfig.json
├── prisma.config.ts
├── server.ts
├── app.ts
├── client.ts
├── prisma/
│   ├── schema.prisma
│   ├── dev.db
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
```

### Penjelasan Peran Setiap Bagian

- **`server.ts`**: Menjadi titik awal aplikasi untuk menjalankan server dan mengatur koneksi database ketika server dihentikan.
- **`app.ts`**: Mengatur aplikasi Express, middleware, pendaftaran route, serta penanganan error.
- **`src/routes/`**: Mendefinisikan endpoint API dan menghubungkannya dengan fungsi controller.
- **`src/controller/`**: Menangani request dan response HTTP, melakukan validasi input, serta menentukan kode status HTTP.
- **`src/service/`**: Menangani logika bisnis dan proses pengolahan data menggunakan Prisma.
- **`client.ts`**: Menginisialisasi PrismaClient untuk menghubungkan aplikasi dengan database.
- **`prisma/schema.prisma`**: Mendefinisikan struktur model database yang digunakan aplikasi.

---

## 3. Arsitektur dan Alur Request

Aplikasi menerapkan pola pemisahan tanggung jawab agar setiap bagian memiliki tugas masing-masing. Controller tidak mengakses Prisma secara langsung, tetapi memanggil fungsi yang tersedia pada service.

Alur request aplikasi:

```text
[Client / Postman]
        |
        v
     app.ts
        |
        v
  src/routes
        |
        v
 src/controller
        |
        v
  src/service
        |
        v
    client.ts
        |
        v
 SQLite Database
```

Penjelasan alur:

1. Client mengirimkan request melalui Postman.
2. `app.ts` menerima request dan meneruskannya ke route yang sesuai.
3. Route mengarahkan request ke controller.
4. Controller melakukan validasi data dan memanggil service.
5. Service menjalankan proses pengolahan data menggunakan Prisma.
6. Prisma berinteraksi dengan database SQLite.
7. Hasil proses dikembalikan melalui controller dalam bentuk response HTTP.

---

## 4. Persiapan dan