# AKTIVITAS KELOMPOK PERTEMUAN 6
## Perancangan Skema Database Menggunakan Prisma ORM

### Anggota Kelompok 3
1. Dadika Yudiana
2. Faatin Ashri
3. Marsya Nurdrianti

---

## 1. Identifikasi Skema Database

### A. Deskripsi Sistem

Sistem Informasi Absensi merupakan sistem yang digunakan untuk mengelola data anggota dan mencatat kehadiran anggota dalam suatu organisasi. Sistem ini membantu proses pengelolaan data agar lebih terstruktur dan memudahkan pencatatan absensi.

### B. Tujuan Perancangan Database

Tujuan perancangan database ini adalah:
1. Menyimpan data anggota secara terstruktur.
2. Mencatat riwayat kehadiran setiap anggota.
3. Menghubungkan data anggota dengan data absensi.
4. Mempermudah proses pengelolaan data melalui API.

### C. Identifikasi Entitas

Pada sistem ini terdapat dua entitas utama, yaitu:

**1. Anggota**

Digunakan untuk menyimpan informasi anggota organisasi.

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | Int | ID anggota sebagai primary key |
| nama | String | Nama anggota |
| divisi | String | Divisi anggota |
| status | String | Status keanggotaan |

**2. Absensi**

Digunakan untuk menyimpan catatan kehadiran anggota.

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | Int | ID absensi sebagai primary key |
| anggotaId | Int | ID anggota sebagai foreign key |
| tanggal | String | Tanggal absensi |
| keterangan | String | Keterangan kehadiran |

### D. Relasi Antar Entitas

Relasi antara tabel Anggota dan Absensi adalah **One-to-Many**, artinya satu anggota dapat memiliki banyak catatan absensi, sedangkan satu catatan absensi hanya dimiliki oleh satu anggota.

Alur relasinya:

Anggota (1) → Absensi (N)

---

## 2. Perancangan Model Prisma

Prisma ORM digunakan untuk mendefinisikan struktur database melalui file `schema.prisma`.

### A. Kode Schema Prisma

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated"
}

datasource db {
  provider = "sqlite"
}

model Anggota {
  id      Int       @id @default(autoincrement())
  nama    String
  divisi  String
  status  String
  absensi Absensi[]

  @@map("anggota")
}

model Absensi {
  id         Int      @id @default(autoincrement())
  anggotaId  Int
  tanggal    String
  keterangan String

  anggota Anggota @relation(
    fields: [anggotaId],
    references: [id],
    onDelete: Cascade
  )

  @@map("absensi")
}
```

### B. Penjelasan Model

**Model Anggota**

- `id`: Sebagai identitas unik setiap anggota.
- `nama`: Menyimpan nama anggota.
- `divisi`: Menyimpan divisi tempat anggota bergabung.
- `status`: Menyimpan status keanggotaan.
- `absensi`: Relasi yang menghubungkan anggota dengan data absensi.

**Model Absensi**

- `id`: Sebagai identitas unik data absensi.
- `anggotaId`: Menghubungkan data absensi dengan anggota.
- `tanggal`: Menyimpan tanggal kehadiran.
- `keterangan`: Menyimpan keterangan absensi.
- `anggota`: Relasi menuju model Anggota.

### C. Penjelasan Beberapa Sintaks Prisma

- `@id`: Menentukan primary key.
- `@default(autoincrement())`: Membuat ID bertambah secara otomatis.
- `@relation`: Menghubungkan dua model.
- `fields`: Menentukan field foreign key.
- `references`: Menentukan field yang menjadi tujuan relasi.
- `onDelete: Cascade`: Menghapus data absensi ketika anggota yang terhubung dihapus.
- `@@map`: Menentukan nama tabel pada database.

---

## 3. Perancangan dan Penerapan Migration

### A. Pengertian Migration

Migration merupakan proses untuk menerapkan perubahan struktur database berdasarkan model yang sudah dibuat. Dengan migration, struktur tabel dapat dibuat dan dikelola secara teratur.

### B. Konfigurasi Environment Variable

File `.env` digunakan untuk menyimpan konfigurasi database dan port server.

Contoh isi file `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

Konfigurasi ini digunakan agar alamat database dan port server tidak perlu ditulis langsung pada banyak bagian kode.

### C. Konfigurasi Prisma

File `prisma.config.ts` digunakan untuk mengatur lokasi schema, folder migration, dan koneksi database.

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

### D. Tahapan Migration

Tahapan yang dilakukan dalam penerapan migration adalah:

**1. Validasi Schema**

```bash
npx prisma validate
```

Perintah ini digunakan untuk memeriksa apakah struktur schema sudah benar.

**2. Membuat Migration**

```bash
npx prisma migrate dev --name init
```

Perintah ini digunakan untuk membuat dan menerapkan migration awal ke database.

**3. Generate Prisma Client**

```bash
npx prisma generate
```

Perintah ini digunakan untuk menghasilkan Prisma Client agar aplikasi dapat berinteraksi dengan database.

### E. Urutan Pembuatan Tabel

Tabel Anggota menjadi tabel utama karena menyimpan informasi anggota. Selanjutnya, tabel Absensi dibuat dengan menggunakan `anggotaId` sebagai foreign key yang mengarah ke tabel Anggota.

Dengan demikian, hubungan antara kedua tabel dapat berjalan sesuai kebutuhan sistem.

---

## 4. Alasan dan Pertimbangan Teknis

### A. Alasan Memilih Entitas

Entitas Anggota dan Absensi dipilih karena keduanya merupakan bagian utama dari Sistem Informasi Absensi. Data anggota diperlukan untuk mengetahui identitas pengguna, sedangkan data absensi digunakan untuk mencatat kehadiran.

### B. Alasan Menggunakan Relasi One-to-Many

Relasi One-to-Many digunakan karena satu anggota dapat melakukan absensi berkali-kali pada tanggal yang berbeda. Dengan relasi ini, data anggota dan riwayat absensinya dapat saling terhubung.

### C. Alasan Menggunakan Prisma ORM

Prisma ORM dipilih karena memudahkan pengelolaan database melalui model yang terstruktur. Prisma juga menyediakan Prisma Client untuk menjalankan operasi seperti menampilkan, menambahkan, mengubah, dan menghapus data.

### D. Alasan Menggunakan SQLite

SQLite digunakan karena ringan, sederhana, dan tidak membutuhkan server database terpisah. Hal ini memudahkan proses pengembangan dan pengujian aplikasi.

### E. Alasan Menggunakan Environment Variable

Environment variable digunakan untuk memisahkan konfigurasi dari kode program. Dengan begitu, pengaturan database dan port server lebih mudah dikelola serta tidak perlu ditulis secara langsung di dalam kode aplikasi.

---

## 5. Alur Kerja Sistem

Alur kerja Sistem Informasi Absensi adalah sebagai berikut:

1. Pengguna mengirimkan permintaan melalui API.
2. Express menerima dan memproses permintaan.
3. Prisma Client menjalankan operasi database.
4. Database SQLite menyimpan atau mengambil data.
5. Hasil proses dikirimkan kembali dalam bentuk respons API.

Operasi yang dapat dilakukan meliputi:
- GET untuk menampilkan data anggota dan absensi.
- POST untuk menambahkan data anggota atau absensi.
- PATCH untuk mengubah data.
- DELETE untuk menghapus data.

---

## 6. Kesimpulan

Berdasarkan aktivitas kelompok ini, dapat disimpulkan bahwa perancangan schema Prisma membantu membuat struktur database menjadi lebih terorganisir. Sistem Informasi Absensi menggunakan dua entitas utama, yaitu Anggota dan Absensi, dengan relasi One-to-Many.

Penggunaan Prisma ORM, SQLite, migration, dan environment variable membantu proses pengelolaan database menjadi lebih mudah, terstruktur, dan sesuai dengan kebutuhan aplikasi.