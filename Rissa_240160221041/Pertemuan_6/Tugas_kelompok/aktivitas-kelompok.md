# Aktivitas Kelompok — Pertemuan 6

## Identitas Kelompok

**Kelompok:**

**Anggota Kelompok:**
1. Muhammad Mulky
2. Rissa Srihandita

---

## Identifikasi Skema 

* **Domain**: Sistem Informasi Akademik / Kemahasiswaan
* **Entity Utama**: 
  1. `Prodi` (Program Studi)
  2. `Pengguna` (Mahasiswa/Pengguna Utama)
* **Kardinalitas Relasi**: **One-to-Many ($1 : N$)**
  * Satu `Prodi` memiliki banyak `Pengguna` (Mahasiswa).
  * Satu `Pengguna` hanya terdaftar pada satu `Prodi`.

---

## Model Prisma (`prisma/schema.prisma`) 

Berikut adalah skema Prisma lengkap yang mendefinisikan model, field, tipe data, atribut default, dan relasinya:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

model Prodi {
  id        String     @id @default(uuid())
  kode      String     @unique
  nama      String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  pengguna  Pengguna[]
}

model Pengguna {
  nim       String   @id
  nama      String
  email     String   @unique
  role      String   @default("mahasiswa")
  prodiId   String?
  prodi     Prodi?   @relation(fields: [prodiId], references: [id], onDelete: SetNull)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Rancangan Migration 

Urutan migrasi dilakukan secara bertahap untuk menjamin integritas data (*foreign key*):

1. **Eksekusi Migration Awal**:
   Jalankan perintah berikut di terminal:
   ```bash
   npx prisma migrate dev --name init_prodi_pengguna
   ```
   * **Urutan Pembuatan Tabel oleh Database**:
     * Tabel `Prodi` akan dibuat terlebih dahulu sebagai tabel induk (*parent table*).
     * Tabel `Pengguna` dibuat berikutnya dengan mendefinisikan *foreign key* `prodiId` yang merujuk pada `Prodi(id)`.

2. **Generate Client**:
   ```bash
   npx prisma generate
   ```
   Memperbarui tipe TypeScript pada folder `./generated` agar relasi `prodi` dan `pengguna` dapat diakses secara *type-safe* di Service dan Controller.

---

## Alasan Teknis Pemilihan Skema
* **Atribut `@default(uuid())` pada `Prodi`**: Mencegah *ID collision* dan meningkatkan keamanan karena ID bersifat acak dan tidak mudah ditebak dibanding urutan angka incremental.
* **NIM sebagai Primary Key (`@id`)**: NIM bersifat unik, permanen, dan merupakan pengenal alami (*natural key*) bagi seorang mahasiswa.
* **Penggunaan Relasi `@relation(onDelete: SetNull)`**: Jika sebuah Program Studi dihapus, data mahasiswa tidak akan ikut terhapus (*cascade delete* dicegah), melainkan nilai `prodiId` pada mahasiswa di-set menjadi `null`.
* **Constraint Unique (`@unique`)**: Diterapkan pada `kode` prodi dan `email` pengguna untuk menjaga integritas data dan mempercepat proses pencarian.

### B. Pengelolaan Koneksi via Environment Variable
* **Abstraksi Keamanan**: File `schema.prisma` menggunakan fungsi `env("DATABASE_URL")` sehingga kredensial database tidak di-*hardcode* di dalam kode program.
* **Portabilitas Environment**: 
  * Pada lingkungan **Development (Lokal)**, file `.env` berisi `DATABASE_URL="file:./dev.db"`.
  * Pada lingkungan **Production (Server)**, variabel `.env` dapat dengan mudah disesuaikan ke PostgreSQL/MySQL (contoh: `postgresql://user:pass@localhost:5432/db`) tanpa perlu mengubah kode logika aplikasi.

## Kesimpulan

Berdasarkan perancangan dan analisis yang telah dilakukan, dapat disimpulkan bahwa:

1. **Integritas & Keamanan Data**: Penerapan relasi *One-to-Many* ($1:N$) antara `Prodi` dan `Pengguna` dengan aturan `onDelete: SetNull` menjamin bahwa data mahasiswa tetap aman meskipun terjadi perubahan atau penghapusan data program studi. Penggunaan UUID dan kata kunci `@unique` secara efektif mencegah duplikasi data serta menjaga keamanan entitas.

2. **Efisiensi Pengembangan via Prisma ORM**: Prisma memudahkan proses pemodelan data serta migrasi secara terstruktur. Fitur penerjemahan otomatis skema menjadi *type-safe client* mempercepat integrasi pada lapisan *Service* dan *Controller* tanpa mengorbankan ketepatan tipe data TypeScript.

3. **Fleksibilitas Arsitektur**: Pemisahan kredensial menggunakan *environment variable* (`DATABASE_URL`) memberikan portabilitas tinggi, memungkinkan aplikasi untuk beralih antar-lingkungan (*development* ke *production*) maupun antar-DBMS (*SQLite* ke *PostgreSQL/MySQL*) secara seamless tanpa mengubah struktur koding backend.