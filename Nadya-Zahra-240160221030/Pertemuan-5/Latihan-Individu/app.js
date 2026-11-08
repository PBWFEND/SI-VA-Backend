/**
 * Pertemuan 5 — RESTful API dengan Express.js
 * Tujuan: menyediakan endpoint CRUD untuk resource buku.
 * Digunakan oleh: server.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

let buku = [
  { id: 1, judul: "Belajar Node.js", penulis: "Andi", tahun: 2024, stok: 3 },
  { id: 2, judul: "Dasar Express.js", penulis: "Budi", tahun: 2025, stok: 0 },
];
let nextId = 3;

const sendSuccess = (response, statusCode, message, data) => {
  return response.status(statusCode).json({ success: true, message, data });
};

const sendError = (response, statusCode, message, details = undefined) => {
  return response.status(statusCode).json({ success: false, message, ...(details && { details }) });
};

app.use((request, response, next) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
  next();
});

app.get("/", (request, response) => {
  return sendSuccess(response, 200, "REST API Pertemuan 5", {
    resource: "buku",
    endpoints: [
      "GET /buku",
      "GET /buku/:id",
      "POST /buku",
      "PUT /buku/:id",
      "PATCH /buku/:id",
      "DELETE /buku/:id",
    ],
  });
});

app.get("/health", (request, response) => {
  return sendSuccess(response, 200, "API berjalan", { status: "up" });
});

app.get("/buku", (request, response) => {
  const { penulis, tahun, minStok } = request.query;
  const data = buku.filter((item) => {
    const cocokPenulis = penulis === undefined || item.penulis.toLowerCase() === String(penulis).toLowerCase();
    const cocokTahun = tahun === undefined || item.tahun === Number(tahun);
    const cocokStok = minStok === undefined || item.stok >= Number(minStok);
    return cocokPenulis && cocokTahun && cocokStok;
  });

  return sendSuccess(response, 200, "Daftar buku berhasil diambil", {
    total: data.length,
    data,
  });
});

app.get("/buku/:id", (request, response) => {
  const item = buku.find(({ id }) => id === Number(request.params.id));

  if (!item) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  return sendSuccess(response, 200, "Detail buku berhasil diambil", item);
});

const validateBook = (payload, partial = false) => {
  const errors = [];
  const requiredFields = ["judul", "penulis", "tahun", "stok"];

  if (!partial) {
    for (const field of requiredFields) {
      if (payload[field] === undefined) errors.push(`Field ${field} wajib diisi`);
    }
  }

  if (payload.judul !== undefined && typeof payload.judul !== "string") errors.push("judul harus berupa string");
  if (payload.penulis !== undefined && typeof payload.penulis !== "string") errors.push("penulis harus berupa string");
  if (payload.tahun !== undefined && (!Number.isInteger(payload.tahun) || payload.tahun < 1900)) errors.push("tahun tidak valid");
  if (payload.stok !== undefined && (!Number.isInteger(payload.stok) || payload.stok < 0)) errors.push("stok harus bilangan bulat minimal 0");

  return errors;
};

app.post("/buku", (request, response) => {
  const errors = validateBook(request.body);
  if (errors.length > 0) return sendError(response, 400, "Data buku tidak valid", errors);

  const baru = { id: nextId++, ...request.body };
  buku.push(baru);
  return sendSuccess(response, 201, "Buku berhasil dibuat", baru);
});

app.put("/buku/:id", (request, response) => {
  const index = buku.findIndex(({ id }) => id === Number(request.params.id));
  if (index === -1) return sendError(response, 404, "Buku tidak ditemukan");

  const errors = validateBook(request.body);
  if (errors.length > 0) return sendError(response, 400, "Data buku tidak valid", errors);

  buku[index] = { id: buku[index].id, ...request.body };
  return sendSuccess(response, 200, "Buku berhasil diganti", buku[index]);
});

app.patch("/buku/:id", (request, response) => {
  const item = buku.find(({ id }) => id === Number(request.params.id));
  if (!item) return sendError(response, 404, "Buku tidak ditemukan");

  const errors = validateBook(request.body, true);
  if (errors.length > 0) return sendError(response, 400, "Data perubahan tidak valid", errors);

  Object.assign(item, request.body);
  return sendSuccess(response, 200, "Buku berhasil diperbarui", item);
});

app.delete("/buku/:id", (request, response) => {
  const index = buku.findIndex(({ id }) => id === Number(request.params.id));
  if (index === -1) return sendError(response, 404, "Buku tidak ditemukan");

  buku.splice(index, 1);
  return response.status(204).send();
});

app.use((request, response) => sendError(response, 404, "Endpoint tidak ditemukan"));

app.use((error, request, response, next) => {
  console.error("Kesalahan aplikasi:", error.message);
  return sendError(response, 500, "Terjadi kesalahan pada server");
});

export default app;