/**
 * App Module — Pertemuan 7 (Tugas 5)
 * Tanggung Jawab: Inisialisasi Express, middleware global, registrasi Router, 404 handler, error handler.
 * Larangan: Tidak menaruh CRUD Prisma langsung di file ini.
 */

import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./client.ts";
import { router as bukuRouter } from "./src/routes/buku.routes.ts";

const app = express();
app.disable("x-powered-by");

// 1. Middleware parsing request body berformat JSON
app.use(express.json());

// 2. Middleware logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 3. Endpoint dasar informasi sistem
// GET / — Informasi status server API
app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    project: "Tugas 5 — Sistem Informasi Perpustakaan (Pertemuan 7)",
    mahasiswa: "Sarah Azkiya",
    nim: "240160221057",
    message: "REST API Perpustakaan dengan Pola Layering Route-Controller-Service berjalan",
    endpoints: {
      health: "GET /api/health",
      getBuku: "GET /buku",
      getBukuDetail: "GET /buku/:id",
      createBuku: "POST /buku",
      updateBuku: "PATCH /buku/:id",
      deleteBuku: "DELETE /buku/:id",
    },
  });
});

// GET /api/health — Pemeriksaan kesehatan koneksi database SQLite
app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      message: "API dan database SQLite terhubung",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Koneksi database gagal",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// 4. Registrasi Router Resource Buku
app.use("/buku", bukuRouter);

// 5. Middleware 404 Handler (Endpoint Tidak Ditemukan)
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// 6. Global Error Handler Terpusat
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (
    err instanceof SyntaxError &&
    typeof err === "object" &&
    err !== null &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Format JSON pada request body tidak valid",
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export { app };
export default app;

