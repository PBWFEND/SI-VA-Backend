
import express from "express";

const app = express();

// Middleware untuk membaca request JSON
app.use(express.json());

// Data buku sementara
const buku = [
  {
    id: 1,
    judul: "Belajar Node.js",
    penulis: "Fauzan Zainul Arifin",
    tersedia: true,
  },
  {
    id: 2,
    judul: "Dasar Express.js",
    penulis: "Devaldy Zikri",
    tersedia: false,
  },
];

// Middleware logger
app.use((request, response, next) => {
  const waktu = new Date().toLocaleString("id-ID");

  console.log(
    `[${waktu}] ${request.method} ${request.originalUrl}`
  );

  next();
});

// GET: menampilkan semua buku
app.get("/buku", (request, response) => {
  const { tersedia } = request.query;

  const data =
    tersedia === undefined
      ? buku
      : buku.filter(
          (item) => String(item.tersedia) === tersedia
        );

  response.status(200).json({
    success: true,
    total: data.length,
    data,
  });
});

// GET: menampilkan detail buku berdasarkan ID
app.get("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const item = buku.find((buku) => buku.id === id);

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

// POST: menambahkan buku baru
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

  const idBaru =
    Math.max(...buku.map((item) => item.id), 0) + 1;

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

// PUT: memperbarui data buku
app.put("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const item = buku.find((buku) => buku.id === id);

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  const { judul, penulis, tersedia } = request.body ?? {};

  if (
    (judul !== undefined &&
      (typeof judul !== "string" || judul.trim() === "")) ||
    (penulis !== undefined &&
      (typeof penulis !== "string" || penulis.trim() === "")) ||
    (tersedia !== undefined && typeof tersedia !== "boolean")
  ) {
    return response.status(400).json({
      success: false,
      message: "Data buku tidak valid",
    });
  }

  if (judul !== undefined) item.judul = judul.trim();
  if (penulis !== undefined) item.penulis = penulis.trim();
  if (tersedia !== undefined) item.tersedia = tersedia;

  return response.status(200).json({
    success: true,
    message: "Buku berhasil diperbarui",
    data: item,
  });
});

// DELETE: menghapus buku
app.delete("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const index = buku.findIndex((buku) => buku.id === id);

  if (index === -1) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  const bukuDihapus = buku.splice(index, 1)[0];

  return response.status(200).json({
    success: true,
    message: "Buku berhasil dihapus",
    data: bukuDihapus,
  });
});

// Handler untuk endpoint yang tidak tersedia
app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error middleware
app.use((error, request, response, next) => {
  console.error(error.stack);

  response.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export default app;