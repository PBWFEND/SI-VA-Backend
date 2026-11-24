# Mini Project UTS — Sistem Informasi Perpustakaan
**Nama:** Faatin Ashri Widiatin

**NPM:** 240160221011

## 1. Deskripsi Proyek

Mini project ini merupakan implementasi RESTful API untuk Sistem Informasi Perpustakaan dengan resource utama **Buku**. API dibuat menggunakan Node.js, Express 5, TypeScript, Prisma ORM 7, dan SQLite.

API menyediakan fitur untuk melihat daftar buku, melihat detail buku, menambahkan buku, memperbarui data buku, dan menghapus buku.

Selain operasi CRUD, API juga menyediakan fitur filter berdasarkan penulis dan stok minimal serta validasi input untuk menjaga konsistensi data.

## 2. Teknologi yang Digunakan

- Node.js
- Express 5
- TypeScript
- Prisma ORM 7
- SQLite
- better-sqlite3

## 3. Struktur Folder

```
Pertemuan8/
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── generated/
│   └── dev.db
├── src/
│   ├── routes/
│   │   └── buku.routes.ts
│   ├── controller/
│   │   └── buku.controller.ts
│   └── service/
│       └── buku.service.ts
├── hasilpengujian/
│   ├── 01-get-all.png
│   ├── 02-filter-penulis.png
│   ├── 03-filter-minstok.png
│   ├── 04-filter-gabungan.png
│   ├── 05-get-detail.png
│   ├── 06-post-berhasil.png
│   ├── 07-post-judul-kosong.png
│   ├── 08-post-tahun-invalid.png
│   ├── 09-post-stok-negatif.png
│   ├── 10-patch-berhasil.png
│   ├── 11-patch-data-invalid.png
│   ├── 12-patch-not-found.png
│   ├── 13-delete-berhasil.png
│   └── 14-delete-not-found.png
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## 4. Instalasi dan Menjalankan Proyek

1. Pastikan Node.js sudah terpasang.
2. Buka terminal pada folder proyek.
3. Instal seluruh dependency:

```
npm install
```

4. Salin file konfigurasi contoh menjadi `.env`:

```
cp .env.example .env
```

5. Pastikan konfigurasi pada file `.env` seperti berikut:

```
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

6. Jalankan migrasi database:

```
npx prisma migrate dev
```

7. Generate Prisma Client:

```
npx prisma generate
```

8. Jalankan server dalam mode development:

```
npm run dev
```

Server berjalan pada alamat:

```
http://localhost:3008
```

## 5. Arsitektur Aplikasi

Aplikasi menggunakan pola pemisahan tiga layer:

- **Routes:** Mengatur endpoint dan menghubungkan request ke controller.
- **Controller:** Menangani request dan response, validasi input, serta status HTTP.
- **Service:** Menangani proses pengolahan data dan komunikasi dengan database menggunakan Prisma ORM.

Pemisahan ini bertujuan agar kode lebih terstruktur dan setiap bagian memiliki tanggung jawab masing-masing.

## 6. Endpoint API

Base URL:

```
http://localhost:3008/api/buku
```

| Method | Endpoint        | Fungsi                               |
| ------ | --------------- | ------------------------------------ |
| GET    | `/api/buku`     | Mengambil seluruh data buku          |
| GET    | `/api/buku/:id` | Mengambil detail buku berdasarkan ID |
| POST   | `/api/buku`     | Menambahkan data buku                |
| PATCH  | `/api/buku/:id` | Memperbarui data buku                |
| DELETE | `/api/buku/:id` | Menghapus data buku                  |

API juga menyediakan filter daftar buku berdasarkan penulis dan stok minimal melalui query parameter:

- `penulis` untuk memfilter berdasarkan nama penulis.
- `minStok` untuk memfilter berdasarkan stok minimum.

Contoh penggunaan:

```
/api/buku?penulis=Pramoedya%20Ananta%20Toer
/api/buku?minStok=5
```

## 7. Pengujian API

Pengujian dilakukan menggunakan **cURL melalui terminal** dengan server berjalan pada port 3008.

Pengujian mencakup operasi CRUD, filter data, validasi input, serta penanganan data yang tidak ditemukan.

Seluruh 14 skenario pengujian telah dijalankan ulang. Bukti hasil pengujian berupa screenshot respons terminal disimpan pada folder `hasilpengujian`.

### 7.1 GET — Mengambil Seluruh Data Buku

**Perintah:**

```
curl -i http://localhost:3008/api/buku
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK`. API menampilkan satu data buku, yaitu Bumi Manusia karya Pramoedya Ananta Toer.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 1](hasilpengujian/01-get-all.png)

### 7.2 GET — Filter Berdasarkan Penulis

**Perintah:**

```
curl -i "http://localhost:3008/api/buku?penulis=Pramoedya%20Ananta%20Toer"
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK` dan menampilkan buku Bumi Manusia karya Pramoedya Ananta Toer.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 2](hasilpengujian/02-filter-penulis.png)

### 7.3 GET — Filter Berdasarkan Stok Minimal

**Perintah:**

```
curl -i "http://localhost:3008/api/buku?minStok=5"
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK` dan menampilkan buku yang memenuhi filter stok minimal 5.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 3](hasilpengujian/03-filter-minstok.png)

### 7.4 GET — Menggunakan Dua Filter Sekaligus

**Perintah:**

```
curl -i "http://localhost:3008/api/buku?penulis=Pramoedya%20Ananta%20Toer&minStok=5"
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK` dan menampilkan data buku yang sesuai dengan kedua filter, yaitu penulis Pramoedya Ananta Toer dan stok minimal 5.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 4](hasilpengujian/04-filter-gabungan.png)

### 7.5 GET — Mengambil Detail Buku

**Perintah:**

```
curl -i http://localhost:3008/api/buku/2
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK` dan menampilkan detail buku Bumi Manusia dengan ID `2`.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 5](hasilpengujian/05-get-detail.png)

### 7.6 POST — Menambahkan Data Buku

**Perintah:**

```
curl -i -X POST http://localhost:3008/api/buku \
-H "Content-Type: application/json" \
-d '{"judul":"Laskar Pelangi","penulis":"Andrea Hirata","tahun":2005,"stok":10}'
```

**Hasil pengujian:**

Request berhasil mendapatkan status `201 Created`. Data buku Laskar Pelangi berhasil ditambahkan ke database dengan ID `3`, tahun terbit 2005, dan stok 10.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 6](hasilpengujian/06-post-berhasil.png)

### 7.7 POST — Judul Tidak Diisi

**Perintah:**

```
curl -i -X POST http://localhost:3008/api/buku \
-H "Content-Type: application/json" \
-d '{"judul":"","penulis":"Andrea Hirata","tahun":2005,"stok":10}'
```

**Hasil pengujian:**

Request ditolak dengan status `400 Bad Request` karena judul kosong. API memberikan pesan bahwa field judul wajib diisi.

Validasi berhasil mencegah data yang tidak lengkap masuk ke database.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 7](hasilpengujian/07-post-judul-kosong.png)

### 7.8 POST — Tahun Terbit Tidak Valid

**Perintah:**

```
curl -i -X POST http://localhost:3008/api/buku \
-H "Content-Type: application/json" \
-d '{"judul":"Buku Uji","penulis":"Penulis Uji","tahun":2500,"stok":10}'
```

**Hasil pengujian:**

Request ditolak dengan status `400 Bad Request` karena tahun terbit berada di luar rentang 1000–2100.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 8](hasilpengujian/08-post-tahun-invalid.png)

### 7.9 POST — Stok Bernilai Negatif

**Perintah:**

```
curl -i -X POST http://localhost:3008/api/buku \
-H "Content-Type: application/json" \
-d '{"judul":"Buku Uji","penulis":"Penulis Uji","tahun":2005,"stok":-5}'
```

**Hasil pengujian:**

Request ditolak dengan status `400 Bad Request` karena stok tidak boleh bernilai negatif. API memberikan pesan bahwa stok harus berupa bilangan bulat minimal 0.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 9](hasilpengujian/09-post-stok-negatif.png)

### 7.10 PATCH — Memperbarui Data Buku

**Perintah:**

```
curl -i -X PATCH http://localhost:3008/api/buku/2 \
-H "Content-Type: application/json" \
-d '{"stok":12}'
```

**Hasil pengujian:**

Request berhasil mendapatkan status `200 OK`. Stok buku dengan ID `2` berhasil diperbarui dari 10 menjadi 12.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 10](hasilpengujian/10-patch-berhasil.png)

### 7.11 PATCH — Input Tidak Valid

**Perintah:**

```
curl -i -X PATCH http://localhost:3008/api/buku/2 \
-H "Content-Type: application/json" \
-d '{"tahun":2500,"stok":-5}'
```

**Hasil pengujian:**

Request ditolak dengan status `400 Bad Request`. API memberikan detail kesalahan bahwa tahun berada di luar rentang 1000–2100 dan stok harus berupa bilangan bulat minimal 0.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 11](hasilpengujian/11-patch-data-invalid.png)

### 7.12 PATCH — ID Buku Tidak Ditemukan

**Perintah:**

```
curl -i -X PATCH http://localhost:3008/api/buku/999 \
-H "Content-Type: application/json" \
-d '{"stok":5}'
```

**Hasil pengujian:**

Request mendapatkan status `404 Not Found` dengan response:

```
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 12](hasilpengujian/12-patch-not-found.png)

### 7.13 DELETE — Menghapus Data Buku

**Perintah:**

```
curl -i -X DELETE http://localhost:3008/api/buku/2
```

**Hasil pengujian:**

Request berhasil mendapatkan status `204 No Content`. Data buku dengan ID `2` berhasil dihapus dan tidak ada body response.

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 13](hasilpengujian/13-delete-berhasil.png)

### 7.14 DELETE — ID Buku Tidak Ditemukan

**Perintah:**

```
curl -i -X DELETE http://localhost:3008/api/buku/999
```

**Hasil pengujian:**

Request mendapatkan status `404 Not Found` dengan response:

```
{
  "success": false,
  "message": "Buku tidak ditemukan"
}
```

**Bukti pengujian:**

[📷 Lihat Screenshot Tes 14](hasilpengujian/14-delete-not-found.png)

## 8. Ringkasan Hasil Pengujian

Berdasarkan pengujian yang telah dilakukan, seluruh 14 skenario berhasil mendapatkan status HTTP sesuai dengan hasil yang diharapkan.

| No. | Skenario Pengujian        | Status HTTP | Hasil                   |
| --- | ------------------------- | ----------- | ----------------------- |
| 1   | GET seluruh buku          | 200         | Berhasil                |
| 2   | GET filter penulis        | 200         | Berhasil                |
| 3   | GET filter stok minimal   | 200         | Berhasil                |
| 4   | GET kombinasi filter      | 200         | Berhasil                |
| 5   | GET detail buku           | 200         | Berhasil                |
| 6   | POST tambah buku          | 201         | Berhasil                |
| 7   | POST judul kosong         | 400         | Ditolak sesuai validasi |
| 8   | POST tahun tidak valid    | 400         | Ditolak sesuai validasi |
| 9   | POST stok negatif         | 400         | Ditolak sesuai validasi |
| 10  | PATCH ubah stok           | 200         | Berhasil                |
| 11  | PATCH input tidak valid   | 400         | Ditolak sesuai validasi |
| 12  | PATCH ID tidak ditemukan  | 404         | Ditangani dengan benar  |
| 13  | DELETE buku               | 204         | Berhasil                |
| 14  | DELETE ID tidak ditemukan | 404         | Ditangani dengan benar  |

**Total pengujian: 14 skenario berhasil dari 14 skenario.**

Seluruh screenshot hasil pengujian dapat dilihat pada folder `hasilpengujian`.

## 9. Database

Database menggunakan SQLite dengan Prisma ORM 7. Model utama yang digunakan adalah `Buku`, dengan atribut:

| Atribut | Tipe Data | Keterangan                              |
| ------- | --------- | --------------------------------------- |
| id      | Int       | ID buku dengan nilai bertambah otomatis |
| judul   | String    | Judul buku                              |
| penulis | String    | Nama penulis buku                       |
| tahun   | Int       | Tahun terbit buku                       |
| stok    | Int       | Jumlah stok buku, default 0             |

Data disimpan dalam database SQLite sehingga pengelolaan data dilakukan melalui Prisma ORM.

## 10. Kesimpulan

Berdasarkan pengujian menggunakan cURL, endpoint GET, POST, PATCH, dan DELETE telah berjalan sesuai fungsinya. Fitur filter berdasarkan penulis dan stok minimal juga berhasil digunakan.

Validasi input berhasil menolak data yang tidak sesuai ketentuan. Penanganan data yang tidak ditemukan menghasilkan status `404 Not Found`, sedangkan penghapusan data yang berhasil menghasilkan status `204 No Content`.

Seluruh 14 skenario pengujian berhasil dijalankan dan bukti pengujian telah disimpan dalam folder `hasilpengujian`.

