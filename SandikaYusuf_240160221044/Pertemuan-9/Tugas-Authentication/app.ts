import express, { type Request, type Response, type NextFunction } from "express";
import authRouter from "./src/routes/auth.routes.ts";
import mahasiswaRouter from "./src/routes/mahasiswa.routes.ts";

const app = express();
app.disable("x-powered-by");

app.use(express.json());

// Endpoint dasar
app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "REST API Authentication & Data Mahasiswa — Sandika Yusuf Permana (240160221044)",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Server dan layanan autentikasi aktif",
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

// Central Error Handler
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
    });
  }

  console.error("Unhandled Error:", err instanceof Error ? err.message : err);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export { app };
export default app;

