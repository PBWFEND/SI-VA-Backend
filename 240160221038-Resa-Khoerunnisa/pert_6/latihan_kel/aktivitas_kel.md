# AKTIVITAS KELOMPOK
# PERANCANGAN SKEMA DATABASE PRISMA PADA SISTEM ABSENSI ORGANISASI

## Anggota Kelompok
1. Aldi Restu Fauzi (240160221001)
2. Resa Khoerunnisa (240160221038)
3. Khoirunnisa Shaleha (240160221018)

## 1. Identifikasi Skema

### Domain yang Dipilih: Sistem Absensi Organisasi

Sistem Absensi Organisasi merupakan sistem yang digunakan untuk mengelola data anggota, jabatan, dan kehadiran anggota dalam kegiatan organisasi. Sistem ini dirancang agar pencatatan data absensi dapat dilakukan secara lebih terstruktur dan mudah dikelola.

Berdasarkan domain tersebut, terdapat tiga *entity* utama yang digunakan, yaitu:

1. **Jabatan**

   Entity Jabatan digunakan untuk menyimpan informasi mengenai jabatan yang terdapat dalam organisasi, seperti Ketua, Sekretaris, dan Bendahara.

2. **Anggota**

   Entity Anggota digunakan untuk menyimpan informasi anggota organisasi, seperti nama dan email anggota serta jabatan yang dimilikinya.

3. **Absensi**

   Entity Absensi digunakan untuk menyimpan catatan kehadiran anggota, meliputi tanggal dan status kehadiran seperti Hadir, Izin, dan Sakit.

### Relasi Antar-Entity

Relasi antar-entity dalam Sistem Absensi Organisasi adalah sebagai berikut:

1. Satu jabatan dapat dimiliki oleh banyak anggota, sedangkan satu anggota hanya memiliki satu jabatan.
2. Satu anggota dapat memiliki banyak catatan absensi.
3. Setiap catatan absensi hanya dimiliki oleh satu anggota.

Dengan demikian, terdapat hubungan *One-to-Many* antara Jabatan dengan Anggota dan Anggota dengan Absensi.

## 2. Penyusunan Model Prisma

Prisma Schema digunakan untuk mendefinisikan struktur database, mulai dari nama model, field, tipe data, nilai default, hingga relasi antar-model.

Berikut rancangan model Prisma untuk Sistem Absensi Organisasi:

```prisma
generator client {
  provider = "prisma-client"
  output   = "./generated"
}

datasource db {
  provider = "sqlite"
}

model Jabatan {
  id          Int       @id @default(autoincrement())
  namaJabatan String    @unique
  anggota     Anggota[]
}

model Anggota {
  id        Int       @id @default(autoincrement())
  nama      String
  email     String    @unique
  jabatanId Int
  jabatan   Jabatan   @relation(fields: [jabatanId], references: [id])
  absensi   Absensi[]
}

model Absensi {
  id        Int      @id @default(autoincrement())
  anggotaId Int
  tanggal   DateTime @default(now())
  status    String
  anggota   Anggota  @relation(fields: [anggotaId], references: [id])
}
```

### Penjelasan Field dan Tipe Data

| Nama Field | Tipe Data | Keterangan |
|---|---|---|
| id | Int | Identitas unik setiap data |
| namaJabatan | String | Nama jabatan anggota |
| nama | String | Nama anggota organisasi |
| email | String | Alamat email anggota |
| jabatanId | Int | ID jabatan yang dimiliki anggota |
| anggotaId | Int | ID anggota yang melakukan absensi |
| tanggal | DateTime | Tanggal dan waktu absensi |
| status | String | Status kehadiran anggota |

### Penjelasan Penggunaan Atribut Prisma

1. `@id` digunakan untuk menentukan *primary key* atau identitas utama pada setiap model.
2. `@default(autoincrement())` digunakan agar nilai ID bertambah secara otomatis.
3. `@unique` digunakan untuk memastikan nilai tertentu tidak memiliki data duplikat.
4. `@relation` digunakan untuk menghubungkan satu model dengan model lainnya.
5. `DateTime` digunakan untuk menyimpan informasi tanggal dan waktu absensi.

## 3. Rancangan Migration

Migration merupakan proses pembuatan atau perubahan struktur database berdasarkan model yang telah didefinisikan dalam Prisma Schema.

Urutan migration pada Sistem Absensi Organisasi adalah sebagai berikut:

1. **Membuat Model Prisma**

   Menentukan model Jabatan, Anggota, dan Absensi beserta field dan relasi masing-masing di dalam file `schema.prisma`.

2. **Mengatur Koneksi Database**

   Menentukan alamat database melalui environment variable `DATABASE_URL` yang disimpan dalam file `.env`.

3. **Menjalankan Migration Awal**

   Menjalankan perintah berikut pada terminal:

   ```bash
   npx prisma migrate dev --name init
   ```

   Perintah tersebut digunakan untuk membuat migration awal berdasarkan struktur model yang telah dibuat.

4. **Membuat Tabel Database**

   Prisma akan membuat tabel Jabatan, Anggota, dan Absensi sesuai dengan model serta relasi yang telah ditentukan.

5. **Melakukan Perubahan Struktur Database**

   Apabila terdapat perubahan pada model, migration baru dapat dibuat agar perubahan tersebut diterapkan ke database tanpa harus mengubah struktur secara manual.

## 4. Environment Variable

Environment variable merupakan variabel yang digunakan untuk menyimpan konfigurasi aplikasi di luar kode program. Dalam proyek ini, environment variable digunakan untuk mengatur koneksi database dan port server.

Contoh isi file `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3006
```

### Fungsi Environment Variable

1. `DATABASE_URL` digunakan untuk menentukan lokasi database SQLite yang akan digunakan oleh aplikasi.
2. `PORT` digunakan untuk menentukan port yang dipakai oleh server.
3. Memisahkan konfigurasi dari kode program sehingga pengaturan lebih mudah dikelola.
4. Memudahkan perubahan konfigurasi tanpa harus mengubah kode aplikasi.

Penggunaan environment variable membuat pengelolaan konfigurasi aplikasi menjadi lebih fleksibel. File `.env` juga sebaiknya tidak diunggah ke GitHub apabila berisi informasi rahasia. Sebagai gantinya, proyek dapat menyediakan file `.env.example` sebagai contoh konfigurasi.

## 5. Kesimpulan

Berdasarkan aktivitas kelompok yang telah dilakukan, Sistem Absensi Organisasi memiliki tiga entity utama, yaitu Jabatan, Anggota, dan Absensi. Ketiga entity tersebut memiliki hubungan yang saling berkaitan sehingga data organisasi dan pencatatan kehadiran dapat dikelola secara lebih terstruktur.

Prisma digunakan untuk mendefinisikan model, field, tipe data, dan relasi antar-tabel. Sementara itu, migration digunakan untuk menerapkan struktur model ke dalam database. Environment variable digunakan untuk mengelola konfigurasi koneksi database agar lebih fleksibel dan tidak ditulis secara langsung di dalam kode program.

Dengan rancangan tersebut, database Sistem Absensi Organisasi diharapkan dapat mendukung pengelolaan data anggota dan kehadiran secara lebih terorganisasi.