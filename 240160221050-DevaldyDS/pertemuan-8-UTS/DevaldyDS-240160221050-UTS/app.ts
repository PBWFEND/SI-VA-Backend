import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";

import bukuRoutes from "./src/routes/buku.routes.js";

const app = express();

// Middleware untuk membaca JSON
app.use(express.json());

// Route health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API berjalan dengan baik",
  });
});

// Route resource buku
app.use("/buku", bukuRoutes);

// Middleware 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use(
  (
    err: Error & { status?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error("Server Error:", err.message);

    // JSON yang dikirim tidak valid
    if (err instanceof SyntaxError && err.status === 400) {
      return res.status(400).json({
        success: false,
        message: "Format JSON tidak valid",
      });
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  },
);

export default app;
