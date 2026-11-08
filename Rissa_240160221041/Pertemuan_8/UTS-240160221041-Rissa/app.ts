import express from "express";
import type { Request, Response, NextFunction } from "express";
import bukuRouter from "./src/routes/buku.routes";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Main Resource Route
app.use("/buku", bukuRouter);

// Middleware 404 Not Found (Constraint #7)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Resource atau Endpoint tidak ditemukan"
  });
});

// Global Error Handler Middleware (Constraint #7 & Status 500)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Gagal memproses permintaan, terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

export default app;