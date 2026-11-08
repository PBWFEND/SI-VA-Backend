# Sistem Informasi Perpustakaan

## 1. Deskripsi Proyek

Sistem Informasi Perpustakaan merupakan aplikasi REST API yang digunakan untuk mengelola data perpustakaan. Aplikasi ini dikembangkan menggunakan Node.js, Express.js, Prisma ORM, dan database SQLite.

Proyek ini dibuat untuk menerapkan konsep pengembangan REST API dengan pengelolaan data buku dan pengguna.

## 2. Teknologi yang Digunakan

- Node.js
- Express.js
- Prisma ORM
- SQLite
- JavaScript / TypeScript

## 3. Fitur

- Pengelolaan data buku.
- Pengelolaan data pengguna.
- Menampilkan data melalui REST API.
- Menambahkan data.
- Memperbarui data.
- Menghapus data.
- Menggunakan Prisma ORM untuk mengakses database.

## 4. Struktur Proyek

```text
perpustakaan/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controller/
│   ├── routes/
│   └── service/
├── app.ts
├── client.ts
├── server.ts
├── package.json
├── .env.example
└── README.md
```

## 5. Instalasi dan Menjalankan Proyek

1. Clone atau buka folder proyek.
2. Instal dependencies:

```bash
npm install
```

3. Buat file `.env` berdasarkan `.env.example`.
4. Jalankan migrasi database sesuai konfigurasi Prisma:

```bash
npx prisma migrate dev
```

5. Jalankan aplikasi:

```bash
npm run start
```

## 6. Database

Database menggunakan SQLite dengan Prisma ORM sebagai penghubung antara aplikasi dan database.

Data utama yang dikelola dalam proyek ini meliputi data buku dan pengguna.

## 7. Tujuan

Proyek ini bertujuan untuk memahami penerapan REST API, penggunaan Prisma ORM, pengelolaan database, serta pemisahan kode menggunakan struktur routes, controller, dan service.