import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./client.ts";
import { authRoutes } from "./src/routes/auth.routes.ts";

const app = express();
app.disable("x-powered-by");

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    project: "Sistem Informasi Perpustakaan",
    module: "Pertemuan 9 — Authentication (Register, Login, scrypt)",
  });
});

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

// Registrasi Route Authentication
app.use("/auth", authRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Global Error Handler
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
      message: "Format JSON tidak valid",
    });
  }

  // Handle custom status code (400, 401, 404, 409)
  if (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as { statusCode: unknown }).statusCode === "number"
  ) {
    const customErr = err as { statusCode: number; message: string };
    return res.status(customErr.statusCode).json({
      success: false,
      message: customErr.message,
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

