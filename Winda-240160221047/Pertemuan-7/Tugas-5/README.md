# TUGAS 5 — CRUD REST API DENGAN POLA SERVICE/CONTROLLER

**Nama:** Winda Nurhidayah  
**NPM:** 240160221047  
**Mata Kuliah:** Praktikum Backend  
**Pertemuan:** 7

## 1. Deskripsi Project

Project ini merupakan pengembangan CRUD REST API menggunakan Express.js dan Prisma ORM dengan menerapkan pola Service/Controller.

Aplikasi menggunakan resource Buku untuk mengelola data buku, seperti judul, penulis, tahun terbit, dan stok buku. Sistem menyediakan fitur menampilkan, menambahkan, mengubah, dan menghapus data buku melalui REST API.

## 2. Teknologi yang Digunakan

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- Postman

## 3. Struktur Folder Project

```text
tugas-5-service-controller/
├── prisma/
│   ├── generated/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── routes/
│   │   └── buku.routes.ts
│   ├── controller/
│   │   └── buku.controller.ts
│   └── service/
│       └── buku.service.ts
├── .env
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── package.json
├── package-lock.json
└── README.md
```

## 4. Alur Kerja Sistem

Project ini menggunakan pola berlapis dengan alur sebagai berikut:

1. **Routes:** Mengatur endpoint dan menghubungkannya dengan controller.
2. **Controller:** Menerima request, melakukan validasi input, dan mengatur response.
3. **Service:** Menjalankan proses pengolahan data menggunakan Prisma ORM.
4. **Database:** SQLite digunakan untuk menyimpan data buku.

Alur proses sistem:

```text
Client / Postman
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
     Prisma
       |
       v
    SQLite
```

## 5. Cara Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Jalankan migrasi database:

```bash
npx prisma migrate dev --name init
```

3. Generate Prisma Client:

```bash
npx prisma generate
```

4. Jalankan server:

```bash
npm run dev
```

Server berjalan pada alamat:

```text
http://localhost:3010
```

## 6. Daftar Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/buku` | Menampilkan semua data buku |
| GET | `/buku/:id` | Menampilkan detail buku |
| POST | `/buku` | Menambahkan data buku |
| PATCH | `/buku/:id` | Mengubah data buku |
| DELETE | `/buku/:id` | Menghapus data buku |

## 7. Pengujian API Menggunakan Postman

Pengujian API dilakukan menggunakan aplikasi Postman untuk memastikan setiap endpoint dapat berjalan sesuai fungsinya.

### A. GET — Menampilkan Semua Buku

- Method: GET
- URL: `http://localhost:3010/buku`
- Fungsi: Menampilkan seluruh data buku yang tersimpan di database.
- Status berhasil: 200 OK.

### B. GET — Menampilkan Detail Buku

- Method: GET
- URL: `http://localhost:3010/buku/1`
- Fungsi: Menampilkan detail buku berdasarkan ID.
- Status berhasil: 200 OK.

### C. POST — Menambahkan Buku

- Method: POST
- URL: `http://localhost:3010/buku`
- Body menggunakan format JSON:

```json
{
  "judul": "Pemrograman Dasar",
  "penulis": "Winda",
  "tahun": 2024,
  "stok": 10
}
```

- Fungsi: Menambahkan data buku baru ke database.
- Status berhasil: 201 Created.

### D. PATCH — Mengubah Data Buku

- Method: PATCH
- URL: `http://localhost:3010/buku/1`
- Body menggunakan format JSON:

```json
{
  "judul": "Belajar REST API",
  "stok": 15
}
```

- Fungsi: Mengubah data buku berdasarkan ID.
- Status berhasil: 200 OK.

### E. DELETE — Menghapus Data Buku

- Method: DELETE
- URL: `http://localhost:3010/buku/1`
- Fungsi: Menghapus data buku berdasarkan ID.
- Status berhasil: 204 No Content.

### F. Pengujian Validasi Input

Pengujian dilakukan dengan mengirimkan data yang tidak sesuai ketentuan, seperti judul kosong, tahun berupa teks, dan stok bernilai negatif.

- Fungsi: Memastikan sistem menolak input yang tidak valid.
- Status yang diharapkan: 400 Bad Request.

### G. Pengujian Data Tidak Ditemukan

Pengujian dilakukan dengan mengakses ID buku yang tidak tersedia, misalnya:

`GET http://localhost:3010/buku/999`

- Fungsi: Memastikan sistem memberikan respons ketika data tidak ditemukan.
- Status yang diharapkan: 404 Not Found.

## 8. Validasi Input dan Status Code

Sistem menerapkan validasi input pada endpoint POST dan PATCH, antara lain:

- Judul dan penulis harus berupa teks dan tidak boleh kosong.
- Tahun harus berupa bilangan bulat antara 1000 sampai 2100.
- Stok harus berupa bilangan bulat minimal 0.
- ID harus berupa bilangan bulat positif.
- PATCH harus memiliki minimal satu data yang ingin diubah.

Status code yang digunakan:

| Status Code | Keterangan |
|---|---|
| 200 | Request berhasil |
| 201 | Data berhasil ditambahkan |
| 204 | Data berhasil dihapus |
| 400 | Input tidak valid |
| 404 | Data atau endpoint tidak ditemukan |
| 500 | Terjadi kesalahan pada server |

## 9. Middleware

Project ini menggunakan beberapa middleware, yaitu:

1. **Middleware JSON:** Membaca data JSON yang dikirim melalui request.
2. **Middleware Logger:** Mencatat waktu, method, dan URL setiap request.
3. **Middleware 404:** Menangani request ke endpoint yang tidak tersedia.
4. **Error Handler:** Menangani kesalahan yang terjadi selama proses aplikasi.

## 10. Kesimpulan

Melalui tugas ini, saya mempelajari cara membangun CRUD REST API menggunakan Express.js dan Prisma ORM dengan pola Service/Controller. Pemisahan routes, controller, dan service membuat struktur kode lebih terorganisasi dan mudah dikembangkan. Selain itu, saya juga mempelajari validasi input, penggunaan status code HTTP, middleware, serta pengelolaan database SQLite. Pengujian dilakukan menggunakan Postman untuk memastikan setiap endpoint berjalan sesuai fungsinya.