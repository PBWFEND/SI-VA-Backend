import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./src/config/client.ts";
import { NotFoundError } from "./src/service/absensi.service.ts";
import absensiRouter from "./src/routes/absensi.routes.ts";

const app = express();
app.disable("x-powered-by");

// 1. Middleware parsing request body berformat JSON
app.use(express.json());

// 2. Endpoint dasar
// GET / — Informasi status server API
app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "REST API Sistem Informasi Absensi Mahasiswa — Della Kartika (240160221008)",
  });
});

// GET /api/health & GET /health — Pemeriksaan kesehatan API dan koneksi database
const healthHandler = async (_req: Request, res: Response) => {
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
};

app.get("/api/health", healthHandler);
app.get("/health", healthHandler);

// 3. Registrasi Router Resource Absensi dengan prefix /api/absensi (dan /absensi)
app.use("/api/absensi", absensiRouter);
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

  // Penanganan entitas tidak ditemukan (404)
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Error tidak dikenal (Internal Server Error 500) tanpa membocorkan detail sensitif
  console.error("Unhandled Error:", err instanceof Error ? err.message : err);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export { app };
export default app;
