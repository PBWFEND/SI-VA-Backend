# Mini Project — Pertemuan 8 (UTS)

## Sistem Informasi Menu Kedai Kopi — Baloh Kopi Adhikari

Mini project backend berupa REST API untuk mengelola data menu pada usaha **Baloh Kopi Adhikari**. API ini menggunakan Node.js, Express.js 5, Prisma ORM 7, dan SQLite sebagai database.

Struktur project menggunakan pola **service/controller/routes** atau tiga lapisan untuk memisahkan pengelolaan endpoint, proses request, dan operasi database.

### Identitas Mahasiswa

- **Nama:** Resa Khoerunnisa
- **NIM:** 240160221038
- **Program Studi:** Sistem Informasi

## Prasyarat

- Node.js 20+ (`node --version`)
- npm

## Menyiapkan dan Menjalankan

```bash
npm install
```

Buat file `.env` berdasarkan konfigurasi berikut:

```env
DATABASE_URL="file:./prisma/dev.db"
```

Jalankan migrasi database dan generate Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

Jalankan server:

```bash
npm run dev
```

Server berjalan di:

`http://localhost:3008`

## Struktur Lapisan

```text
UTS_240160221038_Resa-kh/
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── generated/
└── src/
    ├── routes/
    │   └── menu.routes.ts
    ├── controller/
    │   └── menu.controller.ts
    └── service/
        └── menu.service.ts
```

Keterangan:
- `app.ts`: Mengatur middleware, route, 404, dan error handler.
- `server.ts`: Menjalankan aplikasi backend.
- `client.ts`: Mengatur koneksi Prisma Client dengan database.
- `prisma/`: Menyimpan skema database dan hasil migrasi.
- `menu.routes.ts`: Mengatur endpoint untuk resource menu.
- `menu.controller.ts`: Mengatur request, validasi input, dan response.
- `menu.service.ts`: Mengatur proses pengolahan data menggunakan Prisma.

**Alur request:**

Client → app.ts → menu.routes.ts → menu.controller.ts → menu.service.ts → Prisma Client → SQLite.

## Endpoint

Semua endpoint menggunakan resource `/menu`.

| Method | Endpoint | Deskripsi | Status Sukses |
|---|---|---|---|
| GET | `/menu` | Menampilkan seluruh menu | 200 |
| GET | `/menu/:id` | Menampilkan detail menu | 200 |
| POST | `/menu` | Menambahkan menu | 201 |
| PATCH | `/menu/:id` | Mengubah data menu | 200 |
| DELETE | `/menu/:id` | Menghapus menu | 204 |
| GET | `/health` | Memeriksa status server | 200 |

## Contoh Penggunaan API

Pengujian API dilakukan menggunakan aplikasi Postman.

### 1. Health Check

- Method: GET
- URL: `http://localhost:3008/health`

### 2. Menampilkan Seluruh Menu

- Method: GET
- URL: `http://localhost:3008/menu`

### 3. Menambahkan Menu

- Method: POST
- URL: `http://localhost:3008/menu`
- Body: raw → JSON

```json
{
  "nama": "Kopi Susu Gula Aren",
  "kategori": "Kopi",
  "harga": 18000,
  "stok": 20,
  "tersedia": true
}
```

### 4. Menampilkan Detail Menu

- Method: GET
- URL: `http://localhost:3008/menu/1`

### 5. Mengubah Data Menu

- Method: PATCH
- URL: `http://localhost:3008/menu/1`
- Body: raw → JSON

```json
{
  "harga": 20000,
  "stok": 15
}
```

### 6. Menghapus Menu

- Method: DELETE
- URL: `http://localhost:3008/menu/1`

### 7. Menguji Validasi Data (400 Bad Request)

Pengujian dilakukan dengan mengirimkan data menu yang tidak valid.

- Method: POST
- URL: `http://localhost:3008/menu`
- Body: raw → JSON

```json
{
  "nama": "Kopi Uji",
  "kategori": "Kopi",
  "harga": -5000,
  "stok": 10,
  "tersedia": true
}
```

Hasil yang diharapkan: Status `400 Bad Request` karena harga tidak boleh bernilai negatif.

### 8. Menguji Data Tidak Ditemukan (404 Not Found)

Pengujian dilakukan dengan mencari data menu menggunakan ID yang tidak tersedia.

- Method: GET
- URL: `http://localhost:3008/menu/999`

Hasil yang diharapkan: Status `404 Not Found` karena data menu dengan ID tersebut tidak ditemukan.

## Validasi dan Kode Status HTTP

API menerapkan validasi pada endpoint POST dan PATCH untuk memastikan data yang dikirim sesuai ketentuan.

Ketentuan validasi:
- Nama menu harus berupa teks dan tidak boleh kosong.
- Kategori harus berupa teks dan tidak boleh kosong.
- Harga harus berupa angka bulat lebih dari 0.
- Stok harus berupa angka bulat minimal 0.
- Status ketersediaan harus berupa boolean.

Kode status HTTP yang digunakan:

| Status | Keterangan |
|---|---|
| 200 | Request berhasil |
| 201 | Data berhasil ditambahkan |
| 204 | Data berhasil dihapus |
| 400 | Data tidak valid |
| 404 | Data tidak ditemukan |
| 500 | Terjadi kesalahan pada server |

## Skema Database

Database menggunakan SQLite yang terintegrasi dengan Prisma ORM.

Model `Menu` memiliki atribut:
- `id`: ID menu sebagai primary key.
- `nama`: Nama menu.
- `kategori`: Kategori menu.
- `harga`: Harga menu.
- `stok`: Jumlah stok menu.
- `tersedia`: Status ketersediaan menu.

Skema database terdapat pada file `prisma/schema.prisma`, sedangkan hasil migrasi tersimpan pada folder `prisma/migrations/`.

## Pengembangan Lanjutan

Proyek ini dapat dikembangkan dengan menambahkan beberapa fitur, seperti:

- Authentication untuk login dan pengelolaan hak akses.
- JWT untuk melindungi endpoint API.
- Pengelolaan stok bahan baku.
- Pencatatan transaksi penjualan.
- Laporan penjualan dan keuangan.
- Dokumentasi API menggunakan Swagger.

## Kesimpulan

Mini project ini menghasilkan REST API untuk pengelolaan data menu Baloh Kopi Adhikari. Sistem telah menerapkan operasi CRUD, validasi input, pemisahan struktur tiga lapisan, serta penyimpanan data menggunakan SQLite melalui Prisma ORM.