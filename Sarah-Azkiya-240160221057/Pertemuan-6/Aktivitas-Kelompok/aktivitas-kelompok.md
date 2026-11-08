# Aktivitas Kelompok — Perancangan Skema Database Prisma (Pertemuan 6)

## Identitas Kelompok

**Kelompok:** 6

### Anggota Kelompok
1. Raihan Anugrah Pratama (240160221036)
2. Yosep Adipura Herdi (240160221048)
3. Sarah Azkiya (240160221057)

---

## 1. Identifikasi Skema Domain

### Domain yang Dipilih
Sesuai rancangan tugas proyek sejak Pertemuan 1, kelompok kami memilih domain **Sistem Informasi Perpustakaan**. Domain ini berfokus pada digitalisasi pencatatan pustaka (koleksi buku) dan pengguna perpustakaan (mahasiswa/pembaca/staf) untuk mendukung operasional peminjaman dan pengelolaan katalog yang terstruktur dan reliabel.

### Entity Utama

1. **Buku (`Buku`)**  
   Merepresentasikan koleksi pustaka yang tersedia dalam sistem perpustakaan.
   - `id`: Identitas unik internal buku (Primary Key).
   - `judul`: Judul lengkap buku.
   - `penulis`: Nama penulis/pengarang buku.
   - `tahun`: Tahun terbit publikasi buku.
   - `stok`: Kuantitas fisik buku yang tersedia di perpustakaan.

2. **Pengguna (`Pengguna`)**  
   Merepresentasikan data pengguna atau pemustaka yang terdaftar di sistem.
   - `id`: Identitas unik internal pengguna di database (Primary Key).
   - `nim`: Nomor Induk Mahasiswa/Pengguna yang bersifat unik untuk autentikasi dan penandaan identitas akademik.
   - `nama`: Nama lengkap pengguna.
   - `email`: Alamat surel unik untuk komunikasi dan notifikasi sirkulasi.
   - `role`: Peran otorisasi pengguna dalam sistem (misal: `"mahasiswa"`, `"dosen"`, atau `"admin"`).

### Relasi
Pada tahap perancangan arsitektur awal ini, entity `Buku` dan `Pengguna` dirancang mandiri untuk mempermudah migrasi awal dan operasi REST API dasar tanpa menambahkan relasi kompleks yang belum dibutuhkan pada fase ini. Namun, skema ini telah dipersiapkan agar dapat diperluas dengan entity transaksi peminjaman (`Peminjaman`) yang menghubungkan `Pengguna` dan `Buku` secara foreign key (`userId` dan `bukuId`) pada tahap pengembangan berikutnya.

---

## 2. Model Prisma

Model Prisma disusun menggunakan SQLite sebagai database engine lokal pengembangan dan Prisma ORM versi 7:

```prisma
generator client {
  provider            = "prisma-client"
  output              = "./generated"
  importFileExtension = "ts"
}

datasource db {
  provider = "sqlite"
}

model Buku {
  id      Int    @id @default(autoincrement())
  judul   String
  penulis String
  tahun   Int
  stok    Int    @default(0)

  @@map("buku")
}

model Pengguna {
  id    Int    @id @default(autoincrement())
  nim   String @unique
  nama  String
  email String @unique
  role  String @default("mahasiswa")

  @@map("pengguna")
}
```

### Tabel Penjelasan Field, Tipe Data, dan Constraint

#### Model `Buku`
| Field | Tipe Data | Constraint / Atribut | Keterangan & Alasan |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Primary key numerik bertambah otomatis secara internal. |
| `judul` | `String` | Wajib diisi (`NOT NULL`) | Menyimpan teks judul buku. |
| `penulis` | `String` | Wajib diisi (`NOT NULL`) | Menyimpan nama pengarang. |
| `tahun` | `Int` | Wajib diisi (`NOT NULL`) | Menyimpan tahun rilis buku dalam bentuk bilangan bulat untuk memudahkan filter & sorting. |
| `stok` | `Int` | `@default(0)` | Menyimpan ketersediaan eksemplar fisik buku, default bernilai 0 bila belum ditentukan. |

#### Model `Pengguna`
| Field | Tipe Data | Constraint / Atribut | Keterangan & Alasan |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Primary key numerik bertambah otomatis. |
| `nim` | `String` | `@unique` | NIM pengguna yang bersifat unik agar tidak terjadi duplikasi akun. |
| `nama` | `String` | Wajib diisi (`NOT NULL`) | Nama lengkap pengguna. |
| `email` | `String` | `@unique` | Alamat surel pengguna, unik agar tidak dipakai ganda. |
| `role` | `String` | `@default("mahasiswa")` | Peran pengguna dalam hak akses, default `"mahasiswa"`. |

### Alasan Pemilihan Skema
1. **Pemisahan Primary Key Internal dan Natural Key:**  
   Penggunaan `id` autoincrement memberikan performa indeks yang efisien di tingkat database, sedangkan `nim` dan `email` tetap dijamin keunikannya via constraint `@unique`.
2. **Integritas Tipe Data:**  
   Field numerik seperti `tahun` dan `stok` menggunakan tipe `Int` sehingga validasi aritmatika dan kuantitas terjamin konsisten tanpa risiko kesalahan tipe string.
3. **Standar Penamaan Tabel:**  
   Penggunaan anotasi `@@map("buku")` dan `@@map("pengguna")` memastikan konvensi penamaan tabel di database tetap konsisten huruf kecil (*lowercase*), meskipun di level kode Prisma model menggunakan PascalCase.
4. **Sederhana dan Terfokus:**  
   Skema ini menghindari relasi banyak-ke-banyak (*many-to-many*) atau relasi melingkar sebelum kebutuhan bisnis menuntutnya, sehingga mempermudah proses migrasi dan debugging API.

---

## 3. Rancang Migration

Migration Prisma digunakan untuk melacak dan mengeksekusi evolusi skema database secara deklaratif dan dapat direproduksi pada berbagai mesin.

### Urutan Tahapan Migration

1. **Penyusunan Definisi Skema**  
   Mendefinisikan datasource, generator, dan model-model di berkas `prisma/schema.prisma`.

2. **Eksekusi Pembuatan Migration Baru (Development)**  
   Menjalankan perintah:
   ```bash
   npx prisma migrate dev --name init_perpustakaan
   ```
   Prisma akan membandingkan skema dengan status database saat ini, menghasilkan file SQL migrasi di folder `prisma/migrations/<timestamp>_init_perpustakaan/migration.sql`, dan langsung mengaplikasikannya ke database lokal (`dev.db`).

3. **Verifikasi Script SQL Hasil Migration**  
   Prisma membuat tabel secara otomatis dengan query terstruktur:
   - `CREATE TABLE "buku"` beserta definisi kolom dan primary key.
   - `CREATE TABLE "pengguna"` beserta `UNIQUE INDEX` untuk `nim` dan `email`.

4. **Generate Prisma Client**  
   Menjalankan:
   ```bash
   npx prisma generate
   ```
   Menghasilkan type-safe client lokal yang siap digunakan oleh controller dan service aplikasi.

5. **Deployment Migration ke Lingkungan Produksi**  
   Untuk lingkungan staging atau produksi yang menggunakan version control, migration diterapkan tanpa membuat riwayat baru dengan perintah:
   ```bash
   npx prisma migrate deploy
   ```

---

## 4. Pengelolaan Koneksi dengan Environment Variable

Koneksi database dikelola secara aman menggunakan environment variable melalui modul `dotenv` dan konfigurasi Prisma:

### Konfigurasi `.env.example`
File ini disertakan ke dalam repository sebagai panduan konfigurasi bagi pengembang lain tanpa membocorkan data sensitif:
```dotenv
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

### Konfigurasi `.env` Lokal
File `.env` dibuat di lokal masing-masing pengembang:
```dotenv
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

### Konfigurasi Prisma (`prisma.config.ts`)
Pada Prisma ORM modern (Prisma 7), URL datasource dimuat secara fleksibel melalui konfigurasi:
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
});
```

### Keamanan dan Best Practice
- `.env` dimasukkan ke dalam `.gitignore` sehingga file database dan kredensial sensitif tidak akan terunggah ke repositori Git publik.
- Mengubah database engine (misal dari SQLite lokal ke PostgreSQL cloud) cukup dilakukan dengan mengganti nilai string `DATABASE_URL` pada `.env` tanpa harus mengubah kode logika aplikasi (*12-Factor App methodology*).

---

## 5. Bahan Presentasi & Kesimpulan Kelompok

### Ringkasan Poin Presentasi
1. **Latar Belakang:** Kelompok 6 mengimplementasikan domain Sistem Informasi Perpustakaan untuk mendigitalkan katalog buku dan basis data pengguna.
2. **Model Data:** Entitas `Buku` memiliki field `id`, `judul`, `penulis`, `tahun`, dan `stok`. Entitas `Pengguna` memiliki field `id`, `nim`, `nama`, `email`, dan `role`.
3. **Kelebihan Prisma ORM:** Menyediakan migrasi deklaratif otomatis, type-safety end-to-end dengan TypeScript, dan query builder yang bersih tanpa raw SQL yang rawan SQL injection.
4. **Alur Kerja Migrasi:** Berubah dari file skema deklaratif menjadi tabel fisik SQLite melalui perintah `prisma migrate dev`.
5. **Keamanan Konfigurasi:** Isolasi string koneksi melalui environment variable `.env` dan template `.env.example`.
