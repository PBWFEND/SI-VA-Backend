
/**
 * Tugas 3 — RESTful API dengan Express.js
 * Nama : Winda Nurhidayah
 * NIM  : 240160221047
 * Resource: Buku
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

// Middleware Logger
app.use((request, response, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.url}`);
  next();
});

let buku = [
  {
    id: 1,
    judul: "Pemrograman Web",
    penulis: "Winda Nurhidayah",
    tahun: 2024,
    stok: 5,
  },
  {
    id: 2,
    judul: "Basis Data Lanjutan",
    penulis: "Djanuar",
    tahun: 2023,
    stok: 3,
  },
];

const responseData = (response, statusCode, message, data) =>
  response.status(statusCode).json({
    success: true,
    message,
    data,
  });

// GET: Mengambil semua buku dan filter
app.get("/buku", (request, response) => {
  const { penulis, minStok } = request.query;

  const data = buku.filter((item) => {
    const cocokPenulis =
      penulis === undefined ||
      item.penulis.toLowerCase() === String(penulis).toLowerCase();

    const cocokStok =
      minStok === undefined || item.stok >= Number(minStok);

    return cocokPenulis && cocokStok;
  });

  return responseData(
    response,
    200,
    "Daftar buku berhasil diambil",
    data
  );
});

// GET: Mengambil detail buku berdasarkan ID
app.get("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const item = buku.find((b) => b.id === id);

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  return responseData(
    response,
    200,
    "Detail buku berhasil diambil",
    item
  );
});

// POST: Menambahkan buku baru
app.post("/buku", (request, response) => {
  const { judul, penulis, tahun, stok } = request.body;
  const errors = [];

  if (!judul) errors.push("Judul wajib diisi");
  if (!penulis) errors.push("Penulis wajib diisi");
  if (!tahun || !Number.isInteger(tahun)) {
    errors.push("Tahun wajib diisi dan berupa angka");
  }
  if (stok === undefined || !Number.isInteger(stok) || stok < 0) {
    errors.push("Stok wajib diisi berupa bilangan bulat minimal 0");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Data buku tidak valid",
      details: errors,
    });
  }

  const bukuBaru = {
    id: buku.length > 0 ? buku[buku.length - 1].id + 1 : 1,
    judul,
    penulis,
    tahun,
    stok,
  };

  buku.push(bukuBaru);

  return responseData(
    response,
    201,
    "Buku berhasil ditambahkan",
    bukuBaru
  );
});

// PUT: Mengubah seluruh data buku
app.put("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const index = buku.findIndex((b) => b.id === id);

  if (index === -1) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  const { judul, penulis, tahun, stok } = request.body;
  const errors = [];

  if (!judul) errors.push("Judul wajib diisi");
  if (!penulis) errors.push("Penulis wajib diisi");
  if (!Number.isInteger(tahun)) {
    errors.push("Tahun wajib berupa angka");
  }
  if (!Number.isInteger(stok) || stok < 0) {
    errors.push("Stok wajib berupa bilangan bulat minimal 0");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Data buku tidak valid",
      details: errors,
    });
  }

  buku[index] = {
    id,
    judul,
    penulis,
    tahun,
    stok,
  };

  return responseData(
    response,
    200,
    "Buku berhasil diperbarui",
    buku[index]
  );
});

// PATCH: Mengubah sebagian data buku
app.patch("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const index = buku.findIndex((b) => b.id === id);

  if (index === -1) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  const { judul, penulis, tahun, stok } = request.body;

  if (tahun !== undefined && !Number.isInteger(tahun)) {
    return response.status(400).json({
      success: false,
      message: "Tahun harus berupa angka",
    });
  }

  if (stok !== undefined && (!Number.isInteger(stok) || stok < 0)) {
    return response.status(400).json({
      success: false,
      message: "Stok tidak valid",
    });
  }

  if (judul !== undefined) buku[index].judul = judul;
  if (penulis !== undefined) buku[index].penulis = penulis;
  if (tahun !== undefined) buku[index].tahun = tahun;
  if (stok !== undefined) buku[index].stok = stok;

  return responseData(
    response,
    200,
    "Buku berhasil diperbarui",
    buku[index]
  );
});

// DELETE: Menghapus buku
app.delete("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const index = buku.findIndex((b) => b.id === id);

  if (index === -1) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  buku.splice(index, 1);
  return response.status(204).send();
});

export default app;
