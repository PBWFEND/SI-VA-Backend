import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./client.ts";
import bukuRoutes from "./src/routes/buku.routes.ts";
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
    project: "Sistem Informasi Perpustakaan",
    message: "REST API Perpustakaan dengan Pola Service/Controller berjalan",
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

// 3. Registrasi Router Resource Buku
app.use("/buku", bukuRoutes);

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