/**
 * Pertemuan 4 — Latihan routing dan middleware Express.js
 * Tujuan: menerapkan route parameter, query parameter, dan middleware.
 * Jalankan: node latihan.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
const port = 3005;
const buku = [
  { id: 1, judul: "Belajar Node.js", penulis: "Rissa", tersedia: true },
  { id: 2, judul: "Dasar Express.js", penulis: "Dita", tersedia: false },
];

app.use(express.json());

// 1. Middleware Logger (Mencatat waktu, method, dan URL)
app.use((request, response, next) => {
  const waktu = new Date().toISOString();
  console.log(`[${waktu}] ${request.method} ${request.url}`);
  next();
});

// 3. GET /buku dengan Filter Query Parameter (?tersedia=true / false)
app.get("/buku", (request, response) => {
  const { tersedia } = request.query;
  const data = tersedia === undefined
    ? buku
    : buku.filter((item) => String(item.tersedia) === tersedia);

  response.json({ success: true, total: data.length, data });
});

// 2. GET /buku/:id dengan Response 404
app.get("/buku/:id", (request, response) => {
  const item = buku.find(({ id }) => id === Number(request.params.id));

  if (!item) {
    return response.status(404).json({ success: false, message: "Buku tidak ditemukan" });
  }

  return response.json({ success: true, data: item });
});

// 4. POST /buku dengan Field Wajib 'judul' dan 'penulis'
app.post("/buku", (request, response) => {
  const { judul, penulis, tersedia } = request.body;

  if (!judul || !penulis) {
    return response.status(400).json({
      success: false,
      message: "Field 'judul' dan 'penulis' wajib diisi",
    });
  }

  const bukuBaru = {
    id: buku.length + 1,
    judul,
    penulis,
    tersedia: tersedia !== undefined ? Boolean(tersedia) : true,
  };

  buku.push(bukuBaru);

  return response.status(201).json({
    success: true,
    message: "Buku berhasil ditambahkan",
    data: bukuBaru,
  });
});

// 5. Handler 404 untuk Endpoint yang Tidak Tersedia
app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

app.listen(port, () => {
  console.log(`Latihan berjalan di http://localhost:${port}`);
});