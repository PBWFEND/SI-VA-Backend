/**
 * Pertemuan 7 — Latihan: Rework Resource Pengguna dengan Pola Lapis
 * Tujuan: memindahkan resource pengguna ke pola service/controller/routes
 *         seperti resource buku pada pertemuan ini.
 *
 * Struktur target (pola lapis):
 *   src/routes/pengguna.routes.ts
 *     └── src/controller/pengguna.controller.ts
 *           └── src/service/pengguna.service.ts
 *
 * Jalankan:
 *   node --experimental-strip-types latihan.ts
 */

import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./client.ts";
import {
  ambilDaftarPengguna,
  buatPengguna,
} from "./src/service/pengguna.service.ts";
import { penggunaRoutes } from "./src/routes/pengguna.routes.ts";

// ------------------------------------------------------------------
// RE-EKSPOR SERVICE FUNGSI (Memenuhi TODO 1 dan TODO 2)
// ------------------------------------------------------------------
export { ambilDaftarPengguna, buatPengguna };

// ------------------------------------------------------------------
// APP — Inisialisasi Express dan Middleware
// ------------------------------------------------------------------

const app = express();
app.disable("x-powered-by");
app.use(express.json());

app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "API Latihan Pengguna — Pertemuan 7",
    data: { resource: "pengguna" },
  });
});

// Routing resource pengguna (Memenuhi TODO 1, TODO 3, dan TODO 4)
app.use("/pengguna", penggunaRoutes);

// Penanganan error global (SyntaxError JSON malformed dan internal server error)
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (
    error instanceof SyntaxError &&
    "status" in error &&
    (error as { status?: number }).status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
    });
  }

  console.error("Kesalahan internal server:", error);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

const port = Number(process.env.PORT_LATIHAN ?? 3009);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Jalankan listener server jika bukan dalam mode test runner import
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`API Latihan Pengguna berjalan di http://localhost:${port}`);
  });
}

export { app, prisma };
export default app;
