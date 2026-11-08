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
import { prisma } from "../client.ts";

// ------------------------------------------------------------------
// SERVICE — operasi data pengguna.
// ------------------------------------------------------------------

/**
 * TODO 1: Mengambil daftar pengguna dengan filter NIM opsional.
 */
export const ambilDaftarPengguna = async (nim?: string) => {
  return prisma.pengguna.findMany({
    where: nim ? { nim } : {},
  });
};

/**
 * Validasi data pengguna.
 */
const validasiPengguna = (data: {
  nim: string;
  nama: string;
  email: string;
  role?: string;
}) => {
  if (typeof data.nim !== "string" || data.nim.trim() === "") {
    throw new Error("NIM wajib diisi");
  }

  if (typeof data.nama !== "string" || data.nama.trim() === "") {
    throw new Error("Nama wajib diisi");
  }

  if (
    typeof data.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    throw new Error("Email tidak valid");
  }

  if (
    data.role !== undefined &&
    (typeof data.role !== "string" || data.role.trim() === "")
  ) {
    throw new Error("Role tidak valid");
  }
};

/**
 * TODO 2: Membuat pengguna baru.
 */
export const buatPengguna = async (data: {
  nim: string;
  nama: string;
  email: string;
  role?: string;
}) => {
  validasiPengguna(data);

  return prisma.pengguna.create({
    data: {
      nim: data.nim.trim(),
      nama: data.nama.trim(),
      email: data.email.trim(),
      role: data.role?.trim() ?? "mahasiswa",
    },
  });
};

/**
 * Menghapus pengguna berdasarkan NIM.
 */
export const hapusPengguna = async (nim: string) => {
  const pengguna = await prisma.pengguna.findUnique({
    where: { nim },
  });

  if (!pengguna) {
    return null;
  }

  return prisma.pengguna.delete({
    where: { nim },
  });
};

// ------------------------------------------------------------------
// ROUTE — kelompokkan endpoint pengguna dalam satu router.
// ------------------------------------------------------------------

const penggunaRoutes = express.Router();

// GET /pengguna
penggunaRoutes.get("/", async (request: Request, response: Response) => {
  try {
    const nimRaw = request.query.nim;
    const nimFilter = typeof nimRaw === "string" ? nimRaw : undefined;

    const data = await ambilDaftarPengguna(nimFilter);

    return response.status(200).json({
      success: true,
      message: "Daftar pengguna",
      data,
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pengguna",
    });
  }
});

// POST /pengguna — TODO 3
penggunaRoutes.post("/", async (request: Request, response: Response) => {
  try {
    const { nim, nama, email, role } = request.body ?? {};

    if (
      typeof nim !== "string" ||
      typeof nama !== "string" ||
      typeof email !== "string" ||
      (role !== undefined && typeof role !== "string")
    ) {
      return response.status(400).json({
        success: false,
        message: "Data pengguna tidak valid",
      });
    }

    const data = await buatPengguna({ nim, nama, email, role });

    return response.status(201).json({
      success: true,
      message: "Pengguna berhasil ditambahkan",
      data,
    });
  } catch (error) {
    console.error(error);

    return response.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal membuat pengguna",
    });
  }
});

// DELETE /pengguna/:nim — TODO 4
penggunaRoutes.delete("/:nim", async (request: Request, response: Response) => {
  try {
    const nim = request.params.nim;

    if (typeof nim !== "string" || nim.trim() === "") {
      return response.status(400).json({
        success: false,
        message: "NIM tidak valid",
      });
    }

    const data = await hapusPengguna(nim.trim());

    if (!data) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    return response.status(204).send();
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      success: false,
      message: "Gagal menghapus pengguna",
    });
  }
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
