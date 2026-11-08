
/**
 * Pertemuan 4 — Latihan Individu Express.js
 * Fitur: middleware logger, route parameter, query parameter,
 * tambah buku, dan handler 404.
 * Jalankan: npm start
 */

import express from "express";

const app = express();
app.disable("x-powered-by");

const port = 3005;

// Data awal buku
const buku = [
  { id: 1, judul: "Belajar Node.js", penulis: "Resa", tersedia: true },
  { id: 2, judul: "Dasar Express.js", penulis: "Mila", tersedia: false },
];

let nextId = 3;

// Middleware untuk membaca request JSON
app.use(express.json());

// Middleware logger
app.use((request, response, next) => {
  const waktu = new Date().toLocaleString("id-ID");

  console.log(
    `[${waktu}] ${request.method} ${request.originalUrl}`
  );

  next();
});

// 1. Menampilkan daftar buku dan memfilter ketersediaan
app.get("/buku", (request, response) => {
  const { tersedia } = request.query;

  if (
    tersedia !== undefined &&
    tersedia !== "true" &&
    tersedia !== "false"
  ) {
    return response.status(400).json({
      success: false,
      message: "Query tersedia harus bernilai true atau false",
    });
  }

  const data =
    tersedia === undefined
      ? buku
      : buku.filter(
          (item) => String(item.tersedia) === tersedia
        );

  return response.status(200).json({
    success: true,
    total: data.length,
    data,
  });
});

// 2. Menampilkan detail buku berdasarkan ID
app.get("/buku/:id", (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return response.status(400).json({
      success: false,
      message: "ID buku harus berupa angka positif",
    });
  }

  const item = buku.find(({ id: idBuku }) => idBuku === id);

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  return response.status(200).json({
    success: true,
    data: item,
  });
});

// 3. Menambahkan buku baru
app.post("/buku", (request, response) => {
  const { judul, penulis } = request.body ?? {};

  if (
    typeof judul !== "string" ||
    judul.trim() === "" ||
    typeof penulis !== "string" ||
    penulis.trim() === ""
  ) {
    return response.status(400).json({
      success: false,
      message: "Judul dan penulis wajib diisi",
    });
  }

  const bukuBaru = {
    id: nextId++,
    judul: judul.trim(),
    penulis: penulis.trim(),
    tersedia: true,
  };

  buku.push(bukuBaru);

  return response.status(201).json({
    success: true,
    message: "Buku berhasil ditambahkan",
    data: bukuBaru,
  });
});

// 4. Handler untuk endpoint yang tidak ditemukan
app.use((request, response) => {
  return response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Latihan berjalan di http://localhost:${port}`);
});
