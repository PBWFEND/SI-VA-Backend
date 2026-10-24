# Aktivitas Kelompok 13 — Perancangan Skema Prisma

## Identitas Kelompok

**Kelompok:** 3

### Anggota Kelompok

| No. | Nama |
|---:|---|
| 1 | Devaldy Zikri S |
| 2 | Eka Bareeq |
| 3 | Faishal Rizky F |
| 4 | Fauzan Zainul Arifin |

---

## 1. Identifikasi Skema

### Domain yang Dipilih

Kelompok kami memilih domain **data mahasiswa**. Domain ini digunakan untuk menyimpan dan mengelola informasi dasar mahasiswa, seperti NIM, nama, program studi, dan tahun angkatan.

### Entity Utama

Entity utama yang digunakan adalah **Mahasiswa**.

| Field | Keterangan |
|---|---|
| `id` | Identitas unik internal mahasiswa di database |
| `nim` | Nomor Induk Mahasiswa yang bersifat unik |
| `nama` | Nama lengkap mahasiswa |
| `prodi` | Program studi mahasiswa |
| `angkatan` | Tahun angkatan mahasiswa |

### Relasi

Pada rancangan awal ini, hanya ada satu model, yaitu `Mahasiswa`, sehingga belum ada relasi antarmodel. Setiap data mahasiswa direpresentasikan sebagai satu baris pada tabel `mahasiswa`.

Jika sistem dikembangkan lebih lanjut, model seperti `ProgramStudi` dapat ditambahkan agar data program studi tidak perlu ditulis berulang pada setiap mahasiswa. Namun, model tambahan tersebut belum diperlukan untuk ruang lingkup aktivitas ini.

---

## 2. Susun Model Prisma

Berikut model Prisma yang digunakan:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Mahasiswa {
  id       Int    @id @default(autoincrement())
  nim      String @unique
  nama     String
  prodi    String
  angkatan Int

  @@map("mahasiswa")
}
```

### Penjelasan Field dan Tipe Data

| Field | Tipe data | Aturan | Alasan |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Menjadi primary key yang dibuat otomatis oleh database. |
| `nim` | `String` | `@unique` | NIM diperlakukan sebagai teks agar tidak bergantung pada operasi aritmetika dan harus unik. |
| `nama` | `String` | Wajib diisi | Menyimpan nama mahasiswa. |
| `prodi` | `String` | Wajib diisi | Menyimpan nama program studi. |
| `angkatan` | `Int` | Wajib diisi | Menyimpan tahun angkatan dalam bentuk bilangan bulat. |

### Alasan Teknis Pemilihan Skema

1. **Primary key terpisah:** `id` menjadi identitas internal yang stabil, sedangkan `nim` menjadi identitas akademik yang unik.
2. **Keunikan NIM:** atribut `@unique` mencegah dua data mahasiswa memiliki NIM yang sama.
3. **Tipe data sesuai kebutuhan:** `String` digunakan untuk informasi berbentuk teks, sedangkan `Int` digunakan untuk ID dan tahun angkatan.
4. **Default otomatis:** `autoincrement()` mengurangi kebutuhan mengisi ID secara manual.
5. **Nama tabel:** `@@map("mahasiswa")` menetapkan nama tabel database menjadi `mahasiswa`.
6. **Skema sederhana:** model hanya memuat field yang diperlukan untuk pengelolaan data mahasiswa pada tahap awal.

---

## 3. Rancang Migration

Migration digunakan untuk mencatat perubahan struktur database sehingga skema dapat diterapkan secara teratur dan direproduksi pada lingkungan lain.

### Urutan Migration

1. **Mendefinisikan model**  
   Model `Mahasiswa` ditulis di `prisma/schema.prisma`, termasuk tipe data, primary key, dan constraint unik.

2. **Membuat migration awal**  
   Jalankan perintah berikut saat membuat migration baru selama pengembangan:

   ```bash
   npx prisma migrate dev --name init_mahasiswa
   ```

   Perintah ini membuat file migration berdasarkan perubahan skema dan menerapkannya ke database pengembangan.

3. **Memeriksa hasil migration**  
   Periksa folder `prisma/migrations/` dan pastikan file SQL membuat tabel `mahasiswa`, kolom-kolomnya, primary key, serta constraint unik pada `nim`.

4. **Membuat Prisma Client**  
   Jalankan:

   ```bash
   npx prisma generate
   ```

   Prisma Client kemudian dapat digunakan oleh kode aplikasi untuk mengakses database melalui model `Mahasiswa`.

5. **Menerapkan migration yang sudah tersedia di lingkungan lain**  
   Untuk lingkungan yang menerima migration yang telah dibuat dan disimpan di version control, gunakan:

   ```bash
   npx prisma migrate deploy
   ```

   Perintah ini menerapkan migration yang tersedia tanpa membuat migration pengembangan baru.

### Hasil yang Diharapkan

Setelah migration berhasil diterapkan, database memiliki tabel `mahasiswa` dengan struktur sesuai `schema.prisma`. Perubahan skema berikutnya sebaiknya dibuat sebagai migration baru, bukan mengubah file migration lama yang sudah digunakan bersama.

---

## 4. Pengelolaan Koneksi dengan Environment Variable

Informasi koneksi database dikelola melalui environment variable `DATABASE_URL`, bukan ditulis langsung di kode aplikasi. Untuk pengembangan lokal, nilai koneksi disimpan pada file `.env`.

Contoh `.env` untuk SQLite:

```dotenv
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

Nilai `DATABASE_URL` harus sesuai dengan konfigurasi database dan cara proyek memuat konfigurasi Prisma. Pada Prisma versi 7, URL datasource pada proyek ini dikonfigurasi melalui `prisma.config.ts`.

Contoh konfigurasi yang digunakan:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

### Praktik yang Diterapkan

- File `.env` menyimpan konfigurasi lokal dan tidak boleh diunggah ke repository.
- File `.env.example` disediakan sebagai contoh variabel yang perlu diisi, tanpa menyimpan rahasia atau konfigurasi pribadi.
- File `.gitignore` digunakan untuk mencegah `.env` masuk ke Git.
- Pada komputer atau lingkungan deployment lain, `DATABASE_URL` diatur sesuai lingkungan tersebut.
- Environment variable memudahkan pemisahan konfigurasi antara pengembangan, pengujian, dan deployment tanpa mengubah kode aplikasi.

**Catatan:** contoh URL di atas mengikuti konfigurasi SQLite proyek ini. Jika database dipindahkan ke PostgreSQL atau layanan lain, URL dan konfigurasi adapter yang digunakan harus disesuaikan.

---

## 5. Kesimpulan Presentasi

Kelompok 3 memilih domain mahasiswa karena memiliki kebutuhan data yang jelas dan sesuai untuk mempraktikkan pemodelan database menggunakan Prisma. Model `Mahasiswa` mencakup identitas internal, NIM unik, nama, program studi, dan tahun angkatan.

Migration membantu memastikan struktur database dibuat dan diperbarui secara terkontrol. Sementara itu, environment variable `DATABASE_URL` memisahkan konfigurasi koneksi dari kode sehingga proyek lebih mudah dipindahkan ke lingkungan lain dan lebih aman dikelola melalui version control.
