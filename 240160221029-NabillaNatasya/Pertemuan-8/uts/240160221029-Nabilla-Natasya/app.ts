import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./src/config/client.ts";
import { NotFoundError } from "./src/service/absensi.service.ts";
import absensiRouter from "./src/routes/absensi.routes.ts";

const app = express();
app.disable("x-powered-by");

// 1. Middleware parsing request body berformat JSON
app.use(express.json());

// 2. Endpoint dasar
// GET / — Informasi status server API dan identitas mahasiswa
app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "REST API Sistem Absensi dengan Pola Service/Controller berjalan",
    project: "UTS Mini Project Backend",
    mahasiswa: {
      nama: "Nabilla Natasya",
      nim: "240160221029",
      mataKuliah: "Praktikum Backend",
    },
  });
});

// GET /api/health — Pemeriksaan kesehatan API dan koneksi basis data SQLite
app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      message: "API dan database terhubung",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Koneksi database gagal",
    });
  }
});

// 3. Registrasi Router Resource Absensi dengan prefix /absensi
app.use("/absensi", absensiRouter);

// 4. Middleware 404: Menangani request ke URL/endpoint yang tidak terdaftar
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// 5. Global Error Handler: Menangani error yang didelegasikan dari controller / middleware
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  // Penanganan kesalahan parsing JSON malformed dari express.json()
  if (
    err instanceof SyntaxError &&
    typeof err === "object" &&
    err !== null &&
    "body" in err &&
    (("status" in err && (err as { status: unknown }).status === 400) ||
      ("statusCode" in err && (err as { statusCode: unknown }).statusCode === 400))
  ) {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
    });
  }

  // Penanganan NotFoundError dari lapisan service
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Penanganan error Prisma code P2025 (Record not found on delete/update)
  const prismaCode =
    typeof err === "object" && err !== null && "code" in err
      ? (err as { code: unknown }).code
      : undefined;

  if (prismaCode === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Data absensi tidak ditemukan",
    });
  }

  // Error tidak dikenal (Internal Server Error 500)
  console.error("Unhandled Error:", err instanceof Error ? err.message : err);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export { app };
export default app;
