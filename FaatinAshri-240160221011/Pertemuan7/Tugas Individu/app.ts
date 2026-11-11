import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import mahasiswaRoutes from "./src/routes/mahasiswa.routes.ts";

const app = express();
const PORT = Number(process.env.PORT) || 3007;

// Middleware untuk membaca JSON
app.use(express.json());

// Route utama
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "REST API Mahasiswa berjalan",
  });
});

// Route mahasiswa
app.use("/mahasiswa", mahasiswaRoutes);

// Middleware 404 untuk endpoint yang tidak ditemukan
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Terjadi kesalahan:", err);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  },
);

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
