/**
 * Pertemuan 7 — Latihan: Rework Resource Pengguna dengan Pola Lapis
 * Tujuan: memindahkan resource pengguna ke pola service/controller/routes
 *         seperti resource buku pada pertemuan ini.
 *
 * Struktur target (bandingkan dengan resource buku):
 *   src/routes/pengguna.routes.ts
 *     └── src/controller/pengguna.controller.ts
 *           └── src/service/pengguna.service.ts
 *
 * Jalankan:
 *   npx prisma migrate dev --name pengguna
 *   node --experimental-strip-types latihan.ts
 *
 * Catatan: file ini berisi kerangka service dan route resource pengguna
 * yang masih datar. Kerjakan TODO agar resource pengguna mengikuti pola
 * lapis yang sama dengan resource buku.
 */

import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";

// ------------------------------------------------------------------
// SERVICE — operasi data pengguna. Kumpulkan seluruh query Prisma di sini.
// ------------------------------------------------------------------

/**
 * Mengambil daftar pengguna dengan filter nim.
 * TODO 1: implementasi menggunakan prisma.pengguna.findMany.
 */
export const ambilDaftarPengguna = async (nim?: string) => {
  // Tuliskan query Prisma di sini.
  return prisma.pengguna.findMany();
};

/**
 * Membuat pengguna baru.
 * TODO 2: implementasi menggunakan prisma.pengguna.create.
 */
export const buatPengguna = async (data: {
  nim: string;
  nama: string;
  email: string;
  role?: string;
}) => {
  // TODO 2
  throw new Error("TODO 2 — implementasi create pengguna belum selesai");
};

// ------------------------------------------------------------------
// ROUTE — kelompokkan endpoint pengguna dalam satu router.
// ------------------------------------------------------------------

const penggunaRoutes = express.Router();

penggunaRoutes.get("/", async (request: Request, response: Response) => {
  const nimRaw = request.query.nim;
  const nimFilter = typeof nimRaw === "string" ? nimRaw : undefined;
  // TODO 1: ganti pemanggilan langsung prisma di service agar
  // controller tidak menyentuh Prisma Client.
  const data = await ambilDaftarPengguna(nimFilter);
  return response.status(200).json({ success: true, message: "Daftar pengguna", data });
});

// TODO 3: tambahkan endpoint POST /pengguna (validasi + create).
// TODO 4: tambahkan endpoint DELETE /pengguna/:nim (204 bila sukses).
penggunaRoutes.post("/", (_request: Request, response: Response) => {
  // TODO 3
  return response.status(501).json({
    success: false,
    message: "Endpoint POST /pengguna belum diimplementasikan (TODO 3)",
  });
});

// ------------------------------------------------------------------
// APP — susun semuanya.
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

app.use("/pengguna", penggunaRoutes);

const port = Number(process.env.PORT_LATIHAN ?? 3009);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`API Latihan Pengguna berjalan di http://localhost:${port}`);
});