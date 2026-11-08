# Tugas 4 — REST API Absensi Organisasi dengan Prisma

## Identitas
- **Nama:** Resa Khoerunnisa
- **NIM:** 240160221038
- **Mata Kuliah:** Praktikum Back End

## Deskripsi Proyek
Proyek ini merupakan REST API untuk mengelola data absensi anggota organisasi. API dibuat menggunakan Node.js, Express.js, Prisma ORM, dan database SQLite.

Data absensi yang dikelola meliputi nama, jabatan, tanggal, dan status kehadiran.

## Teknologi yang Digunakan
- Node.js
- Express.js
- Prisma ORM
- SQLite
- Postman

## Struktur Folder
```text
tugas-4/
├── prisma/
│   ├── generated/
│   ├── migrations/
│   └── schema.prisma
├── .env
├── .env.example
├── app.js
├── client.js
├── server.js
├── prisma.config.ts
├── package.json
├── package-lock.json
└── README.md
```

## Instalasi dan Konfigurasi

### 1. Install Dependencies
Jalankan perintah berikut pada terminal:

```bash
npm install
```

### 2. Konfigurasi Environment
Buat file `.env` pada folder utama dengan isi:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3006
```

File `.env.example` disediakan sebagai contoh konfigurasi environment.

### 3. Menjalankan Migration
Jalankan perintah:

```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client
Jalankan perintah:

```bash
npx prisma generate
```

### 5. Menjalankan Server
Jalankan perintah:

```bash
node --experimental-strip-types server.js
```

Server berjalan pada alamat:

`http://localhost:3006`

## Daftar Endpoint API

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Menampilkan informasi API |
| GET | `/health` | Memeriksa kondisi API |
| GET | `/absensi` | Menampilkan seluruh data absensi |
| GET | `/absensi/:id` | Menampilkan detail absensi |
| POST | `/absensi` | Menambahkan data absensi |
| PUT | `/absensi/:id` | Mengubah seluruh data absensi |
| PATCH | `/absensi/:id` | Mengubah sebagian data absensi |
| DELETE | `/absensi/:id` | Menghapus data absensi |

## Contoh Request

### 1. Menambahkan Data Absensi
Method: `POST`

URL:
`http://localhost:3006/absensi`

Body JSON:

```json
{
  "nama": "Andi",
  "jabatan": "Ketua",
  "tanggal": "2026-09-28",
  "status": "Hadir"
}
```

### 2. Menampilkan Seluruh Data
Method: `GET`

URL:
`http://localhost:3006/absensi`

### 3. Mengubah Status Absensi
Method: `PATCH`

URL:
`http://localhost:3006/absensi/1`

Body JSON:

```json
{
  "status": "Izin"
}
```

### 4. Menghapus Data Absensi
Method: `DELETE`

URL:
`http://localhost:3006/absensi/1`

## Validasi Data
API memiliki validasi input untuk memastikan:
- Nama tidak boleh kosong.
- Jabatan tidak boleh kosong.
- Tanggal harus menggunakan format tanggal yang valid.
- Status kehadiran hanya menerima `Hadir`, `Izin`, atau `Sakit`.

## Pengujian
Pengujian API dilakukan menggunakan Postman dengan mencoba endpoint GET, POST, PUT, PATCH, dan DELETE.

## Kesimpulan
REST API Absensi Organisasi telah dikembangkan dengan menggunakan Express.js dan Prisma ORM serta database SQLite. API menyediakan fitur untuk menambahkan, menampilkan, mengubah, dan menghapus data absensi yang tersimpan di database.