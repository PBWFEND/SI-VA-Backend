# REST API Mahasiswa — Tugas 5 Pertemuan 7

Aplikasi REST API untuk mengelola data mahasiswa yang dibangun dengan arsitektur berlapis (*layered architecture*) menerapkan pola **Service / Controller** menggunakan Node.js, Express.js, TypeScript, Prisma ORM v7, dan SQLite.

Tugas ini merupakan kelanjutan dan penyempurnaan dari Tugas 4 Pertemuan 6, dengan pemisahan tanggung jawab (*separation of concerns*) yang terstruktur, penguatan validasi gerbang `typeof`, kepatuhan terhadap standar kode status HTTP (termasuk 201, 204, 404, 409), serta error handling terpusat pada `app.ts`.

---

## 1. Teknologi yang Digunakan

| Komponen | Teknologi | Versi | Peran |
|---|---|---|---|
| Runtime | Node.js | v26.9.0 | Runtime JavaScript modern dengan native TypeScript stripping (`--experimental-strip-types`) |
| Web Framework | Express.js | ^5.3.0 | Framework server HTTP dan routing API |
| ORM | Prisma Client | ^7.10.1 | Object-Relational Mapping v7 untuk manipulasi basis data |
| Database Adapter | @prisma/adapter-better-sqlite3 | ^7.10.1 | Driver adapter SQLite resmi untuk Prisma v7 |
| Database Engine | better-sqlite3 | ^13.0.3 | Driver SQLite berkinerja tinggi |
| Konfigurasi Env | dotenv | ^18.0.9 | Pemuat variabel lingkungan dari file `.env` |
| Bahasa & Typing | TypeScript | ^7.0.2 | Tipe data statis dan integrasi compiler |
| Tipe Node & Express | @types/node & @types/express | ^26.6.2 & ^5.0.6 | Definisi tipe statis untuk Node.js dan Express |

---

## 2. Struktur Direktori Proyek

```text
Aldi_240160221001/Pertemuan-7/Tugas-5/
├── .env.example                       # Template konfigurasi variabel lingkungan
├── .gitignore                          # Aturan pengabaian file Git (node_modules, .env, *.db)
├── package.json                        # Manifest proyek, dependency, dan scripts
├── tsconfig.json                       # Konfigurasi compiler TypeScript
├── prisma.config.ts                    # Konfigurasi Prisma v7 (schema, migrations, datasource)
├── server.ts                           # Entry point listener server HTTP
├── app.ts                              # Konfigurasi Express, middleware, routing, 404 & error handler
├── README.md                           # Dokumentasi resmi proyek
├── prisma/
│   ├── schema.prisma                  # Skema model basis data Mahasiswa
│   └── migrations/                    # Riwayat migrasi SQLite DDL
└── src/
    ├── config/
    │   └── client.ts                   # Inisialisasi Singleton PrismaClient
    ├── service/
    │   └── mahasiswa.service.ts        # Lapisan logika bisnis dan interaksi Prisma
    ├── controller/
    │   └── mahasiswa.controller.ts     # Lapisan handler HTTP, validasi gerbang typeof & status
    └── routes/
        └── mahasiswa.routes.ts         # Lapisan pemetaan rute endpoint Express
```

### Penjelasan Peran Setiap Lapisan:
- **`server.ts`**: Mengimpor aplikasi dari `app.ts`, membaca port dari environment (`process.env.PORT` dengan fallback `3008`), dan menjalankan `app.listen()`.
- **`app.ts`**: Menginisialisasi Express, mendaftarkan parser `express.json()`, endpoint dasar (`/` dan `/api/health`), memasang router `/mahasiswa`, menangani fallback rute 404, serta menangani error global (4 parameter).
- **`src/routes/`**: Mendefinisikan endpoint HTTP dan memetakan path ke fungsi Controller terkait tanpa memuat logika bisnis.
- **`src/controller/`**: Menerima request HTTP (`req`), memvalidasi tipe primitif payload (`typeof`), memeriksa rentang nilai, memanggil fungsi Service, dan mengirim response HTTP (`res`) dengan kode status yang tepat.
- **`src/service/`**: Murni menangani logika bisnis dan kueri basis data via Prisma. Tidak memiliki ketergantungan pada Express (`req`/`res`).
- **`src/config/`**: Menginisialisasi satu instance tunggal (*singleton*) PrismaClient untuk digunakan di seluruh service, mencegah kebocoran koneksi.

---

## 3. Arsitektur dan Alur Request

Aplikasi menerapkan pola pemisahan tanggung jawab secara ketat. Controller tidak diperbolehkan mengakses Prisma Client secara langsung:

```
[Client / curl / Postman]
            │
            ▼
    ┌───────────────┐
    │    app.ts     │ ──► express.json() & Global Middleware
    └───────────────┘
            │
            ▼
    ┌───────────────┐
    │  src/routes   │ ──► Router pemetaan HTTP Method & URL (/mahasiswa)
    └───────────────┘
            │
            ▼
    ┌───────────────┐
    │src/controller │ ──► Gerbang `typeof`, validasi rentang nilai, HTTP Status
    └───────────────┘
            │
            ▼
    ┌───────────────┐
    │  src/service  │ ──► Logika bisnis murni, DTO, melempar NotFoundError/ConflictError
    └───────────────┘
            │
            ▼
    ┌───────────────┐
    │  src/config   │ ──► PrismaClient Singleton (@prisma/adapter-better-sqlite3)
    └───────────────┘
            │
            ▼
    ┌───────────────┐
    │SQLite Database│ ──► prisma/dev.db (Tabel: mahasiswa)
    └───────────────┘
```

---

## 4. Persiapan dan Instalasi

Ikuti langkah-langkah berikut untuk menyiapkan dan menjalankan proyek dari terminal:

### Langkah 1: Masuk ke Direktori Proyek
```bash
cd Aldi_240160221001/Pertemuan-7/Tugas-5
```

### Langkah 2: Salin File Konfigurasi Environment
Salin template `.env.example` menjadi `.env`:

*Di Windows PowerShell:*
```powershell
Copy-Item .env.example .env
```

*Di Linux / macOS / Bash:*
```bash
cp .env.example .env
```

File `.env` berisi konfigurasi database dan port:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

### Langkah 3: Pasang Dependensi
```bash
npm install
```

### Langkah 4: Generate Prisma Client
```bash
npm run prisma:generate
```

### Langkah 5: Terapkan Migrasi Basis Data SQLite
```bash
npm run prisma:migrate -- --name init_mahasiswa
```

Perintah di atas akan membuat file basis data SQLite lokal di `prisma/dev.db` beserta tabel `mahasiswa`.

---

## 5. Menjalankan Aplikasi

Sesuai script yang terdefinisi pada `package.json`, aplikasi dapat dijalankan menggunakan native TypeScript execution Node.js 26:

### Mode Pengembangan (Live Reload)
Menjalankan server dengan fitur file watcher bawaan Node.js (`--watch`):
```bash
npm run dev
```

### Mode Standar / Produksi
Menjalankan server langsung:
```bash
npm start
```

Server akan aktif dan dapat diakses pada:
```text
http://localhost:3008
```

---

## 6. Daftar Endpoint API

| Method | Endpoint | Fungsi | Status Sukses | Body Response |
|:---:|---|---|:---:|---|
| **GET** | `/` | Informasi status API | `200 OK` | `{ success: true, message: "..." }` |
| **GET** | `/api/health` | Pemeriksaan kesehatan API dan koneksi database | `200 OK` | `{ success: true, message: "API dan database terhubung" }` |
| **GET** | `/mahasiswa` | Mengambil seluruh data mahasiswa (mendukung query filter) | `200 OK` | `{ success: true, total: N, data: [...] }` |
| **GET** | `/mahasiswa/:nim` | Mengambil detail satu mahasiswa berdasarkan NIM | `200 OK` | `{ success: true, data: {...} }` |
| **POST** | `/mahasiswa` | Menambahkan mahasiswa baru | `201 Created` | `{ success: true, message: "...", data: {...} }` |
| **PATCH**| `/mahasiswa/:nim` | Memperbarui sebagian data mahasiswa | `200 OK` | `{ success: true, message: "...", data: {...} }` |
| **DELETE**| `/mahasiswa/:nim` | Menghapus mahasiswa berdasarkan NIM | `204 No Content` | *Tanpa body* |

---

## 7. Format Data dan Aturan Validasi Mahasiswa

Struktur entitas mahasiswa pada basis data SQLite dimodelkan di `prisma/schema.prisma`:

| Field | Tipe Data | Prisma Modifier | Aturan Validasi Controller |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Dibuat otomatis oleh database |
| `nim` | `String` | `@unique` | Wajib string, tidak kosong setelah `.trim()`, tidak boleh diubah via PATCH |
| `nama` | `String` | - | Wajib string, tidak kosong setelah `.trim()` |
| `prodi` | `String` | - | Wajib string, tidak kosong setelah `.trim()` |
| `angkatan` | `Int` | - | **Wajib bertipe number** (bilangan bulat), minimal `2000` s.d. tahun berjalan (`2026`). Tidak menerima string angka |

### Contoh JSON Data Mahasiswa Valid:
```json
{
  "nim": "240160221001",
  "nama": "Aldi Restu Fauzi",
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}
```

---

## 8. Contoh Penggunaan API dengan cURL

> [!TIP]
> **Catatan untuk Pengguna Windows PowerShell:**  
> Pada PowerShell, perintah `curl` merupakan alias untuk `Invoke-WebRequest`. Gunakan executable **`curl.exe`** secara eksplisit seperti pada contoh di bawah agar payload JSON dan argumen dikirim dengan tepat.

### 1. Memeriksa Informasi Root API
```powershell
curl.exe -X GET http://localhost:3008/
```

### 2. Memeriksa Kesehatan Database (Health Check)
```powershell
curl.exe -X GET http://localhost:3008/api/health
```

### 3. Mengambil Semua Mahasiswa
```powershell
curl.exe -X GET http://localhost:3008/mahasiswa
```

### 4. Mengambil Mahasiswa dengan Filter Prodi
```powershell
curl.exe -X GET "http://localhost:3008/mahasiswa?prodi=Sistem%20Informasi"
```

### 5. Mengambil Mahasiswa dengan Filter Angkatan
```powershell
curl.exe -X GET "http://localhost:3008/mahasiswa?angkatan=2024"
```

### 6. Mengambil Mahasiswa dengan Filter Kombinasi
```powershell
curl.exe -X GET "http://localhost:3008/mahasiswa?prodi=Sistem%20Informasi&angkatan=2024"
```

### 7. Menambahkan Mahasiswa Baru (POST)
```powershell
curl.exe -X POST http://localhost:3008/mahasiswa `
  -H "Content-Type: application/json" `
  -d '{"nim":"240160221001","nama":"Aldi Restu Fauzi","prodi":"Sistem Informasi","angkatan":2024}'
```

*Contoh Respons (HTTP 201 Created):*
```json
{
  "success": true,
  "message": "Mahasiswa berhasil ditambahkan",
  "data": {
    "id": 1,
    "nim": "240160221001",
    "nama": "Aldi Restu Fauzi",
    "prodi": "Sistem Informasi",
    "angkatan": 2024
  }
}
```

### 8. Mengambil Detail Mahasiswa Berdasarkan NIM (GET)
```powershell
curl.exe -X GET http://localhost:3008/mahasiswa/240160221001
```

### 9. Memperbarui Sebagian Data Mahasiswa (PATCH)
```powershell
curl.exe -X PATCH http://localhost:3008/mahasiswa/240160221001 `
  -H "Content-Type: application/json" `
  -d '{"nama":"A. Restu","angkatan":2025}'
```

*Contoh Respons (HTTP 200 OK):*
```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diperbarui",
  "data": {
    "id": 1,
    "nim": "240160221001",
    "nama": "A. Restu",
    "prodi": "Sistem Informasi",
    "angkatan": 2025
  }
}
```

### 10. Menghapus Mahasiswa Berdasarkan NIM (DELETE)
```powershell
curl.exe -i -X DELETE http://localhost:3008/mahasiswa/240160221001
```

*Contoh Respons Header (HTTP 204 No Content tanpa body):*
```http
HTTP/1.1 204 No Content
Date: Sat, 31 Oct 2026 16:00:00 GMT
Connection: keep-alive
```

---

## 9. Format Respons dan Kode Status HTTP

Aplikasi menggunakan format JSON yang konsisten untuk seluruh respons:

### Format Respons Sukses
```json
{
  "success": true,
  "message": "Deskripsi keberhasilan operasi",
  "data": { ... }
}
```
*(Catatan: Endpoint `GET /mahasiswa` menyertakan properti `total: number`, sedangkan `DELETE` sukses mengembalikan status 204 tanpa body).*

### Format Respons Error
```json
{
  "success": false,
  "message": "Pesan deskripsi kesalahan"
}
```

### Tabel Kode Status HTTP:
| Status | Nama Status | Kapan Digunakan |
|---|---|---|
| **`200`** | OK | Permintaan GET dan PATCH berhasil dieksekusi. |
| **`201`** | Created | Data mahasiswa baru berhasil dibuat melalui POST. |
| **`204`** | No Content | Data mahasiswa berhasil dihapus melalui DELETE (respons tanpa body). |
| **`400`** | Bad Request | Parameter tidak valid, field wajib hilang, tipe data tidak sesuai, atau format JSON rusak (*malformed*). |
| **`404`** | Not Found | Mahasiswa tidak ditemukan berdasarkan NIM atau rute URL tidak terdaftar di server. |
| **`409`** | Conflict | Terjadi duplikasi data unik (NIM sudah terdaftar pada database). |
| **`500`** | Internal Server Error | Kesalahan tak terduga pada server/database (informasi sensitif disembunyikan). |

---

## 10. Penanganan Error (Error Handling)

Pola penanganan error diterapkan secara terpusat pada [`app.ts`](app.ts) menggunakan middleware 4 parameter `(err, req, res, next)`:

1. **`NotFoundError`**: Dilempar oleh Service saat data dengan NIM tertentu tidak ditemukan pada operasi `findByNim`, `update`, atau `delete` (Prisma error `P2025`). Diterjemahkan menjadi HTTP **404**.
2. **`ConflictError`**: Dilempar oleh Service saat terjadi pelanggaran unique constraint pada `create` (Prisma error `P2002`). Diterjemahkan menjadi HTTP **409**.
3. **Kesalahan JSON Malformed**: Ketika client mengirim payload dengan format JSON yang salah sintaksis, Express body-parser melempar `SyntaxError` dengan properti `body`. Ditangkap secara khusus dan menghasilkan HTTP **400** dengan pesan `"Format JSON tidak valid"`.
4. **Middleware Rute 404**: Ditempatkan setelah seluruh rute untuk menangkap path yang tidak terdaftar, menghasilkan HTTP **404** dengan pesan `"Endpoint tidak ditemukan"`.
5. **Global Error Handler**: Menangkap error tak terduga (500) dan mencatatnya ke konsol server, namun mengembalikan pesan umum aman ke client (`"Terjadi kesalahan pada server"`) tanpa mengekspos stack trace atau kueri basis data.

---

## 11. Ringkasan Hasil Pengujian Integrasi

Seluruh endpoint, gerbang validasi, dan alur error handling telah melalui pengujian integrasi otomatis:

- **Total Kasus Uji:** 29 skenario pengujian
- **Hasil Pengujian:** **29 Kasus PASS (100% Berhasil)**
- **Cakupan Pengujian:**
  - Health check & informasi root (2 skenario)
  - Operasi CRUD mahasiswa lengkap (GET, POST 201, PATCH 200, DELETE 204 tanpa body)
  - Validasi gerbang `typeof` ketat untuk `nim`, `nama`, `prodi`, dan `angkatan`
  - Validasi rentang nilai tahun angkatan (minimal tahun 2000 s.d. tahun berjalan)
  - Penolakan duplikasi NIM (HTTP 409) dan penolakan perubahan NIM pada PATCH
  - Penanganan payload JSON malformed (HTTP 400)
  - Pencegahan kebocoran informasi internal pada respon error
  - Pembersihan data otomatis (jumlah baris tabel mahasiswa kembali menjadi **0 baris** setelah pengujian selesai)

---

## 12. Keamanan dan Praktik Baik

1. **Isolasi Lingkungan:** File rahasia `.env`, artefak database lokal `prisma/dev.db`, dan folder `node_modules/` telah dimasukkan ke dalam `.gitignore` sehingga tidak terunggah ke repositori Git.
2. **Keamanan Header:** Menonaktifkan header `x-powered-by` via `app.disable("x-powered-by")` untuk menyembunyikan identitas teknologi backend dari pemindaian otomatis.
3. **Desain Singleton:** PrismaClient diinisialisasi hanya satu kali di `src/config/client.ts` untuk mencegah *connection exhaustion* dan *memory leak*.

