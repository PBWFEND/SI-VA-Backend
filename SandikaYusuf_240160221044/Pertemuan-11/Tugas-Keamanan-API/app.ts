import express, { type Request, type Response, type NextFunction } from "express";
import {
  securityHeadersMiddleware,
  corsMiddleware,
  requestIdMiddleware,
  globalLimiter,
} from "./src/middleware/security.middleware.ts";
import authRouter from "./src/routes/auth.routes.ts";
import mahasiswaRouter from "./src/routes/mahasiswa.routes.ts";

const app = express();
app.disable("x-powered-by");

// 1. Lapisan Pertama: Security Headers (Helmet) & Request Tracker
app.use(securityHeadersMiddleware);
app.use(requestIdMiddleware);

// 2. Lapisan Kedua: CORS Selektif
app.use(corsMiddleware);

// 3. Lapisan Ketiga: Rate Limiter Global
app.use(globalLimiter);

// 4. Lapisan Keempat: Body Parser dengan Batas Ukuran 10KB (Cegah Payload Flooding)
app.use(express.json({ limit: "10kb" }));

// Endpoint Dasar Publik
app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "REST API Keamanan Backend & Data Mahasiswa — Sandika Yusuf Permana (240160221044)",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Layanan server dan lapisan keamanan aktif optimal",
  });
});

// Mounting Router
app.use("/auth", authRouter);
app.use("/mahasiswa", mahasiswaRouter);
app.use("/api/mahasiswa", mahasiswaRouter);

// Middleware 404
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Central Safe Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  // Penanganan Khusus Payload Melebihi Batas (10KB)
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Ukuran request payload terlalu besar. Maksimal 10KB diizinkan.",
    });
  }

  // Penanganan Error JSON Sintaks
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
    });
  }

  // Log error hanya di sisi server, jangan pernah bocorkan ke client
  console.error(`[ERROR] [Req: ${(req as any).requestId}]`, err instanceof Error ? err.message : err);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server",
    requestId: (req as any).requestId,
  });
});

export { app };
export default app;

