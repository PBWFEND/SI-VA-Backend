# Tugas 5 — CRUD REST API dengan Pola Service/Controller

## Identitas Mahasiswa

- **Nama:** Devaldy Dzikri Syach Mas'ud
- **NIM:** 240160221050

## Deskripsi

Project ini merupakan pengembangan REST API Pengguna menggunakan Node.js, Express.js, TypeScript, Prisma ORM, dan database SQLite. Project menerapkan pola berlapis Service dan Controller untuk memisahkan logika bisnis, pengolahan request, dan routing.

## Teknologi

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite

## Struktur Folder

```text
tugas/
├── prisma/
│   ├── generated/
│   ├── migrations/
│   ├── dev.db
│   └── schema.prisma
├── src/
│   ├── routes/
│   │   └── pengguna.routes.ts
│   ├── controller/
│   │   └── pengguna.controller.ts
│   └── service/
│       └── pengguna.service.ts
├── app.ts
├── server.ts
├── client.ts
├── test-api.ts
├── tsconfig.json
├── prisma.config.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Alur Lapisan

1. **Routes** bertugas menentukan endpoint dan menghubungkan request ke controller.
2. **Controller** menangani request dan response, melakukan validasi input, serta menentukan status HTTP.
3. **Service** menangani logika bisnis dan operasi database melalui Prisma.
4. **Prisma** menghubungkan aplikasi dengan database SQLite.

Alur request:

`Client → Routes → Controller → Service → Prisma → Database`

## Instalasi dan Menjalankan Project

### 1. Clone Repository

```bash
git clone <url-repository>
```

### 2. Masuk ke Folder Project

```bash
cd tugas
```

### 3. Instal Dependencies

```bash
npm install
```

### 4. Konfigurasi Environment

Buat file `.env` berdasarkan `.env.example`.

```env
DATABASE_URL="file:./dev.db"
PORT=3009
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Jalankan Migrasi Database

```bash
npx prisma migrate dev
```

### 7. Jalankan Server

```bash
npm start
```

Server berjalan pada:

`http://localhost:3009`

## Endpoint REST API

| Method | Endpoint         | Keterangan                    |
| ------ | ---------------- | ----------------------------- |
| GET    | `/pengguna`      | Mengambil semua data pengguna |
| GET    | `/pengguna/:nim` | Mengambil detail pengguna     |
| POST   | `/pengguna`      | Menambahkan pengguna          |
| PATCH  | `/pengguna/:nim` | Memperbarui data pengguna     |
| DELETE | `/pengguna/:nim` | Menghapus pengguna            |

## Contoh Pengujian dengan curl

### 1. GET — Daftar Pengguna

```bash
curl http://localhost:3009/pengguna
```

### 2. GET — Detail Pengguna

```bash
curl http://localhost:3009/pengguna/240160221050
```

### 3. POST — Tambah Pengguna

```bash
curl -X POST http://localhost:3009/pengguna \
-H "Content-Type: application/json" \
-d "{\"nim\":\"240160221099\",\"nama\":\"Mahasiswa Tes\",\"email\":\"mahasiswa.tes@gmail.com\",\"role\":\"mahasiswa\"}"
```

### 4. PATCH — Memperbarui Pengguna

```bash
curl -X PATCH http://localhost:3009/pengguna/240160221099 \
-H "Content-Type: application/json" \
-d "{\"nama\":\"Mahasiswa Updated\"}"
```

### 5. DELETE — Menghapus Pengguna

```bash
curl -X DELETE http://localhost:3009/pengguna/240160221099
```

## Validasi dan Status HTTP

| Status | Keterangan                         |
| ------ | ---------------------------------- |
| 200    | Request berhasil                   |
| 201    | Data berhasil dibuat               |
| 204    | Data berhasil dihapus              |
| 400    | Input tidak valid                  |
| 404    | Data atau endpoint tidak ditemukan |
| 500    | Terjadi kesalahan pada server      |

Validasi dilakukan pada endpoint POST dan PATCH dengan pemeriksaan tipe data menggunakan `typeof`, validasi format email, dan pemeriksaan field yang wajib diisi.

## Pengujian API Otomatis

Pengujian endpoint dapat dilakukan menggunakan file `test-api.ts`.

Jalankan server terlebih dahulu, kemudian buka terminal lain dan jalankan:

```bash
node --experimental-strip-types test-api.ts
```

Pengujian meliputi GET, POST, validasi data, PATCH, dan DELETE.
