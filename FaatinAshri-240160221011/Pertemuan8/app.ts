import express, { type Request, type Response, type NextFunction } from "express";
import bukuRoutes from "./src/routes/buku.routes.ts";

const app = express();

// Middleware untuk membaca JSON
app.use(express.json());

// Endpoint utama buku
app.use("/api/buku", bukuRoutes);

// Route tidak ditemukan (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler (500)
app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
);

export default app;