# Tugas 4 — REST API Sistem Informasi Absensi Organisasi

REST API untuk mengelola data anggota organisasi dan absensi menggunakan Node.js, Express.js, Prisma ORM, dan SQLite.

## Teknologi

- Node.js
- Express.js
- Prisma ORM 7
- SQLite
- Postman untuk pengujian API

## Struktur Data

### 1. Anggota

| Field | Tipe | Keterangan |
|---|---|---|
| `id_anggota` | String | Primary key anggota |
| `nama` | String | Nama anggota |
| `nim` | String | Nomor induk mahasiswa, harus unik |
| `jabatan` | String | Jabatan anggota dalam organisasi |

### 2. Absensi

| Field | Tipe | Keterangan |
|---|---|---|
| `id_absensi` | String | Primary key absensi |
| `id_anggota` | String | ID anggota yang melakukan absensi |
| `kegiatan` | String | Nama kegiatan organisasi |
| `tanggal` | String | Tanggal pelaksanaan kegiatan |
| `status` | String | Status kehadiran: Hadir, Izin, atau Sakit |

Data absensi memiliki relasi dengan data anggota melalui field `id_anggota`.

## Persyaratan

- Node.js
- npm

## Instalasi

1. Masuk ke direktori proyek `tugas-4`.
2. Instal dependensi:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env`, kemudian sesuaikan nilainya jika diperlukan.

4. Buat dan terapkan migrasi database:

   ```bash
   npm run prisma:migrate -- --name init
   ```

5. Generate Prisma Client:

   ```bash
   npm run prisma:generate
   ```

6. Jalankan server dalam mode pengembangan:

   ```bash
   npm run dev
   ```

Server berjalan pada alamat sesuai konfigurasi `PORT` di file `.env`. Contoh URL berikut menggunakan port `3009`.

## Endpoint API

### Anggota

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/anggota` | Mengambil semua anggota beserta data absensinya |
| GET | `/anggota/:id` | Mengambil detail anggota berdasarkan ID |
| POST | `/anggota` | Menambahkan anggota baru |

### Absensi

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/absensi` | Mengambil semua data absensi beserta informasi anggota |
| GET | `/absensi/:id` | Mengambil detail absensi berdasarkan ID |
| POST | `/absensi` | Menambahkan data absensi |
| PATCH | `/absensi/:id` | Memperbarui status absensi |
| DELETE | `/absensi/:id` | Menghapus data absensi |

## Filter Daftar Absensi

Filter dapat digunakan secara terpisah.

```http
GET /absensi?status=Izin
```

Filter kegiatan menggunakan pencarian berdasarkan teks yang terkandung dalam nama kegiatan.

## Contoh Request POST

### 1. Menambahkan Anggota

`POST /anggota`

Header:

```http
Content-Type: application/json
```

Body:

```json
{
  "id_anggota": "AGT001",
  "nama": "Kim Taehyung",
  "nim": "240160221030",
  "jabatan": "Ketua"
}
```

### 2. Menambahkan Absensi

`POST /absensi`

Body:

```json
{
  "id_absensi": "ABS001",
  "id_anggota": "AGT001",
  "kegiatan": "Rapat Program Kerja",
  "tanggal": "2026-10-27",
  "status": "Hadir"
}
```

Pastikan anggota dengan ID `AGT001` sudah terdaftar sebelum menambahkan absensi.

### 3. Memperbarui Status Absensi

`PATCH /absensi/ABS003`

Body:

```json
{
  "status": "Hadir"
}
```

Field `status` hanya menerima nilai `Hadir`, `Izin`, atau `Sakit`.

### 4. Menghapus Absensi

`DELETE /absensi/ABS003`

Request ini tidak memerlukan body. Jika berhasil, API mengembalikan status `204 No Content` tanpa isi respons.

## Validasi dan Status HTTP

- `200 OK`: permintaan berhasil.
- `201 Created`: data berhasil ditambahkan.
- `204 No Content`: data berhasil dihapus.
- `400 Bad Request`: input tidak valid atau anggota yang dirujuk tidak ditemukan.
- `404 Not Found`: data atau endpoint tidak ditemukan.
- `409 Conflict`: ID anggota, NIM, atau ID absensi sudah digunakan.
- `500 Internal Server Error`: terjadi kesalahan pada server.

## Database dan Migrasi

Skema database berada di `prisma/schema.prisma`.

File migrasi tersimpan di direktori `prisma/migrations/`. Database menggunakan SQLite lokal yang dikonfigurasi melalui `DATABASE_URL` di file `.env`.

Prisma Client dibuat melalui perintah `npm run prisma:generate`.

Jangan mengunggah file `.env`, direktori `node_modules`, atau database lokal ke repository.

## Pengujian

API dapat diuji menggunakan Postman. Pastikan server berjalan sebelum mengirim request.

Pengujian mencakup:

- Mengambil daftar dan detail anggota.
- Menambahkan anggota dan menguji validasi input.
- Mengambil daftar dan detail absensi.
- Menambahkan absensi dengan ID anggota yang valid.
- Memfilter absensi berdasarkan status dan kegiatan.
- Memperbarui status absensi.
- Menghapus absensi dan memastikan respons `204 No Content`.
- Menguji data yang tidak ditemukan dan input yang tidak valid.
