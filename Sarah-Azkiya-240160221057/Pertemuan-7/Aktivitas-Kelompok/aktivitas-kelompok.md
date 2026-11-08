# Aktivitas Kelompok — Refactoring REST API dengan Pola Route–Controller–Service (Pertemuan 7)

## Identitas Kelompok

**Kelompok:** 6

### Anggota Kelompok
1. Raihan Anugrah Pratama (240160221036)
2. Yosep Adipura Herdi (240160221048)
3. Sarah Azkiya (240160221057)

**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Studi Kasus:** Sistem Informasi Perpustakaan  
**Resource Utama:** Buku (`/buku`) & Pengguna (`/pengguna`)

---

## 1. Analisis Endpoint Lama (Pertemuan 6)

### Kondisi Sebelum Refactoring
Pada Pertemuan 6, endpoint REST API dibangun dengan pendekatan *inline handler*. Dalam satu fungsi callback route (misal: `app.post("/buku", async (req, res) => { ... })`), terdapat beberapa tanggung jawab yang bercampur menjadi satu:
1. **Ekstraksi Request:** Mengambil parameter `req.params.id` atau `req.body`.
2. **Validasi Input:** Memeriksa tipe data, nilai kosong, rentang tahun, dan stok non-negatif.
3. **Query Database:** Memanggil Prisma Client (`prisma.buku.create`, `prisma.buku.findUnique`, dll.) secara langsung.
4. **Logika Bisnis & Error Handling:** Memeriksa keberadaan data, menangani kode error Prisma (misal: `P2002`).
5. **Format Respons HTTP:** Mengatur `res.status(code)` dan mengirim payload JSON ke client.

Pencampuran ini menyebabkan kode sulit diuji secara terisolasi (*unit test*), sulit dipelihara (*low maintainability*), dan melanggar prinsip *Single Responsibility Principle* (SRP).

### Tabel Pemetaan Bagian Kode Lama ke Layer Baru

| Bagian Kode pada Endpoint Lama | Tanggung Jawab Semula | Layer Target Refactoring | Alasan Pemindahan |
|---|---|---|---|
| `app.get("/buku", ...)`, `app.post("/buku", ...)` | Menentukan URL path dan metode HTTP | **Routes** (`src/routes/`) | Mengelompokkan route resource secara modular menggunakan `express.Router()`. |
| `const { judul, penulis, tahun, stok } = req.body` | Membaca input dan parameter dari client | **Controllers** (`src/controller/`) | Controller bertanggung jawab sebagai antarmuka antara protokol HTTP dan aplikasi. |
| Pemeriksaan `typeof judul !== "string"`, rentang tahun 1000–2100 | Memvalidasi integritas data request | **Controllers** (`src/controller/`) | Mencegah data tidak valid masuk ke lapisan data/service dan memberikan respons 400 sedini mungkin. |
| `await prisma.buku.findMany(...)`, `prisma.buku.create(...)` | Akses langsung ke database SQLite via Prisma | **Services** (`src/service/`) | Mengisolasi akses data sehingga tidak ada dependensi Prisma pada HTTP handler. |
| Pengecekan jika buku tidak ditemukan (`if (!buku)`) | Validasi keberadaan data di database | **Services** & **Controllers** | Service melempar `NotFoundError`, controller menerjemahkannya ke HTTP 404. |
| `return res.status(200).json({ success: true, ... })` | Membentuk struktur respons dan status code HTTP | **Controllers** (`src/controller/`) | Hanya controller yang berhak berinteraksi dengan objek `res: Response`. |
| `app.use(express.json())`, 404 handler, error handler | Inisialisasi Express dan middleware aplikasi | **App** (`app.ts`) | Memusatkan pipeline middleware dan registrasi router utama. |

---

## 2. Kondisi Setelah Refactoring (Arsitektur Layering)

Alur penanganan permintaan HTTP ditata ulang mengikuti pola berjenjang (*multi-tier architecture*):

```text
       HTTP Request
            │
            ▼
    ┌───────────────┐
    │     Client    │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │     Route     │  (src/routes/buku.routes.ts)
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │   Controller  │  (src/controller/buku.controller.ts)
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │    Service    │  (src/service/buku.service.ts)
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Prisma Client│  (client.ts)
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ SQLite (db)   │  (prisma/dev.db)
    └───────────────┘
```

---

## 3. Tanggung Jawab dan Batasan Setiap Layer

### 1. ROUTE (`buku.routes.ts`)
- **Tanggung Jawab:**
  - Mengelompokkan endpoint resource menggunakan `express.Router()`.
  - Memetakan setiap kombinasi HTTP Method dan URL path ke method controller yang sesuai (contoh: `router.get("/", bukuController.getAll)`).
- **Batasan Ketat (DILARANG):**
  - Tidak boleh melakukan kueri Prisma Client secara langsung.
  - Tidak boleh melakukan validasi bisnis detail.
  - Tidak boleh menyusun respons data JSON.

### 2. CONTROLLER (`buku.controller.ts`)
- **Tanggung Jawab:**
  - Menerima objek `req: Request` dan `res: Response` dari Express.
  - Membaca dan memverifikasi parameter URL (misal: verifikasi `typeof idRaw === "string"` sebelum konversi integer).
  - Melakukan validasi input request body (mengumpulkan daftar error validasi dalam array `details` sebelum mengembalikan status 400).
  - Memilih status code HTTP yang sesuai (200, 201, 204, 400, 404, 500).
  - Membentuk format respons JSON yang konsisten (`success`, `message`, `data`/`details`).
  - Memanggil fungsi pada layer service dan menangani error domain (seperti `NotFoundError`).
- **Batasan Ketat (DILARANG):**
  - Tidak boleh menulis kueri Prisma Client (`prisma.buku.*`).

### 3. SERVICE (`buku.service.ts`)
- **Tanggung Jawab:**
  - Menjalankan operasi manipulasi data database via Prisma Client (`create`, `findMany`, `findUnique`, `update`, `delete`).
  - Menerapkan aturan bisnis dan logika filter data (seperti pencarian judul/penulis, filter tahun terbit, stok minimum).
  - Melempar error domain murni (seperti `NotFoundError`) jika resource yang diminta tidak ditemukan di database.
- **Batasan Ketat (DILARANG):**
  - Tidak boleh mengetahui objek Express `req` atau `res`.
  - Tidak boleh menggunakan `res.status()` atau `res.json()`.
  - Tidak boleh membentuk respons berformat protokol HTTP.

### 4. APP (`app.ts`)
- **Tanggung Jawab:**
  - Menginisialisasi instance aplikasi Express.
  - Memasang middleware global: `express.json()` dan middleware pencatatan (logging).
  - Mendaftarkan router resource: `app.use("/buku", bukuRouter)`.
  - Menyediakan endpoint dasar: `GET /` (informasi API) dan `GET /api/health` (status koneksi database).
  - Menyediakan fallback middleware 404 untuk rute yang tidak terdaftar.
  - Menyediakan global error handler terpusat untuk menangani malformed JSON (400) dan kesalahan tak terduga (500).
- **Batasan Ketat (DILARANG):**
  - Tidak boleh menaruh operasi CRUD database langsung di dalam `app.ts`.

---

## 4. Rencana Refactoring dan Struktur Folder

Struktur folder proyek Pertemuan 7 dirancang rapi dan modular:

```text
Pertemuan-7/
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── test-runner.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── 20261108151500_init_buku/
│           └── migration.sql
├── src/
│   ├── routes/
│   │   └── buku.routes.ts
│   ├── controller/
│   │   └── buku.controller.ts
│   └── service/
│       └── buku.service.ts
├── aktivitas-kelompok/
│   └── aktivitas-kelompok.md
└── latihan-individu/
    ├── package.json
    ├── tsconfig.json
    ├── client.ts
    ├── latihan.ts
    ├── test-runner.ts
    └── prisma/
        └── schema.prisma
```

---

## 5. Kesimpulan Presentasi Kelompok 6

1. **Peningkatan Kualitas Kode:** Refactoring dari pola monolitik menjadi arsitektur berlapis (Route–Controller–Service) meningkatkan modularitas, kemudahan pengujian, dan keterbacaan kode (*code clarity*).
2. **Pemisahan Perhatian (Separation of Concerns):**
   - Routing hanya mengurus peta URL.
   - Controller fokus pada validasi HTTP, parsing payload, dan format respons.
   - Service fokus pada manipulasi data dan integrasi Prisma Client.
3. **Validasi Terpusat & Respons Konsisten:** Validasi yang diletakkan pada Controller mengumpulkan seluruh kesalahan input dalam bentuk array sehingga mempermudah integrasi dengan aplikasi frontend atau client API.
4. **Keamanan & Persistensi:** Operasi tetap menggunakan SQLite lokal yang persisten melalui Prisma ORM 7 dengan kredensial aman di file `.env`.

