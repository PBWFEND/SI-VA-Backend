/**
 * Pertemuan 7 — CRUD REST API: Aplikasi
 * Tujuan: menyusun seluruh lapisan (route → controller → service → Prisma)
 *         dalam satu aplikasi Express yang siap dijalankan server.ts.
 *
 * Struktur lapisan (dari atas ke bawah):
 *   app.ts (file ini)
 *     └── src/routes/buku.routes.ts        — path resource
 *           └── src/controller/buku.controller.ts  — validasi + status code
 *                 └── src/service/buku.service.ts  — operasi data
 *                       └── client.ts (Prisma)
 *
 * Jalankan:
 *   npx prisma migrate dev --name init
 *   npx prisma generate
 *   node --experimental-strip-types server.ts
 *
 * Uji (terminal lain):
 *   curl http://localhost:3008/buku
 *   curl -X POST http://localhost:3008/buku \
 *        -H "Content-Type: application/json" \
 *        -d '{"judul":"Belajar Node.js","penulis":"Andi","tahun":2024,"stok":3}'
 */

import express, { type Request, type Response } from "express";
export { prisma } from "./client.ts";
import { bukuRoutes } from "./src/routes/buku.routes.ts";

const app = express();
app.disable("x-powered-by");

// Middleware JSON parser wajib didaftarkan sebelum route apa pun yang
// membaca request.body — tanpa ini, POST/PATCH mendapat body undefined
// dan validasi controller gagal total.
app.use(express.json());

// Middleware logger sederhana: mencatat setiap request untuk pelacakan
// cepat tanpa harus membuka log Prisma.
app.use((request: Request, response: Response, next: () => void) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
  next();
});

// Endpoint informasi — menampilkan daftar resource dan status API.
app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "CRUD REST API — Pertemuan 7",
    data: {
      resource: "buku",
      endpoints: [
        "GET /buku",
        "GET /buku/:id",
        "POST /buku",
        "PATCH /buku/:id",
        "DELETE /buku/:id",
      ],
    },
  });
});

// Endpoint health check — dipakai monitoring dan load balancer.
app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({ success: true, message: "API berjalan", data: { status: "up" } });
});

// Seluruh endpoint resource buku disusun pada satu router.
// Dengan cara ini, bila path bergeser (mis. /api/buku), hanya baris ini
// yang perlu diubah — route dan handler tidak terpengaruh.
app.use("/buku", bukuRoutes);

// Middleware 404: menangkap request yang tidak cocok dengan route apa pun.
// Ditempatkan setelah semua route agar tidak menelan endpoint yang valid.
app.use((_request: Request, response: Response) => {
  response.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

// Middleware error handler: menangkap error yang lolos dari route
// (mis. error Prisma saat database tidak tersedia). Harus punya
// empat parameter agar Express mengenali sebagai middleware error.
app.use((error: Error, _request: Request, response: Response, _next: () => void) => {
  console.error("Kesalahan aplikasi:", error.message);
  // Jangan bocorkan detail error ke client — pesan umum saja.
  response.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

export { app };
