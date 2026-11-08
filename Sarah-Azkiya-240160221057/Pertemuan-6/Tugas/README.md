# Tugas 4 — REST API Perpustakaan dengan Prisma ORM & SQLite

**Mahasiswa:** Sarah Azkiya  
**NIM:** 240160221057  
**Program Studi:** Sistem Informasi  
**Domain Studi Kasus:** Sistem Informasi Perpustakaan  
**Resource Utama:** Buku (`/buku`)

---

## 1. Deskripsi Proyek

Proyek ini merupakan pengerjaan **Tugas 4 (Pertemuan 6 Praktikum Backend)** untuk mengembangkan API resource `buku` dari tugas sebelumnya yang semula menggunakan penyimpanan *in-memory* menjadi REST API persisten berbasis **Prisma ORM** dengan database engine **SQLite** dan pengelolaan konfigurasi melalui **environment variables**.

### Model Data Buku (`buku`)
| Field | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Primary key identitas unik buku otomatis |
| `judul` | `String` | Wajib (`NOT NULL`) | Judul buku |
| `penulis` | `String` | Wajib (`NOT NULL`) | Nama penulis/pengarang buku |
| `tahun` | `Int` | Wajib (`NOT NULL`) | Tahun terbit publikasi buku (1000 - 2100) |
| `stok` | `Int` | `@default(0)` | Jumlah eksemplar fisik buku yang tersedia (>= 0) |

---

## 2. Struktur Proyek

```text
tugas4/
├── .env.example              # Template variabel lingkungan
├── .env                      # Variabel lingkungan lokal (diabaikan Git)
├── .gitignore                # Aturan pengecualian berkas Git
├── package.json              # Dependensi dan script NPM
├── prisma.config.ts          # Konfigurasi Prisma 7
├── tsconfig.json             # Konfigurasi TypeScript
├── client.ts                 # Singleton instance PrismaClient
├── app.ts                    # Inisialisasi Express & routing
├── server.ts                 # Entry point server HTTP
├── test-runner.ts            # Skrip pengujian otomatis komprehensif
├── prisma/
│   ├── schema.prisma         # Definisi model data Prisma
│   └── migrations/           # Riwayat migrasi database SQL
│       └── 20261108150223_init_buku/
│           └── migration.sql # Berkas SQL migrasi tabel buku & pengguna
└── src/
    ├── controller/
    │   └── buku.controller.ts # Logika request/response & validasi input
    ├── routes/
    │   └── buku.routes.ts     # Definisi endpoint RESTful buku
    └── service/
        └── buku.service.ts    # Lapisan bisnis & kueri ke Prisma Client
```

---

## 3. Prasyarat & Instalasi

### Prasyarat
- Node.js versi 22+ (proyek menggunakan Node.js v24 yang mendukung `--experimental-strip-types`)
- npm versi 10+

### Langkah Instalasi
1. Buka terminal dan masuk ke folder `tugas4`:
   ```bash
   cd Sarah-Azkiya-240160221057/Pertemuan-6/tugas4
   ```

2. Pasang dependensi proyek:
   ```bash
   npm install
   ```

3. Buat berkas environment `.env` dari template `.env.example`:
   ```bash
   cp .env.example .env
   ```

---

## 4. Konfigurasi Environment Variable (`.env`)

Konfigurasi database dan port aplikasi disimpan di dalam berkas `.env`:
```dotenv
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

- `DATABASE_URL`: Menentukan lokasi berkas database SQLite lokal (`dev.db`).
- `PORT`: Port server HTTP lokal (default `3008`).

---

## 5. Migrasi & Prisma Client

1. **Menjalankan Migrasi Database:**
   ```bash
   npm run prisma:migrate
   # Atau langsung:
   npx prisma migrate dev --name init_buku
   ```
   Perintah ini akan membaca `prisma/schema.prisma`, membuat tabel `buku` pada database SQLite `prisma/dev.db`, dan mencatat riwayat migrasi pada folder `prisma/migrations/`.

2. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   # Atau langsung:
   npx prisma generate
   ```
   Prisma Client bertipe kuat (*type-safe*) akan dihasilkan pada folder `prisma/generated`.

---

## 6. Menjalankan Server

### Mode Produksi / Eksekusi Langsung:
```bash
npm start
# Menjalankan: node --experimental-strip-types server.ts
```

### Mode Pengembangan (Watch Mode):
```bash
npm run dev
# Menjalankan: node --watch --experimental-strip-types server.ts
```

Server akan aktif dan siap menerima request di: `http://localhost:3008`

---

## 7. Daftar Endpoint API

| Method | Endpoint | Status Sukses | Deskripsi |
|---|---|---|---|
| GET | `/` | 200 OK | Informasi umum API dan daftar endpoint |
| GET | `/api/health` | 200 OK | Pemeriksaan kesehatan server dan koneksi database |
| GET | `/buku` | 200 OK | Mengambil seluruh daftar buku (mendukung filter query) |
| GET | `/buku/:id` | 200 OK | Mengambil detail buku berdasarkan ID (404 jika tidak ditemukan) |
| POST | `/buku` | 201 Created | Menambahkan buku baru dengan validasi data |
| PATCH | `/buku/:id` | 200 OK | Memperbarui data buku secara parsial (404 jika tidak ditemukan) |
| DELETE | `/buku/:id` | 204 No Content | Menghapus buku berdasarkan ID (404 jika tidak ditemukan) |

### Filter Query pada `GET /buku`
- `GET /buku?penulis=Tere%20Liye` : Filter berdasarkan nama penulis
- `GET /buku?tahun=2023` : Filter berdasarkan tahun terbit
- `GET /buku?minStok=5` : Filter buku dengan stok minimal 5
- `GET /buku?q=Node` : Pencarian kata kunci pada judul atau penulis

---

## 8. Contoh Request & Response

### 8.1 POST `/buku` — Tambah Buku Baru
**Request:**
```http
POST /buku
Content-Type: application/json

{
  "judul": "Struktur Data dan Algoritma",
  "penulis": "Sarah Azkiya",
  "tahun": 2024,
  "stok": 12
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": 1,
    "judul": "Struktur Data dan Algoritma",
    "penulis": "Sarah Azkiya",
    "tahun": 2024,
    "stok": 12
  }
}
```

**Response Validasi Gagal (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validasi penambahan buku gagal",
  "details": [
    "Field 'judul' wajib diisi dengan teks tidak kosong",
    "Field 'tahun' harus berupa bilangan bulat antara 1000 hingga 2100"
  ]
}
```

---

### 8.2 GET `/buku` — Ambil Seluruh Buku
**Request:**
```http
GET /buku
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Daftar buku berhasil diambil",
  "total": 1,
  "data": [
    {
      "id": 1,
      "judul": "Struktur Data dan Algoritma",
      "penulis": "Sarah Azkiya",
      "tahun": 2024,
      "stok": 12
    }
  ]
}
```

---

### 8.3 GET `/buku/:id` — Detail Buku
**Request:**
```http
GET /buku/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Detail buku berhasil diambil",
  "data": {
    "id": 1,
    "judul": "Struktur Data dan Algoritma",
    "penulis": "Sarah Azkiya",
    "tahun": 2024,
    "stok": 12
  }
}
```

**Response Tidak Ditemukan (404 Not Found):**
```json
{
  "success": false,
  "message": "Buku dengan ID 999 tidak ditemukan"
}
```

---

### 8.4 PATCH `/buku/:id` — Perbarui Data Buku
**Request:**
```http
PATCH /buku/1
Content-Type: application/json

{
  "stok": 15
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data buku berhasil diperbarui",
  "data": {
    "id": 1,
    "judul": "Struktur Data dan Algoritma",
    "penulis": "Sarah Azkiya",
    "tahun": 2024,
    "stok": 15
  }
}
```

---

### 8.5 DELETE `/buku/:id` — Hapus Buku
**Request:**
```http
DELETE /buku/1
```

**Response (204 No Content):**
*(Tanpa response body)*

Jika diakses kembali setelah dihapus:
**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Buku dengan ID 1 tidak ditemukan"
}
```

---

## 9. Pengujian & Verifikasi Otomatis

Proyek dilengkapi dengan pengujian menyeluruh pada berkas `test-runner.ts` yang menguji:
1. Endpoint root `GET /` dan healthcheck `GET /api/health`
2. Kueri collection `GET /buku`
3. Detail buku `GET /buku/:id` (kasus 404 & 200)
4. Validasi input `POST /buku` (kasus 400 gagal validasi & 201 sukses)
5. Pembaruan parsial `PATCH /buku/:id` (kasus 200, 400 body kosong, 404 tidak ada)
6. Penghapusan data `DELETE /buku/:id` (kasus 204 sukses & 404 jika diulang)
7. Persistensi data pada database SQLite `dev.db`

Jalankan pengujian menggunakan:
```bash
node --experimental-strip-types test-runner.ts
```

---

## 10. Catatan Bantuan AI

Pengembangan Tugas 4 ini didampingi asisten AI (Antigravity/DeepMind) untuk:
- Merancang struktur migrasi Prisma ORM yang kompatibel dengan arsitektur Prisma 7 dan better-sqlite3 driver.
- Memastikan konsistensi penamaan schema, route, controller, service, dan DTO dengan standar TypeScript terkini.
- Membantu penyusunan suite pengujian otomatis untuk memverifikasi setiap status code (200, 201, 204, 400, 404, 500) dan persistensi database SQLite secara andal.

