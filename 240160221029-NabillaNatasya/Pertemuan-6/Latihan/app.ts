/**
 * Pertemuan 6 — Database dan ORM untuk Aplikasi Node.js
 * Tujuan: menyediakan endpoint CRUD untuk resource buku menggunakan Prisma Client.
 * Digunakan oleh: server.ts
 *
 * Jalankan:
 *   npx prisma migrate dev --name init
 *   npx prisma generate
 *   node --experimental-strip-types server.ts
 *
 * Uji (terminal lain):
 *   curl http://localhost:3008/buku
 */

import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";

const app = express();
app.disable("x-powered-by");

// Middleware yang membaca body request berformat JSON.
// Wajib didaftarkan sebelum route yang membaca request.body (POST/PATCH).
app.use(express.json());

/**
 * Helper untuk mengirim response sukses.
 * Struktur JSON: { success: true, message, data }
 */
const sendSuccess = (response: Response, statusCode: number, message: string, data: unknown) => {
  return response.status(statusCode).json({ success: true, message, data });
};

/**
 * Helper untuk mengirim response error.
 * Struktur JSON: { success: false, message, details? }
 * Field details bersifat opsional dan hanya disertakan bila ada (mis. daftar error validasi).
 */
const sendError = (response: Response, statusCode: number, message: string, details?: unknown) => {
  return response.status(statusCode).json({ success: false, message, ...(details && { details }) });
};

// Middleware logger: mencatat setiap request yang masuk untuk memudahkan pelacakan.
app.use((request: Request, response: Response, next: () => void) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
  next();
});

// GET / — endpoint informasi: menampilkan daftar endpoint yang tersedia.
app.get("/", (_request: Request, response: Response) => {
  return sendSuccess(response, 200, "Database API Pertemuan 6", {
    resource: "buku",
    endpoints: [
      "GET /buku",
      "GET /buku/:id",
      "POST /buku",
      "PATCH /buku/:id",
      "DELETE /buku/:id",
    ],
  });
});

// GET /health — endpoint pemeriksaan kesehatan untuk monitoring server.
app.get("/health", (_request: Request, response: Response) => {
  return sendSuccess(response, 200, "API berjalan", { status: "up" });
});

// GET /buku — membaca daftar buku dengan filter opsional (penulis, minStok).
app.get("/buku", async (request: Request, response: Response) => {
  // Query parameter bertipe string | string[]; pakai typeof untuk memastikan tipe sebelum dipakai.
  const penulisFilter =
    typeof request.query.penulis === "string" ? request.query.penulis : undefined;
  const minStokRaw = request.query.minStok;
  const minStokFilter = typeof minStokRaw === "string" ? Number(minStokRaw) : undefined;

  // findMany: mengambil banyak baris.
  // Kriteria where dibangun dinamis: filter hanya disertakan bila nilainya terisi.
  // stok: { gte: ... } berarti "lebih besar atau sama dengan".
  const data = await prisma.buku.findMany({
    where: {
      ...(penulisFilter !== undefined && { penulis: penulisFilter }),
      ...(minStokFilter !== undefined && Number.isNaN(minStokFilter) === false && { stok: { gte: minStokFilter } }),
    },
    orderBy: { judul: "asc" },
  });

  return sendSuccess(response, 200, "Daftar buku berhasil diambil", {
    total: data.length,
    data,
  });
});

// GET /buku/:id — membaca satu buku berdasarkan id pada URL.
app.get("/buku/:id", async (request: Request, response: Response) => {
  // request.params.id bertipe string; validasi dulu sebelum konversi ke angka.
  const idRaw = request.params.id;
  const id = typeof idRaw === "string" ? Number(idRaw) : undefined;
  if (id === undefined || Number.isNaN(id)) {
    return sendError(response, 400, "Parameter id harus berupa bilangan bulat");
  }

  // findFirst: mengambil satu baris pertama yang cocok; mengembalikan null bila tidak ada.
  const item = await prisma.buku.findFirst({
    where: { id },
  });

  if (!item) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  return sendSuccess(response, 200, "Detail buku berhasil diambil", item);
});

// POST /buku — membuat buku baru.
app.post("/buku", async (request: Request, response: Response) => {
  // Destructuring field dari body JSON yang dikirim client.
  const { judul, penulis, tahun, stok } = request.body as {
    judul?: string;
    penulis?: string;
    tahun?: number;
    stok?: number;
  };

  // Validasi: kumpulkan semua error, lalu kirim sekaligus dengan status 400.
  const errors: string[] = [];
  if (judul === undefined) errors.push("Field judul wajib diisi");
  if (penulis === undefined) errors.push("Field penulis wajib diisi");
  if (tahun === undefined || !Number.isInteger(tahun)) errors.push("Field tahun wajib berupa bilangan bulat");
  if (stok !== undefined && (!Number.isInteger(stok) || stok < 0)) {
    errors.push("Field stok harus bilangan bulat minimal 0");
  }

  if (errors.length > 0) {
    return sendError(response, 400, "Data buku tidak valid", errors);
  }

  // create: membuat baris baru di tabel buku.
  // stok bersifat opsional; bila tidak dikirim, database memakai nilai default (0).
  const baru = await prisma.buku.create({
    data: {
      judul: judul,
      penulis: penulis,
      tahun: tahun,
      ...(stok !== undefined && { stok: stok }),
    },
  });

  // 201 Created: resource baru berhasil dibuat.
  return sendSuccess(response, 201, "Buku berhasil dibuat", baru);
});

// PATCH /buku/:id — mengubah sebagian field buku (di sini hanya stok).
app.patch("/buku/:id", async (request: Request, response: Response) => {
  const idRaw = request.params.id;
  const id = typeof idRaw === "string" ? Number(idRaw) : undefined;
  if (id === undefined || Number.isNaN(id)) {
    return sendError(response, 400, "Parameter id harus berupa bilangan bulat");
  }
  const item = await prisma.buku.findFirst({ where: { id } });
  if (!item) return sendError(response, 404, "Buku tidak ditemukan");

  const { stok } = request.body as { stok?: number };
  const errors: string[] = [];
  if (stok !== undefined && (!Number.isInteger(stok) || stok < 0)) {
    errors.push("Field stok harus bilangan bulat minimal 0");
  }
  if (errors.length > 0) return sendError(response, 400, "Data perubahan tidak valid", errors);

  // update: mengubah baris berdasarkan id.
  // Hanya field yang terdefinisi pada data yang diubah (sebagian, sesuai sifat PATCH).
  const diperbarui = await prisma.buku.update({
    where: { id },
    data: {
      ...(stok !== undefined && { stok: stok }),
    },
  });

  return sendSuccess(response, 200, "Buku berhasil diperbarui", diperbarui);
});

// DELETE /buku/:id — menghapus buku berdasarkan id.
app.delete("/buku/:id", async (request: Request, response: Response) => {
  const idRaw = request.params.id;
  const id = typeof idRaw === "string" ? Number(idRaw) : undefined;
  if (id === undefined || Number.isNaN(id)) {
    return sendError(response, 400, "Parameter id harus berupa bilangan bulat");
  }
  const item = await prisma.buku.findFirst({ where: { id } });
  if (!item) return sendError(response, 404, "Buku tidak ditemukan");

  await prisma.buku.delete({ where: { id } });

  // 204 No Content: operasi berhasil, response tanpa body.
  return response.status(204).send();
});

// Middleware 404: menangani request ke endpoint yang tidak terdaftar.
// Ditempatkan setelah semua route agar hanya menangkap yang lolos dari route.
app.use((_request: Request, response: Response) => {
  return sendError(response, 404, "Endpoint tidak ditemukan");
});

// Middleware error handler: menangkap error yang tidak ditangani sebelumnya.
// Wajib punya 4 parameter agar Express mengenali sebagai middleware error.
app.use((error: Error, _request: Request, response: Response, _next: () => void) => {
  console.error("Kesalahan aplikasi:", error.message);
  // Jangan bocorkan detail error ke client; pesan umum saja.
  return sendError(response, 500, "Terjadi kesalahan pada server");
});

export { app, prisma };