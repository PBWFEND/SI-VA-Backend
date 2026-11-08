import express, { type Request, type Response } from "express";
import penggunaRoutes from "./src/routes/pengguna.routes.ts";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Endpoint utama
app.get("/", (_request: Request, response: Response) => {
  return response.status(200).json({
    success: true,
    message: "API Latihan Pengguna — Pertemuan 7",
    data: {
      resource: "pengguna",
    },
  });
});

// Daftarkan routes pengguna
app.use("/pengguna", penggunaRoutes);

// Port server
const port = Number(process.env.PORT_LATIHAN ?? 3009);

// Menutup koneksi Prisma saat server dihentikan
import { prisma } from "./client.ts";

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Menjalankan server
app.listen(port, () => {
  console.log(`API Latihan Pengguna berjalan di http://localhost:${port}`);
});
