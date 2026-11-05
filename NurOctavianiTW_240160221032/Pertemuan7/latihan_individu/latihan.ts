/**
 * Pertemuan 7 — Latihan: Rework Resource Pengguna dengan Pola Lapis
 */

import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";

// ------------------------------------------------------------------
// SERVICE — seluruh query Prisma berada di sini.
// ------------------------------------------------------------------

/**
 * TODO 1: Mengambil daftar pengguna dengan filter NIM opsional.
 */
export const ambilDaftarPengguna = async (nim?: string) => {
  return prisma.pengguna.findMany({
    where: nim ? { nim } : undefined,
  });
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
  return prisma.pengguna.create({
    data: {
      nim: data.nim,
      nama: data.nama,
      email: data.email,
      role: data.role ?? "user",
    },
  });
};

/**
 * Menghapus pengguna berdasarkan NIM.
 */
export const hapusPengguna = async (nim: string) => {
  return prisma.pengguna.delete({
    where: { nim },
  });
};

// ------------------------------------------------------------------
// ROUTE — kelompokkan endpoint pengguna.
// ------------------------------------------------------------------

const penggunaRoutes = express.Router();

// GET /pengguna?nim=...
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

// TODO 3: POST /pengguna
penggunaRoutes.post("/", async (request: Request, response: Response) => {
  const body: unknown = request.body;

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return response.status(400).json({
      success: false,
      message: "Body harus berupa object JSON",
    });
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof data.nim !== "string" || data.nim.trim() === "") {
    errors.push("Field nim wajib diisi berupa string");
  }

  if (typeof data.nama !== "string" || data.nama.trim() === "") {
    errors.push("Field nama wajib diisi berupa string");
  }

  if (
    typeof data.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    errors.push("Field email wajib diisi dengan format email yang valid");
  }

  if (
    data.role !== undefined &&
    (typeof data.role !== "string" || data.role.trim() === "")
  ) {
    errors.push("Field role harus berupa string yang tidak kosong");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Data pengguna tidak valid",
      details: errors,
    });
  }

  try {
    const pengguna = await buatPengguna({
      nim: (data.nim as string).trim(),
      nama: (data.nama as string).trim(),
      email: (data.email as string).trim(),
      ...(typeof data.role === "string"
        ? { role: data.role.trim() }
        : {}),
    });

    return response.status(201).json({
      success: true,
      message: "Pengguna berhasil dibuat",
      data: pengguna,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return response.status(409).json({
        success: false,
        message: "NIM atau email sudah terdaftar",
      });
    }

    console.error(error);
    return response.status(500).json({
      success: false,
      message: "Gagal membuat pengguna",
    });
  }
});

// TODO 4: DELETE /pengguna/:nim
penggunaRoutes.delete("/:nim", async (request: Request, response: Response) => {
  const nimRaw = request.params.nim;

  if (typeof nimRaw !== "string" || nimRaw.trim() === "") {
    return response.status(400).json({
      success: false,
      message: "Parameter NIM wajib diisi",
    });
  }

  try {
    await hapusPengguna(nimRaw);

    return response.status(204).end();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

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
  return response.status(200).json({
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