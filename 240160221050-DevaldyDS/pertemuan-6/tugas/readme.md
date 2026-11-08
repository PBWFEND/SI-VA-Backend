# Tugas 4 — Integrasi Database dan ORM untuk REST API

## Deskripsi

Tugas ini merupakan pengembangan REST API dengan mengintegrasikan database menggunakan Prisma ORM. API dibangun menggunakan Node.js, TypeScript, dan Express.js untuk mengelola data mahasiswa secara terstruktur melalui operasi CRUD.

## Teknologi yang Digunakan

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- SQLite

## Struktur Folder

```text
tugas/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── dev.db
├── .env
├── .env.example
├── .gitignore
├── app.ts
├── client.ts
├── server.ts
├── prisma.config.ts
├── package.json
├── package-lock.json
└── readme.md
```

## Fitur dan HTTP Method

### 1. GET — Mengambil Data

Method GET digunakan untuk mengambil atau menampilkan data mahasiswa dari database tanpa mengubah data yang tersimpan.

Contoh endpoint:

```http
GET /mahasiswa
GET /mahasiswa/:id
```

### 2. POST — Menambahkan Data

Method POST digunakan untuk menambahkan data mahasiswa baru ke database. Data dikirim melalui request body dalam format JSON.

Contoh endpoint:

```http
POST /mahasiswa
```

Contoh request body:

```json
{
  "nim": "240160221050",
  "nama": "Devaldy",
  "prodi": "Sistem Informasi",
  "angkatan": 2024
}
```

### 3. PUT — Memperbarui Data

Method PUT digunakan untuk memperbarui data mahasiswa yang sudah tersimpan berdasarkan ID tertentu.

Contoh endpoint:

```http
PUT /mahasiswa/:id
```

### 4. DELETE — Menghapus Data

Method DELETE digunakan untuk menghapus data mahasiswa dari database berdasarkan ID tertentu.

Contoh endpoint:

```http
DELETE /mahasiswa/:id
```

## Integrasi Prisma ORM

Prisma ORM digunakan sebagai penghubung antara aplikasi dengan database SQLite. Model data mahasiswa didefinisikan melalui `schema.prisma`, kemudian Prisma Client digunakan untuk menjalankan operasi database tanpa harus menulis query SQL secara manual.

## Instalasi dan Menjalankan Project

### 1. Instal dependensi

```bash
npm install
```

### 2. Konfigurasi environment

Buat file `.env` berdasarkan `.env.example` dan sesuaikan konfigurasi database.

### 3. Migrasi database

```bash
npx prisma migrate dev --name init
```

### 4. Validasi schema

```bash
npx prisma validate
```

### 5. Jalankan server

```bash
npm run dev
```

## Pengujian API

Pengujian endpoint dilakukan menggunakan Postman atau Thunder Client untuk memastikan setiap HTTP method berjalan sesuai fungsinya, mulai dari mengambil, menambahkan, memperbarui, hingga menghapus data mahasiswa.

## Tujuan

Melalui tugas ini, mahasiswa diharapkan mampu memahami integrasi database menggunakan Prisma ORM, penggunaan HTTP method dalam REST API, serta penerapan operasi CRUD pada aplikasi berbasis Node.js dan TypeScript.
