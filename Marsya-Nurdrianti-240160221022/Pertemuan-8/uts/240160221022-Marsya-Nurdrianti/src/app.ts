import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./client.ts";
import { NotFoundError } from "./service/absensi.service.ts";
import absensiRouter from "./routes/absensi.routes.ts";

const app = express();
app.disable("x-powered-by");

// 1. Middleware parsing request body format JSON
app.use(express.json());

// 2. Endpoint root — Informasi API
app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "REST API Sistem Informasi Absensi Mahasiswa berjalan",
    author: "Marsya Nurdrianti (240160221022)",
    kelas: "SI-VA",
  });
});

// 3. Endpoint health check — Verifikasi konektivitas database
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

// 4. Registrasi Router Resource Absensi
// Rute utama sesuai spesifikasi UTS: /api/absensi
app.use("/api/absensi", absensiRouter);
// Alias untuk fleksibilitas referensi tugas sebelumnya
app.use("/absensi", absensiRouter);

// 5. Middleware 404: Menangani URL/endpoint yang tidak terdaftar
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// 6. Global Error Handler: Menangani error yang didelegasikan dari controller / middleware
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  // Penanganan kesalahan format JSON tidak valid
  if (
    err instanceof SyntaxError &&
    typeof err === "object" &&
    err !== null &&
    "body" in err &&
    (("status" in err && (err as { status: unknown }).status === 400) ||
      ("statusCode" in err &&
        (err as { statusCode: unknown }).statusCode === 400))
  ) {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Penanganan Prisma Known Request Error (misal P2025: Record not found)
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

  // Penanganan Internal Server Error 500 tanpa membocorkan trace internal ke client
  console.error("Unhandled Error:", err instanceof Error ? err.message : err);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export { app };
export default app;

