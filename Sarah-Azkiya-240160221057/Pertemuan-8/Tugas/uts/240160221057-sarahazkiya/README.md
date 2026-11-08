# UTS Mini Project — RESTful API Sistem Informasi Perpustakaan

## Identitas Mahasiswa
- **Nama:** Sarah Azkiya
- **NIM:** 240160221057
- **Kelas / Angkatan:** SI-VA / 2024
- **Mata Kuliah:** Pemrograman Berbasis Web Back End
- **Kelompok:** Kelompok 6
  1. Raihan Anugrah Pratama (240160221036)
  2. Yosep Adipura Herdi (240160221048)
  3. Sarah Azkiya (240160221057)

---

## 1. Deskripsi Proyek

Proyek ini adalah implementasi **Ujian Tengah Semester (UTS) Mini Project** berupa backend RESTful API untuk **Sistem Informasi Perpustakaan**. Proyek dibangun menggunakan arsitektur modular berstandar industri dengan teknologi:
- **Runtime & Bahasa:** Node.js (v24) & TypeScript
- **Framework Web:** Express.js 5
- **ORM & Database:** Prisma ORM 7 dengan SQLite (`better-sqlite3` driver adapter)
- **Pola Desain:** Arsitektur 3-Tier (*Route–Controller–Service Pattern*) dengan pemisahan tanggung jawab yang jelas.

Proyek mengelola 2 (dua) resource inti perpustakaan:
1. **Resource Buku (`/buku`):** Katalog buku perpustakaan (judul, penulis, tahun terbit, stok).
2. **Resource Anggota (`/anggota`):** Data keanggotaan pemustaka (nama lengkap, NIM unik, program studi/jurusan).

---

## 2. Arsitektur Folder & Layering

Struktur proyek dirancang terstruktur dan terisolasi:

```text
240160221057-sarahazkiya/
├── .env                       # Konfigurasi environment (PORT, DATABASE_URL)
├── .env.example               # Contoh template environment
├── .gitignore                 # Konfigurasi file yang diabaikan Git
├── app.ts                     # Inisialisasi Express & middleware terpusat
├── server.ts                  # Bootstrapping & startup server HTTP
├── client.ts                  # Inisialisasi Prisma Client dengan driver adapter
├── package.json               # Konfigurasi paket & dependensi
├── tsconfig.json              # Konfigurasi kompilasi TypeScript
├── test-runner.ts             # Test suite otomatis (33 skenario pengujian)
├── prisma/
│   ├── schema.prisma          # Skema database Prisma
│   ├── dev.db                 # File database SQLite
│   └── migrations/            # Histori migration database
│       └── 20261104131557_init/
│           └── migration.sql
├── ss/                        # Bukti tangkapan layar pengujian API
│   ├── get.png
│   ├── get-buku.png
│   ├── get-buku-1.png
│   ├── post-buku1.png
│   ├── post-buku2.png
│   ├── pacth-buku-1.png
│   └── delete-buku-2.png
└── src/
    ├── routes/                # Layer Route (Pemetaan HTTP method & URL)
    │   ├── buku.routes.ts
    │   └── anggota.routes.ts
    ├── controller/            # Layer Controller (Validasi & HTTP formatting)
    │   ├── buku.controller.ts
    │   └── anggota.controller.ts
    └── service/               # Layer Service (Logika bisnis & akses Prisma ORM)
        ├── buku.service.ts
        └── anggota.service.ts
```

---

## 3. Skema Database (Prisma ORM)

```prisma
datasource db {
  provider = "sqlite"
}

generator client {
  provider = "prisma-client"
  output   = "./generated/client"
}

model Buku {
  id        Int      @id @default(autoincrement())
  judul     String
  penulis   String
  tahun     Int
  stok      Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Anggota {
  id        Int      @id @default(autoincrement())
  nama      String
  nim       String   @unique
  jurusan   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 4. Daftar Endpoint API

### A. Root & Health Check

| Method | Endpoint | Status | Keterangan |
|---|---|---|---|
| `GET` | `/` | `200 OK` | Informasi status API Sistem Informasi Perpustakaan |
| `GET` | `/api/health` | `200 OK` / `500` | Memeriksa konektivitas server ke database SQLite |

### B. Resource Buku (`/buku`)

| Method | Endpoint | Status Sukses | Status Error | Keterangan |
|---|---|---|---|---|
| `GET` | `/buku` | `200 OK` | `500` | Mengambil seluruh katalog buku |
| `GET` | `/buku/:id` | `200 OK` | `400`, `404` | Mengambil detail buku berdasarkan ID |
| `POST` | `/buku` | `201 Created` | `400` | Mendaftarkan buku baru |
| `PATCH` | `/buku/:id` | `200 OK` | `400`, `404` | Memperbarui atribut buku |
| `DELETE` | `/buku/:id` | `204 No Content` | `400`, `404` | Menghapus buku dari database |

### C. Resource Anggota (`/anggota`)

| Method | Endpoint | Status Sukses | Status Error | Keterangan |
|---|---|---|---|---|
| `GET` | `/anggota` | `200 OK` | `500` | Mengambil seluruh daftar anggota |
| `GET` | `/anggota/:id` | `200 OK` | `400`, `404` | Mengambil detail anggota berdasarkan ID |
| `POST` | `/anggota` | `201 Created` | `400`, `409` | Mendaftarkan anggota baru (NIM unik) |
| `PATCH` | `/anggota/:id` | `200 OK` | `400`, `404`, `409` | Memperbarui profil anggota |
| `DELETE` | `/anggota/:id` | `204 No Content` | `400`, `404` | Menghapus anggota dari sistem |

---

## 5. Aturan Validasi & Kode Status HTTP

1. **`200 OK`**: Berhasil mengambil atau memperbarui data.
2. **`201 Created`**: Berhasil membuat data baru (`Buku` atau `Anggota`).
3. **`204 No Content`**: Berhasil menghapus resource (respons tanpa body).
4. **`400 Bad Request`**:
   - Parameter ID bukan angka positif (`/buku/abc`, `/anggota/-1`).
   - Request body kosong atau bukan JSON valid.
   - Field `judul`, `penulis`, `nama`, `nim`, atau `jurusan` kosong / hanya spasi.
   - Nilai `tahun` di luar rentang `1000 - 2100`.
   - Nilai `stok` bertipe negatif (`< 0`).
   - Mencoba mengubah field `id` pada request `PATCH`.
5. **`404 Not Found`**:
   - Resource dengan ID yang diminta tidak ditemukan di database.
   - Endpoint URL tidak terdaftar.
6. **`409 Conflict`**:
   - Terjadi duplikasi nilai unik pada database (contoh: mendaftarkan anggota dengan NIM yang sudah ada).
7. **`500 Internal Server Error`**:
   - Kesalahan fatal internal server atau kegagalan koneksi database.

---

## 6. Contoh Pengujian Menggunakan cURL

### 1. Root & Health
```bash
curl -X GET http://localhost:3000/
curl -X GET http://localhost:3000/api/health
```

### 2. CRUD Buku
```bash
# Ambil semua buku
curl -X GET http://localhost:3000/buku

# Tambah buku baru
curl -X POST http://localhost:3000/buku \
  -H "Content-Type: application/json" \
  -d '{"judul":"Clean Code","penulis":"Robert C. Martin","tahun":2008,"stok":15}'

# Detail buku ID 1
curl -X GET http://localhost:3000/buku/1

# Update stok buku ID 1
curl -X PATCH http://localhost:3000/buku/1 \
  -H "Content-Type: application/json" \
  -d '{"stok":25}'

# Hapus buku ID 1
curl -X DELETE http://localhost:3000/buku/1
```

### 3. CRUD Anggota
```bash
# Ambil semua anggota
curl -X GET http://localhost:3000/anggota

# Tambah anggota baru
curl -X POST http://localhost:3000/anggota \
  -H "Content-Type: application/json" \
  -d '{"nama":"Sarah Azkiya","nim":"240160221057","jurusan":"Sistem Informasi"}'

# Detail anggota ID 1
curl -X GET http://localhost:3000/anggota/1

# Update jurusan anggota ID 1
curl -X PATCH http://localhost:3000/anggota/1 \
  -H "Content-Type: application/json" \
  -d '{"jurusan":"Teknologi Informasi"}'

# Hapus anggota ID 1
curl -X DELETE http://localhost:3000/anggota/1
```

---

## 7. Cara Menjalankan Aplikasi & Pengujian

### Prasyarat
- Node.js (>= 20.x, direkomendasikan Node.js 22+ atau 24+)
- npm

### Langkah Menjalankan Server
```bash
# Pindah ke direktori UTS
cd Sarah-Azkiya-240160221057/Pertemuan-8/uts/240160221057-sarahazkiya

# Install dependensi (jika belum)
npm install

# Jalankan migration database SQLite
npx prisma migrate dev

# Jalankan server API
npm start
```

### Langkah Menjalankan Pengujian Otomatis
```bash
# Menjalankan test suite mandiri (33 assertions)
node --experimental-strip-types test-runner.ts

# Verifikasi TypeScript (harus 0 errors)
npx tsc --noEmit
```

---

## 8. Bukti Pengujian (Screenshots)

Bukti visual pengujian API menggunakan tools HTTP client (Postman/Thunder Client) tersimpan di folder `ss/`:
- `ss/get.png` — Pengujian status server endpoint root `GET /`
- `ss/get-buku.png` & `ss/get-buku-1.png` — Pengujian katalog buku `GET /buku`
- `ss/post-buku1.png` & `ss/post-buku2.png` — Pengujian penambahan buku `POST /buku`
- `ss/pacth-buku-1.png` — Pengujian pembaruan atribut buku `PATCH /buku/:id`
- `ss/delete-buku-2.png` — Pengujian penghapusan buku `DELETE /buku/:id`

---

## 9. Hasil Verifikasi Akhir

- **Test Suite Otomatis:** 33 lolos dari 33 pengujian (**100% Pass**).
- **TypeScript Compiler Check:** 0 error (**Zero Compilation Errors**).
- **Integritas Database:** SQLite aktif dan termigrasi dengan Prisma ORM 7.

