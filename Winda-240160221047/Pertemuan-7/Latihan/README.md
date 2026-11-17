# Latihan Individu Pertemuan 7
## CRUD REST API — Resource Pengguna

**Nama:** Winda Nurhidayah  
**NIM:** 240160221047  
**Mata Kuliah:** Praktikum Backend

### 1. Deskripsi

Latihan individu Pertemuan 7 ini bertujuan untuk mengembangkan REST API pada resource Pengguna menggunakan Express.js dan Prisma ORM dengan database SQLite.

Latihan ini menerapkan operasi pengelolaan data pengguna serta validasi input sebelum data diproses ke database.

### 2. Teknologi yang Digunakan

- Node.js
- Express.js
- Prisma ORM
- SQLite
- TypeScript
- Postman

### 3. Struktur Folder

```text
Latihan/
├── prisma/
│   ├── generated/
│   ├── migrations/
│   ├── dev.db
│   └── schema.prisma
├── node_modules/
├── .env
├── client.ts
├── latihan.ts
├── package.json
├── package-lock.json
├── prisma.config.ts
└── README.md
```

### 4. Fitur dan Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/pengguna` | Menampilkan seluruh pengguna |
| GET | `/pengguna?nim=...` | Mencari pengguna berdasarkan NIM |
| POST | `/pengguna` | Menambahkan pengguna baru |
| DELETE | `/pengguna/:nim` | Menghapus pengguna berdasarkan NIM |

### 5. Cara Menjalankan Project

**Langkah 1.** Install dependency:

```bash
npm install
```

**Langkah 2.** Jalankan migration database:

```bash
npx prisma migrate dev --name pengguna
```

**Langkah 3.** Generate Prisma Client:

```bash
npx prisma generate
```

**Langkah 4.** Jalankan aplikasi:

```bash
npm start
```

Server berjalan pada alamat:

```text
http://localhost:3009
```

### 6. Contoh Pengujian API

**A. POST — Menambahkan pengguna**

URL:

```text
POST http://localhost:3009/pengguna
```

Body JSON:

```json
{
  "nim": "240160221047",
  "nama": "Winda",
  "email": "winda@gmail.com",
  "role": "mahasiswa"
}
```

Status berhasil: `201 Created`

**B. GET — Menampilkan seluruh pengguna**

```text
GET http://localhost:3009/pengguna
```

Status berhasil: `200 OK`

**C. GET — Mencari pengguna berdasarkan NIM**

```text
GET http://localhost:3009/pengguna?nim=240160221047
```

Status berhasil: `200 OK`

**D. DELETE — Menghapus pengguna**

```text
DELETE http://localhost:3009/pengguna/240160221047
```

Status berhasil: `204 No Content`

**E. DELETE — Menghapus pengguna yang tidak ditemukan**

```text
DELETE http://localhost:3009/pengguna/999999999999
```

Status: `404 Not Found`

### 7. Hasil Pembelajaran

Melalui latihan individu ini, saya mempelajari cara membuat REST API menggunakan Express.js dan Prisma ORM, melakukan pengambilan data berdasarkan filter NIM, menambahkan