import express from "express";
import bukuRoutes from "./src/routes/buku.routes.ts";

const app = express();

// Middleware untuk membaca JSON
app.use(express.json());

// Middleware untuk mencatat aktivitas
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Halaman utama
app.get("/", (req, res) => {
  res.status(200).json({
    pesan: "API Perpustakaan berhasil dijalankan",
  });
});

// Endpoint untuk mengecek server
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

// Menggunakan routes buku
app.use("/buku", bukuRoutes);

// Jika alamat tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    pesan: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);

  res.status(500).json({
    pesan: "Terjadi kesalahan pada server",
  });
});

export default app;
