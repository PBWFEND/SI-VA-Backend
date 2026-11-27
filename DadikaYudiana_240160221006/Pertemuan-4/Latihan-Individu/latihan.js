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
  { id: 1, judul: "Belajar Node.js", tersedia: true },
  { id: 2, judul: "Dasar Express.js", tersedia: false },
];

app.use(express.json());
app.use((request, response, next) => {
  const waktu = new Date().toLocaleString("id-ID");

  console.log(
    `[${waktu}] ${request.method} ${request.originalUrl}`
  );

  next();
});

app.get("/buku", (request, response) => {
  const { tersedia } = request.query;
  const data = tersedia === undefined
    ? buku
    : buku.filter((item) => String(item.tersedia) === tersedia);

  response.json({ success: true, total: data.length, data });
});

app.get("/buku/:id", (request, response) => {
  const item = buku.find(({ id }) => id === Number(request.params.id));

  if (!item) {
    return response.status(404).json({ success: false, message: "Buku tidak ditemukan" });
  }

  return response.json({ success: true, data: item });
});


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
      message: "Field judul dan penulis wajib diisi",
    });
  }

  const idBaru = Math.max(...buku.map((item) => item.id), 0) + 1;

  const bukuBaru = {
    id: idBaru,
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


app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

app.listen(port, () => {
  console.log(`Latihan berjalan di http://localhost:${port}`);
  console.log("Uji: curl http://localhost:3005/buku?tersedia=true");
});