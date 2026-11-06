
import express, { type Request, type Response, type NextFunction } from "express";
import absensiRoutes from "./routes/absensiRoutes.ts";

const app = express();

app.use(express.json());

// Routes Absensi
app.use("/absensi", absensiRoutes);

// Middleware 404 jika endpoint tidak ditemukan
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use(
  (error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);

    const kodeError =
      typeof error === "object" && error !== null && "code" in error
        ? error.code
        : undefined;

    if (kodeError === "P2025") {
      res.status(404).json({
        success: false,
        message: "Data absensi tidak ditemukan",
      });
      return;
    }

    if (kodeError === "P2003") {
      res.status(400).json({
        success: false,
        message: "Anggota tidak ditemukan atau relasi tidak valid",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
);

export default app;
