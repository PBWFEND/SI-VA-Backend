
import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./client.ts";
import { NotFoundError, ConflictError } from "./src/service/absensi.service.ts";
import absensiRouter from "./src/routes/absensi.routes.ts";
import { anggotaRoutes } from "./src/routes/anggota.routes.ts";

const app = express();
app.disable("x-powered-by");

// 1. Middleware parsing request body berformat JSON
app.use(express.json());

// 2. Endpoint dasar
// GET / — Informasi status server API
app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    project: "Sistem Informasi Absensi Organisasi",
    message: "REST API Absensi dengan Pola Service/Controller berjalan",
  });
});

// GET /api/health — Pemeriksaan kesehatan API dan koneksi database
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

// 3. Registrasi Router Resource Absensi
app.use("/absensi", absensiRouter);

// 4. Registrasi Router Resource Anggota
app.use("/anggota", anggotaRoutes);

// 5. Middleware 404
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// 6. Global Error Handler
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  // Penanganan kesalahan parsing JSON malformed
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

  // Penanganan data tidak ditemukan
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Penanganan konflik data
  if (err instanceof ConflictError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Error tidak dikenal
  console.error(
    "Unhandled Error:",
    err instanceof Error ? err.message : err
  );

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export { app };
export default app;
