# Tugas 5 – REST API Absensi Organisasi

## 1. Deskripsi Proyek

Tugas ini merupakan pengembangan REST API untuk mengelola data absensi organisasi. API dibuat menggunakan Node.js dan Express.js, dengan Prisma ORM sebagai penghubung ke database SQLite.

Sistem ini menyediakan fitur CRUD (Create, Read, Update, Delete) untuk menambahkan, menampilkan, mengubah, dan menghapus data absensi.

## 2. Teknologi yang Digunakan

- **Node.js** – Menjalankan aplikasi JavaScript di sisi server.
- **Express.js** – Membuat REST API dan mengatur routing.
- **Prisma ORM** – Mengelola komunikasi antara aplikasi dan database.
- **SQLite** – Menyimpan data absensi.
- **Postman** – Menguji endpoint API.

## 3. Struktur Folder

```text
tugas-5/
├── prisma/
│   ├── generated/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controller/
│   │   └── absensi.controller.js
│   ├── routes/
│   │   └── absensi.routes.js
│   └── service/
│       └── absensi.service.js
├── .env
├── app.js
├── client.js
├── package.json
├── prisma.config.ts
├── server.js
└── README.md
```

## 4. Cara Menjalankan Proyek

Pastikan Node.js sudah terpasang pada komputer.

1. Buka terminal pada folder proyek.
2. Instal seluruh dependensi:

```bash
npm install
```

3. Generate Prisma Client:

```bash
npx prisma generate
```

4. Jalankan server:

```bash
npm start
```

5. Buka alamat berikut untuk memastikan API berjalan:

```text
http://localhost:3006/health
```

## 5. Alur Kerja Sistem

Sistem menggunakan pola pemisahan Route, Controller, dan Service.

1. **Routes** menerima request dari pengguna dan mengarahkannya ke controller yang sesuai.
2. **Controller** memeriksa input, melakukan validasi data, dan menentukan respons HTTP.
3. **Service** menjalankan proses pengolahan data menggunakan Prisma.
4. **Database SQLite** menyimpan dan menyediakan data absensi.

Alur sistem:

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
   Database SQLite
```

## 6. Daftar Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/absensi` | Menampilkan seluruh data absensi |
| GET | `/absensi/:id` | Menampilkan detail absensi berdasarkan ID |
| POST | `/absensi` | Menambahkan data absensi |
| PATCH | `/absensi/:id` | Mengubah data absensi |
| DELETE | `/absensi/:id` | Menghapus data absensi |

## 7. Contoh Pengujian API

### A. GET – Menampilkan Semua Data

```bash
curl http://localhost:3006/absensi
```

Respons yang diharapkan: `200 OK`.

### B. POST – Menambahkan Data

```bash
curl -X POST http://localhost:3006/absensi ^
-H "Content-Type: application/json" ^
-d "{\"nama\":\"Resa Khoerunnisa\",\"jabatan\":\"Sekretaris\",\"tanggal\":\"2026-11-01\",\"status\":\"Hadir\"}"
```

Respons yang diharapkan: `201 Created`.

### C. GET – Menampilkan Detail Data

```bash
curl http://localhost:3006/absensi/1
```

Respons yang diharapkan: `200 OK` jika data dengan ID tersebut tersedia.

### D. PATCH – Mengubah Data

```bash
curl -X PATCH http://localhost:3006/absensi/1 ^
-H "Content-Type: application/json" ^
-d "{\"status\":\"Izin\"}"
```

Respons yang diharapkan: `200 OK`.

### E. DELETE – Menghapus Data

```bash
curl -X DELETE http://localhost:300