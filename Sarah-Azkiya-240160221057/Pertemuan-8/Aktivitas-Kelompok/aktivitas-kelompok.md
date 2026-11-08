# Aktivitas Kelompok — Evaluasi Arsitektur REST API & Persiapan UTS Mini Project (Pertemuan 8)

## Identitas Kelompok

**Kelompok:** 6

### Anggota Kelompok
1. **Raihan Anugrah Pratama** (NIM: 240160221036)
2. **Yosep Adipura Herdi** (NIM: 240160221048)
3. **Sarah Azkiya** (NIM: 240160221057)

**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Studi Kasus:** Sistem Informasi Perpustakaan  
**Resource Utama:** Buku (`/buku`) & Anggota (`/anggota`)  
**Basis Data:** SQLite via Prisma ORM 7 (`better-sqlite3` adapter)

---

## 1. Latar Belakang & Ringkasan Proyek

Pada Pertemuan 8 (Evaluasi Tengah Semester / UTS Mini Project), tim Kelompok 6 mengevaluasi dan mengintegrasikan seluruh capaian pembelajaran dari Pertemuan 1 hingga Pertemuan 7. Proyek backend yang dikembangkan adalah **Sistem Informasi Perpustakaan**, sebuah RESTful API modern yang mengelola dua resource inti:

1. **Katalog Buku (`/buku`):** Mengelola koleksi pustaka dengan atribut judul, penulis, tahun terbit, dan ketersediaan stok fisik.
2. **Keanggotaan Perpustakaan (`/anggota`):** Mengelola data pemustaka/anggota aktif dengan atribut nama lengkap, Nomor Induk Mahasiswa (NIM) unik, dan program studi/jurusan.

---

## 2. Evaluasi Arsitektur 3-Tier (Route–Controller–Service)

Arsitektur aplikasi menerapkan pola pemisahan tanggung jawab (*Separation of Concerns*) secara ketat melalui 3 lapisan utama:

```text
               ┌────────────────────────────────────────────────────────┐
               │                     HTTP Client                        │
               │             (Postman, curl, Frontend Web)             │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                    HTTP Request
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                      Layer Route                       │
               │   (src/routes/buku.routes.ts, anggota.routes.ts)       │
               │  - Pemetaan URL path dan HTTP Method                  │
               │  - Tidak mengandung logika bisnis maupun query DB      │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                   req, res, next
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                    Layer Controller                    │
               │ (src/controller/buku.controller.ts, anggota.controller)│
               │  - Parsing parameter (req.params, req.body, req.query) │
               │  - Validasi tipe data dan batasan nilai               │
               │  - Pengembalian HTTP Status Code dan JSON format       │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                     DTO Payload
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                     Layer Service                      │
               │   (src/service/buku.service.ts, anggota.service.ts)    │
               │  - Logika bisnis utama                                 │
               │  - Interaksi Prisma Client ORM                         │
               │  - Lemparan Custom Exception (NotFoundError, Conflict) │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                     Prisma Query
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                   Database SQLite                      │
               │                  (prisma/dev.db)                       │
               └────────────────────────────────────────────────────────┘
```

### Keunggulan Evaluasi Arsitektur
1. **Maintainability:** Modifikasi pada logika query database di Service tidak mempengaruhi deklarasi route maupun formatting respons pada Controller.
2. **Testability:** Masing-masing fungsi controller dan service dapat diuji secara terisolasi tanpa memerlukan dependensi server HTTP penuh.
3. **Decoupling:** Error database (seperti constraint violation `P2002` atau record missing `P2025`) diterjemahkan menjadi domain error yang bersih (`ConflictError`, `NotFoundError`).

---

## 3. Desain Skema Database Prisma

Skema database dirancang menggunakan Prisma schema dengan provider SQLite dan driver adapter `better-sqlite3`:

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

### Karakteristik Model:
- **`Buku`**: Menggunakan kunci primer auto-increment integer, field `judul` dan `penulis` bertipe teks, `tahun` dan `stok` berupa integer non-negatif.
- **`Anggota`**: Menggunakan atribut `@unique` pada kolom `nim` guna menjamin tidak adanya duplikasi identitas pemustaka di perpustakaan.

---

## 4. Matriks Endpoint API & Evaluasi Kode Status HTTP

| Resource | Method | Path | Status Sukses | Status Error | Deskripsi |
|---|---|---|---|---|---|
| **Sistem** | `GET` | `/` | `200 OK` | - | Informasi status layanan API |
| **Sistem** | `GET` | `/api/health` | `200 OK` | `500 Internal Error` | Cek koneksi server & database SQLite |
| **Buku** | `GET` | `/buku` | `200 OK` | `500 Internal Error` | Mengambil seluruh koleksi buku |
| **Buku** | `GET` | `/buku/:id` | `200 OK` | `400 Bad Request`, `404 Not Found` | Mengambil detail buku berdasarkan ID |
| **Buku** | `POST` | `/buku` | `201 Created` | `400 Bad Request` | Mendaftarkan buku baru |
| **Buku** | `PATCH` | `/buku/:id` | `200 OK` | `400 Bad Request`, `404 Not Found` | Memperbarui sebagian atribut buku |
| **Buku** | `DELETE` | `/buku/:id` | `204 No Content` | `400 Bad Request`, `404 Not Found` | Menghapus buku dari sistem |
| **Anggota** | `GET` | `/anggota` | `200 OK` | `500 Internal Error` | Mengambil seluruh data anggota |
| **Anggota** | `GET` | `/anggota/:id` | `200 OK` | `400 Bad Request`, `404 Not Found` | Mengambil detail anggota berdasarkan ID |
| **Anggota** | `POST` | `/anggota` | `201 Created` | `400 Bad Request`, `409 Conflict` | Mendaftarkan anggota baru (cek NIM unik) |
| **Anggota** | `PATCH` | `/anggota/:id` | `200 OK` | `400 Bad Request`, `404 Not Found` | Memperbarui atribut profil anggota |
| **Anggota** | `DELETE` | `/anggota/:id` | `204 No Content` | `400 Bad Request`, `404 Not Found` | Menghapus anggota dari sistem |

---

## 5. Audit Validasi Input & Standar Keamanan Data

Evaluasi bersama menetapkan aturan validasi yang diuji secara otomatis:

1. **Strict Type Checking & Sanitisasi String:**
   - Semua input string (`judul`, `penulis`, `nama`, `nim`, `jurusan`) melewati pembersihan spasi (`.trim()`) dan dilarang berupa string kosong.
2. **Boundary Value Analysis:**
   - Tahun buku dibatasi secara ketat antara tahun 1000 hingga 2100 (`1000 <= tahun <= 2100`).
   - Stok buku dilarang bernilai negatif (`stok >= 0`).
3. **Idempotensi & Proteksi Field `id`:**
   - Request `PATCH` tidak diizinkan mengubah nilai `id` (`400 Bad Request`).
   - Request `PATCH` dengan payload kosong tanpa field yang dikenali ditolak dengan `400 Bad Request`.
4. **Penanganan Konflik Unik (Unique Constraint):**
   - Percobaan pendaftaran anggota dengan `nim` yang telah terdaftar ditangkap oleh service (`P2002`) dan dikembalikan sebagai `409 Conflict`.
5. **Penanganan Resource Hilang (Not Found):**
   - Akses atau penghapusan data dengan ID yang tidak terdapat di database SQLite mengembalikan `404 Not Found`.

---

## 6. Pembagian Peran dan Kolaborasi Kelompok 6

Dalam persiapan dan evaluasi UTS Mini Project ini, pembagian peran Kelompok 6 adalah sebagai berikut:

| Nama Anggota | NIM | Peran Utama | Kontribusi Teknis |
|---|---|---|---|
| **Raihan Anugrah Pratama** | 240160221036 | Database & Schema Designer | Perancangan model Prisma, relasi atribut, konfigurasi migration SQLite, dan verifikasi prisma client. |
| **Yosep Adipura Herdi** | 240160221048 | Service Layer & Business Logic | Implementasi custom exception (`NotFoundError`, `ConflictError`), interaksi Prisma Client di layer service. |
| **Sarah Azkiya** | 240160221057 | Controller, Routing & Testing Specialist | Implementasi validasi input di controller, error handling terpusat di `app.ts`, pembuatan test suite otomatis, dan dokumentasi API. |

---

## 7. Kesimpulan & Roadmap Pasca-UTS

1. **Hasil Evaluasi:** Seluruh endpoint untuk kedua resource (`/buku` dan `/anggota`) telah memenuhi standar arsitektur REST API dengan pemisahan Route–Controller–Service secara sempurna, lolos 100% pengujian otomatis, serta bebas dari celah validasi input.
2. **Rencana Tahap Lanjutan:** Setelah UTS, tim akan memperluas domain Sistem Informasi Perpustakaan dengan menambahkan model relasional **Peminjaman** (*Transactions*) yang menghubungkan `Anggota` dengan `Buku`, lengkap dengan relasi *One-to-Many* dan *Many-to-Many*, pelacakan tanggal pinjam, dan status pengembalian.

