# Mini Project UTS - REST API Manajemen Buku

**Nama:** Devaldy Dzikri Syach Mas'ud  
**NPM:** 240160221050

---

## Deskripsi

Project ini merupakan aplikasi REST API sederhana untuk mengelola data buku. API dibuat menggunakan Node.js, Express.js, TypeScript, Prisma ORM, dan database SQLite.

Aplikasi menyediakan fitur CRUD (Create, Read, Update, Delete) untuk menambahkan, menampilkan, mengubah, dan menghapus data buku.

## Teknologi yang Digunakan

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite

## Struktur Folder

```text
DevaldyDS-240160221050-UTS/
├── prisma/
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
├── .env.example
├── .gitignore
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Instalasi dan Menjalankan Project

1. Clone repository atau masuk ke folder project.
2. Install seluruh dependency:

```bash
npm install
```

3. Buat file `.env` berdasarkan `.env.example`:

```env
DATABASE_URL="file:./dev.db"
PORT=3008
```

4. Jalankan migrasi database:

```bash
npx prisma migrate dev --name init
```

5. Generate Prisma Client:

```bash
npx prisma generate
```

6. Jalankan server:

```bash
npm run dev
```

Server berjalan pada:

```text
http://localhost:3008
```

## Endpoint API

| Method | Endpoint    | Fungsi                   |
| ------ | ----------- | ------------------------ |
| GET    | `/buku`     | Menampilkan seluruh buku |
| GET    | `/buku/:id` | Menampilkan detail buku  |
| POST   | `/buku`     | Menambahkan buku         |
| PATCH  | `/buku/:id` | Mengubah data buku       |
| DELETE | `/buku/:id` | Menghapus buku           |
| GET    | `/health`   | Memeriksa status API     |

## Contoh Request

### Menambahkan Buku

**POST** `/buku`

```json
{
  "judul": "Belajar Backend",
  "penulis": "Devaldy",
  "tahun": 2025,
  "stok": 10
}
```

### Mengubah Data Buku

**PATCH** `/buku/1`

```json
{
  "judul": "Belajar Backend Lanjutan",
  "stok": 15
}
```

### Menghapus Buku

**DELETE** `/buku/1`

## Validasi dan Status Code

API menerapkan validasi pada data yang dikirimkan serta menggunakan HTTP status code sesuai kondisi:

- `200 OK`: Permintaan berhasil.
- `201 Created`: Data berhasil ditambahkan.
- `204 No Content`: Data berhasil dihapus.
- `400 Bad Request`: Data atau input tidak valid.
- `404 Not Found`: Data atau endpoint tidak ditemukan.
- `500 Internal Server Error`: Terjadi kesalahan pada server.

## Arsitektur Aplikasi

Project menggunakan pemisahan beberapa bagian agar kode lebih terstruktur:

- **Routes:** Mengatur alamat endpoint API.
- **Controller:** Mengatur request, response, dan validasi input.
- **Service:** Menangani proses pengolahan data melalui Prisma ORM.
- **Prisma:** Menghubungkan aplikasi dengan database SQLite.

## Database

Database yang digunakan adalah SQLite dengan Prisma ORM. Data buku disimpan menggunakan model `Buku` dengan atribut:

- `id`
- `judul`
- `penulis`
- `tahun`
- `stok`

## Pengujian

Pengujian dilakukan menggunakan browser atau aplikasi seperti Postman dan `curl` untuk memastikan seluruh endpoint berjalan dengan baik, termasuk pengujian input tidak valid dan data yang tidak ditemukan.
