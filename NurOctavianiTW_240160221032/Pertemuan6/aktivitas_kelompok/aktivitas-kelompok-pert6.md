# AKTIVITAS KELOMPOK 3
## PERTEMUAN 6 — INTEGRASI DATABASE DAN ORM UNTUK REST API

**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Domain Sistem Informasi:** Absensi Organisasi

### Anggota Kelompok 3

1. Nur Octaviani 
2. Muhammad Khotim
3. Winda

---

# 1. IDENTIFIKASI SKEMA

## 1.1 Deskripsi Sistem

Sistem Informasi Absensi Organisasi merupakan sistem yang dirancang untuk membantu organisasi dalam mengelola data anggota dan mencatat kehadiran anggota pada setiap kegiatan. Sistem ini memungkinkan data anggota tersimpan secara terstruktur dan catatan kehadiran dapat dikelola melalui database.

Dalam kegiatan organisasi, pencatatan kehadiran merupakan salah satu hal penting untuk mengetahui partisipasi anggota. Jika pencatatan dilakukan secara manual menggunakan kertas atau lembar kerja, terdapat risiko kesalahan pencatatan, kehilangan data, duplikasi informasi, dan kesulitan dalam mencari riwayat kehadiran.

Oleh karena itu, diperlukan Sistem Informasi Absensi Organisasi yang dapat menyimpan data anggota dan catatan absensi dalam database. Sistem dirancang menggunakan REST API agar data dapat diakses dan dikelola melalui permintaan HTTP, sedangkan Prisma ORM digunakan untuk membantu aplikasi berinteraksi dengan database.

Pada rancangan ini, database menggunakan dua entitas utama, yaitu **Anggota** dan **Absensi**. Entitas Anggota menyimpan informasi identitas anggota, sedangkan entitas Absensi menyimpan catatan kehadiran yang berhubungan dengan anggota tersebut.

## 1.2 Tujuan Sistem

Tujuan perancangan Sistem Informasi Absensi Organisasi adalah:

1. Mempermudah pengelolaan data anggota organisasi.
2. Menyimpan catatan kehadiran anggota secara terstruktur.
3. Mencatat tanggal, waktu masuk, status kehadiran, dan keterangan.
4. Mempermudah pencarian data anggota dan riwayat absensi.
5. Mengurangi risiko kehilangan dan duplikasi data.
6. Menjaga hubungan antara data anggota dan catatan absensi melalui relasi database.
7. Menyediakan dasar pengembangan REST API untuk operasi tambah, tampil, ubah, dan hapus data.
8. Menerapkan Prisma ORM dan migration dalam pengelolaan struktur database.

## 1.3 Ruang Lingkup Sistem

Ruang lingkup rancangan meliputi:

- Pengelolaan data anggota organisasi.
- Pencatatan kehadiran anggota.
- Penyimpanan tanggal dan waktu masuk.
- Pencatatan status kehadiran.
- Penyimpanan keterangan tambahan.
- Penampilan daftar anggota dan daftar absensi.
- Penampilan detail anggota dan detail absensi.
- Pembaruan dan penghapusan data sesuai kebutuhan pengelolaan.

Pada rancangan awal ini, sistem belum mencakup fitur login, pengaturan hak akses, pengelolaan acara secara terpisah, notifikasi, maupun pembuatan laporan statistik otomatis.

## 1.4 Identifikasi Entitas

Entitas merupakan objek utama yang datanya perlu disimpan dalam database. Berdasarkan kebutuhan sistem, terdapat dua entitas yang digunakan.

| No. | Nama Entitas | Fungsi |
|---|---|---|
| 1 | Anggota | Menyimpan identitas anggota organisasi. |
| 2 | Absensi | Menyimpan catatan kehadiran anggota pada tanggal tertentu. |

### A. Entitas Anggota

Entitas Anggota berfungsi sebagai tempat penyimpanan identitas setiap anggota organisasi. Data ini digunakan sebagai referensi ketika catatan kehadiran dibuat.

Atribut yang digunakan:

| No. | Nama Field | Tipe Data | Keterangan |
|---|---|---|---|
| 1 | id | Int | Primary key dengan nilai otomatis. |
| 2 | nim | String | Nomor induk mahasiswa dan harus unik. |
| 3 | nama | String | Nama lengkap anggota. |
| 4 | prodi | String | Program studi anggota. |

Field `id` digunakan sebagai identitas utama anggota di database, sedangkan `nim` digunakan untuk membedakan setiap anggota berdasarkan nomor induk mahasiswa.

### B. Entitas Absensi

Entitas Absensi berfungsi untuk mencatat kehadiran anggota organisasi. Setiap catatan absensi terhubung dengan anggota tertentu.

Atribut yang digunakan:

| No. | Nama Field | Tipe Data | Keterangan |
|---|---|---|---|
| 1 | id | Int | Primary key dengan nilai otomatis. |
| 2 | anggotaId | Int | Foreign key yang mengarah ke Anggota. |
| 3 | tanggal | DateTime | Tanggal dan waktu pencatatan absensi. |
| 4 | waktuMasuk | String | Waktu kedatangan anggota, bersifat opsional. |
| 5 | status | String | Status kehadiran anggota. |
| 6 | keterangan | String | Keterangan tambahan, bersifat opsional. |

Status kehadiran dapat berupa `Hadir`, `Izin`, `Sakit`, atau `Alpa`. Nilai tersebut perlu divalidasi oleh aplikasi agar konsisten.

Field `waktuMasuk` dan `keterangan` bersifat opsional karena dalam kondisi tertentu waktu masuk mungkin belum dicatat atau keterangan tambahan tidak diperlukan.

## 1.5 Identifikasi Relasi Antarentitas

Relasi yang digunakan dalam sistem adalah **One-to-Many (1:N)** antara Anggota dan Absensi.

Artinya, satu anggota dapat memiliki banyak catatan absensi, tetapi satu catatan absensi hanya terhubung dengan satu anggota.

Contoh:
- Della mengikuti tiga kegiatan organisasi.
- Data Della disimpan satu kali pada entitas Anggota.
- Setiap kehadiran Della disimpan sebagai catatan terpisah pada entitas Absensi.
- Seluruh catatan tersebut terhubung melalui `anggotaId`.

Diagram relasi:

```text
+-----------------------+
|        ANGGOTA        |
+-----------------------+
| PK id                 |
|    nim                |
|    nama               |
|    prodi              |
+-----------------------+
            |
            | 1
            |
            | N
+-----------------------+
|        ABSENSI        |
+-----------------------+
| PK id                 |
| FK anggotaId          |
|    tanggal            |
|    waktuMasuk         |
|    status             |
|    keterangan         |
+-----------------------+
```

Keterangan:
- **PK (Primary Key):** identitas unik pada setiap record.
- **FK (Foreign Key):** field yang menghubungkan data pada satu tabel dengan tabel lain.
- **1:N:** satu anggota dapat memiliki banyak catatan absensi.

Relasi ini dipilih agar data anggota tidak perlu ditulis ulang pada setiap catatan kehadiran. Selain itu, relasi foreign key membantu menjaga agar catatan absensi mengacu pada anggota yang benar-benar tersedia dalam database.

---

# 2. MENYUSUN MODEL PRISMA

## 2.1 Pengertian Prisma ORM

Prisma ORM merupakan alat yang membantu aplikasi mengakses dan mengelola database melalui model dan API yang terstruktur. Prisma Schema digunakan untuk menentukan nama model, field, tipe data, nilai default, serta relasi antarmodel.

Dalam Sistem Informasi Absensi Organisasi, Prisma digunakan untuk mendefinisikan struktur data Anggota dan Absensi. Setelah model dibuat, Prisma Client dapat digunakan oleh aplikasi untuk melakukan operasi CRUD (*Create, Read, Update, Delete*).

Penggunaan Prisma membantu pengembangan aplikasi menjadi lebih terstruktur karena model database ditulis dalam satu skema yang dapat divalidasi dan diterapkan melalui migration.

## 2.2 Rancangan Prisma Schema

Berikut rancangan Prisma Schema untuk database Sistem Informasi Absensi Organisasi menggunakan Prisma ORM versi 7 dan SQLite.

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
  nim     String    @unique
  nama    String
  prodi   String
  absensi Absensi[]

  @@map("anggota")
}

model Absensi {
  id         Int      @id @default(autoincrement())
  anggotaId  Int
  tanggal    DateTime
  waktuMasuk String?
  status     String
  keterangan String?

  anggota    Anggota  @relation(fields: [anggotaId], references: [id], onDelete: Cascade)

  @@map("absensi")
}
```

Skema tersebut mendefinisikan dua model yang akan dipetakan menjadi dua tabel pada database, yaitu `anggota` dan `absensi`.

## 2.3 Penjelasan Model Anggota

Model `Anggota` digunakan untuk menyimpan data identitas anggota organisasi.

**Penjelasan field:**

1. **`id Int @id @default(autoincrement())`**

   Field `id` memiliki tipe data integer dan menjadi primary key. Nilainya bertambah otomatis setiap kali data anggota baru ditambahkan.

2. **`nim String @unique`**

   Field `nim` menyimpan nomor induk mahasiswa. Atribut `@unique` memastikan tidak ada dua anggota yang menggunakan NIM yang sama.

3. **`nama String`**

   Field `nama` digunakan untuk menyimpan nama lengkap anggota.

4. **`prodi String`**

   Field `prodi` digunakan untuk menyimpan program studi anggota.

5. **`absensi Absensi[]`**

   Field ini merupakan relasi ke kumpulan catatan absensi milik anggota. Tanda `[]` menunjukkan bahwa satu anggota dapat mempunyai banyak catatan absensi.

6. **`@@map("anggota")`**

   Atribut ini menentukan nama tabel pada database menjadi `anggota`.

## 2.4 Penjelasan Model Absensi

Model `Absensi` digunakan untuk menyimpan catatan kehadiran anggota.

**Penjelasan field:**

1. **`id Int @id @default(autoincrement())`**

   Menjadi primary key dengan nilai otomatis.

2. **`anggotaId Int`**

   Menyimpan ID anggota yang mempunyai catatan absensi. Field ini digunakan sebagai foreign key.

3. **`tanggal DateTime`**

   Menyimpan tanggal dan waktu yang dicatat untuk absensi.

4. **`waktuMasuk String?`**

   Menyimpan waktu kedatangan anggota. Tanda `?` menunjukkan bahwa field ini bersifat opsional dan boleh bernilai `null`.

5. **`status String`**

   Menyimpan status kehadiran, misalnya Hadir, Izin, Sakit, atau Alpa.

6. **`keterangan String?`**

   Menyimpan informasi tambahan mengenai absensi. Field ini tidak wajib diisi.

7. **`anggota Anggota @relation(fields: [anggotaId], references: [id], onDelete: Cascade)`**

   Mendefinisikan hubungan antara Absensi dan Anggota. Field `anggotaId` menjadi foreign key yang mengarah ke field `id` pada model Anggota.

8. **`@@map("absensi")`**

   Menentukan nama tabel pada database menjadi `absensi`.

## 2.5 Penjelasan Sintaks Prisma

| Sintaks | Fungsi |
|---|---|
| `Int` | Menyimpan nilai bilangan bulat. |
| `String` | Menyimpan data berupa teks. |
| `DateTime` | Menyimpan tanggal dan waktu. |
| `String?` | Menandakan field opsional. |
| `@id` | Menentukan primary key. |
| `@default(autoincrement())` | Menghasilkan nilai ID secara otomatis. |
| `@unique` | Mencegah nilai duplikat pada field tertentu. |
| `@relation` | Mendefinisikan relasi antarmodel. |
| `fields: [anggotaId]` | Menentukan field foreign key pada model Absensi. |
| `references: [id]` | Menentukan field yang dirujuk pada model Anggota. |
| `onDelete: Cascade` | Mengatur agar data terkait ikut terhapus saat data induk dihapus. |
| `@@map("anggota")` | Memetakan model ke nama tabel `anggota`. |
| `@@map("absensi")` | Memetakan model ke nama tabel `absensi`. |

## 2.6 Contoh Data dalam Database

Contoh berikut menunjukkan bagaimana data Anggota dan Absensi saling berhubungan.

**Tabel Anggota**

| id | nim | nama | prodi |
|---|---|---|---|
| 1 | 240160221008 | Della Kartika | Sistem Informasi |
| 2 | 240160221015 | Nadya Zahra Aulia | Sistem Informasi |

**Tabel Absensi**

| id | anggotaId | tanggal | waktuMasuk | status | keterangan |
|---|---|---|---|---|---|
| 1 | 1 | 2026-10-20 | 08:00 | Hadir | Tepat waktu |
| 2 | 1 | 2026-10-21 | 08:10 | Hadir | Terlambat |
| 3 | 2 | 2026-10-20 | 08:05 | Izin | Ada keperluan |

Dari contoh tersebut, anggota dengan ID 1 memiliki dua catatan absensi, sedangkan anggota dengan ID 2 memiliki satu catatan absensi.

Data tersebut merupakan ilustrasi untuk menjelaskan relasi, bukan hasil pengujian database.

---

# 3. RANCANGAN MIGRATION

## 3.1 Pengertian Migration

Migration adalah proses untuk mencatat dan menerapkan perubahan struktur database berdasarkan skema yang telah dibuat. Migration membantu pengembang mengelola perubahan database secara teratur sehingga perubahan struktur tabel dapat ditelusuri.

Pada Sistem Informasi Absensi Organisasi, migration digunakan untuk membuat tabel `anggota` dan `absensi`, menetapkan primary key, membuat aturan unik pada NIM, serta membangun relasi foreign key.

## 3.2 Persiapan Sebelum Migration

Sebelum menjalankan migration, beberapa hal harus disiapkan:

1. Prisma ORM telah terpasang pada proyek.
2. File Prisma Schema telah dibuat.
3. Konfigurasi database telah ditentukan.
4. Database yang digunakan adalah SQLite.
5. Model Anggota dan Absensi telah didefinisikan.
6. Relasi antara kedua model telah ditentukan dengan benar.

Konfigurasi Prisma versi 7 menggunakan file `prisma.config.ts` untuk menentukan lokasi skema, migration, dan URL database.

Contoh konfigurasi environment variable pada file `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3010
```

Contoh konfigurasi `prisma.config.ts`:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

## 3.3 Urutan Migration

Migration direncanakan dengan urutan berikut.

### Tahap 1 — Membuat Model Anggota

Model Anggota dibuat terlebih dahulu karena menjadi entitas utama yang menyimpan identitas anggota organisasi.

Tabel ini memiliki primary key `id` dan field `nim`, `nama`, serta `prodi`.

### Tahap 2 — Membuat Model Absensi

Model Absensi dibuat setelah model Anggota. Tabel ini memiliki field `anggotaId` yang merujuk pada `Anggota.id`.

Relasi ini memastikan bahwa setiap catatan absensi terhubung dengan anggota yang sesuai.

### Tahap 3 — Memvalidasi Prisma Schema

Jalankan perintah:

```bash
npx prisma validate
```

Perintah ini digunakan untuk memeriksa validitas sintaks dan konfigurasi skema Prisma sebelum migration diterapkan.

### Tahap 4 — Menjalankan Migration

Jalankan perintah:

```bash
npx prisma migrate dev --name init_absensi_organisasi
```

Perintah ini membuat migration baru dan menerapkan perubahan skema ke database pengembangan.

Nama migration `init_absensi_organisasi` digunakan sebagai penanda bahwa migration tersebut merupakan pembuatan awal skema Sistem Informasi Absensi Organisasi.

### Tahap 5 — Menghasilkan Prisma Client

Setelah migration selesai, jalankan:

```bash
npx prisma generate
```

Prisma Client menghasilkan API yang digunakan oleh aplikasi untuk mengakses model Anggota dan Absensi.

### Tahap 6 — Memeriksa Hasil Migration

Setelah migration berhasil, periksa database untuk memastikan bahwa tabel `anggota` dan `absensi` telah terbentuk sesuai skema.

Hal yang perlu diperiksa meliputi:
- Tabel Anggota memiliki primary key `id`.
- Field `nim` memiliki aturan unik.
- Tabel Absensi memiliki primary key `id`.
- Field `anggotaId` terhubung dengan `Anggota.id`.
- Field wajib dan opsional telah sesuai dengan rancangan.

## 3.4 Urutan Pembentukan Tabel

Urutan pembentukan tabel yang direncanakan adalah:

1. Tabel `anggota` dibuat sebagai tabel induk.
2. Tabel `absensi` dibuat sebagai tabel yang memiliki foreign key ke tabel Anggota.

Urutan tersebut dipilih karena tabel Absensi membutuhkan tabel Anggota sebagai referensi relasi.

## 3.5 Hasil yang Diharapkan

Setelah migration berhasil, database memiliki dua tabel utama.

**Tabel `anggota`:**
- Menyimpan identitas anggota.
- Memiliki primary key.
- Memiliki NIM yang unik.

**Tabel `absensi`:**
- Menyimpan catatan kehadiran.
- Memiliki primary key.
- Memiliki foreign key `anggotaId`.
- Terhubung dengan tabel Anggota melalui relasi One-to-Many.

Dengan migration, struktur database dapat diterapkan secara konsisten sesuai model yang telah dirancang.

---

# 4. PRESENTASI DAN PENJELASAN TEKNIS

## 4.1 Alasan Pemilihan Domain

Domain Sistem Informasi Absensi Organisasi dipilih karena proses pencatatan kehadiran merupakan kebutuhan yang umum ditemukan dalam organisasi mahasiswa maupun organisasi lainnya.

Sistem ini memiliki kebutuhan data yang jelas dan mudah dimodelkan. Identitas anggota dipisahkan dari catatan absensi agar data tidak perlu ditulis ulang setiap kali anggota mengikuti kegiatan.

## 4.2 Alasan Pemilihan Entitas

Entitas Anggota digunakan untuk menyimpan identitas anggota, sedangkan entitas Absensi digunakan untuk menyimpan catatan kehadiran.

Pemisahan tersebut membuat struktur database lebih terorganisasi dan memudahkan pencarian data. Data anggota dapat dikelola secara terpisah dari catatan kehadiran yang jumlahnya dapat terus bertambah.

## 4.3 Alasan Pemilihan Relasi One-to-Many

Relasi One-to-Many dipilih karena satu anggota dapat mengikuti banyak kegiatan dan memiliki banyak catatan absensi.

Sebagai contoh, seorang anggota yang mengikuti lima kegiatan akan mempunyai satu data anggota dan lima catatan absensi yang terhubung melalui foreign key.

Relasi ini juga membantu menjaga konsistensi data karena setiap catatan absensi merujuk pada anggota yang terdaftar.

## 4.4 Alasan Pemilihan Prisma ORM

Prisma ORM digunakan untuk mempermudah pengelolaan database melalui model dan Prisma Client.

Beberapa manfaatnya adalah:
1. Struktur database didefinisikan dalam Prisma Schema.
2. Relasi antartabel dapat ditentukan secara jelas.
3. Validasi skema membantu menemukan kesalahan konfigurasi.
4. Migration mencatat perubahan struktur database.
5. Prisma Client mempermudah operasi CRUD dari aplikasi.

## 4.5 Alasan Pemilihan SQLite

SQLite dipilih karena ringan, mudah dikonfigurasi, dan menyimpan data dalam sebuah file database. SQLite tidak memerlukan server database terpisah untuk penggunaan pengembangan sederhana.

Dengan karakteristik tersebut, SQLite sesuai untuk latihan integrasi database dan ORM pada REST API.

## 4.6 Pengelolaan Environment Variable

Environment variable digunakan untuk memisahkan konfigurasi aplikasi dari kode program.

Contoh konfigurasi:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3010
```

Penjelasannya:
- `DATABASE_URL` menunjukkan lokasi file database SQLite.
- `PORT` menentukan port yang digunakan server Express.js.
- `dotenv` membantu aplikasi membaca konfigurasi dari file `.env`.
- `.env.example` menyediakan contoh konfigurasi bagi anggota kelompok atau pengembang lain.

Manfaat environment variable antara lain:
1. Konfigurasi dapat diubah tanpa mengedit banyak bagian kode.
2. Konfigurasi pengembangan dan pengujian dapat dibedakan.
3. Pengaturan koneksi database lebih terpusat.
4. Informasi sensitif dapat dijaga agar tidak ikut masuk ke repository.

File `.env` sebaiknya tidak diunggah ke repository apabila mengandung kredensial atau informasi sensitif.

## 4.7 Hubungan Prisma, Migration, Database, dan REST API

Komponen-komponen tersebut memiliki fungsi yang saling berkaitan.

1. **Prisma Schema** mendefinisikan model, field, tipe data, dan relasi.
2. **Migration** menerapkan struktur model ke database.
3. **Database SQLite** menyimpan data anggota dan absensi.
4. **Prisma Client** menjadi penghubung antara aplikasi dan database.
5. **Express.js REST API** menyediakan endpoint untuk membaca dan mengelola data melalui HTTP.

Alur prosesnya dapat digambarkan sebagai berikut:

```text
+----------------------+
|     Prisma Schema    |
+----------------------+
           |
           v
+----------------------+
|       Migration      |
+----------------------+
           |
           v
+----------------------+
|     Database SQLite  |
+----------------------+
           ^
           |
+----------------------+
|     Prisma Client    |
+----------------------+
           ^
           |
+----------------------+
| Express.js REST API  |
+----------------------+
           ^
           |
+----------------------+
| Permintaan HTTP      |
+----------------------+
```

Dengan alur tersebut, REST API dapat menerima permintaan pengguna, memproses operasi melalui Prisma Client, dan mengakses data pada database.

---

# 5. KESIMPULAN

Sistem Informasi Absensi Organisasi dirancang untuk membantu pengelolaan data anggota dan pencatatan kehadiran secara terstruktur. Sistem ini menggunakan dua entitas utama, yaitu Anggota dan Absensi, yang dihubungkan melalui relasi One-to-Many.

Prisma ORM digunakan untuk mendefinisikan struktur model dan relasi database. Migration digunakan untuk menerapkan struktur tersebut ke database SQLite, sedangkan environment variable digunakan untuk mengatur konfigurasi koneksi database dan port server.

Melalui rancangan ini, kelompok memahami tahapan identifikasi entitas, penyusunan Prisma Schema, perencanaan migration, serta pengelolaan konfigurasi aplikasi. Rancangan tersebut dapat dikembangkan lebih lanjut dengan menambahkan fitur pengelolaan kegiatan, autentikasi, laporan kehadiran, dan statistik absensi.
