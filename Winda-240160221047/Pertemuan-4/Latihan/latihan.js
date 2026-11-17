/**
 * Pertemuan 4 — Latihan routing dan middleware Express.js
 * Nama File: latihan.js
 * Deskripsi: Implementasi routing, route parameter, query parameter, middleware, dan body validation.
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
const port = 3005;

let buku = [
  { id: 1, judul: "Belajar Node.js", penulis: "Winda", tersedia: true },
  { id: 2, judul: "Dasar Express.js", penulis: "Anzar", tersedia: false },
];

// 1. Middleware JSON Parser (agar bisa membaca req.body berformat JSON)
app.use(express.json());

// 2. Middleware Logger (Mencatat waktu, method, dan URL ke console)
app.use((request, response, next) => {
  const waktu = new Date().toISOString();
  console.log(`[${waktu}] ${request.method} ${request.originalUrl}`);
  next();
});

// 3. Endpoint GET /buku (Mendukung query parameter ?tersedia=true/false)
app.get("/buku", (request, response) => {
  const { tersedia } = request.query;
  const data = tersedia === undefined
    ? buku
    : buku.filter((item) => String(item.tersedia) === tersedia);

  return response.json({ success: true, total: data.length, data });
});

// 4. Endpoint GET /buku/:id (Route parameter dengan penanganan 404 jika tidak ada)
app.get("/buku/:id", (request, response) => {
  const item = buku.find(({ id }) => id === Number(request.params.id));

  if (!item) {
    return response.status(404).json({ success: false, message: "Buku tidak ditemukan" });
  }

  return response.json({ success: true, data: item });
});

// 5. Endpoint POST /buku (Validasi field wajib: judul dan penulis)
app.post("/buku", (request, response) => {
  const { judul, penulis, tersedia } = request.body;

  if (!judul || !penulis) {
    return response.status(400).json({
      success: false,
      message: "Field 'judul' dan 'penulis' wajib diisi!",
    });
  }

  const bukuBaru = {
    id: buku.length > 0 ? buku[buku.length - 1].id + 1 : 1,
    judul,
    penulis,
    tersedia: tersedia ?? true,
  };

  buku.push(bukuBaru);

  return response.status(201).json({
    success: true,
    message: "Buku berhasil ditambahkan",
    data: bukuBaru,
  });
});

// 6. Handler 404 untuk endpoint yang tidak tersedia
app.use((request, response) => {
  return response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server latihan berjalan di http://localhost:${port}`);
});