
/**
 * Pertemuan 7 — Latihan Individu
 * CRUD Resource Pengguna dengan Prisma ORM
 */

import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";

// ================================================================
// SERVICE — Mengelola operasi database
// ================================================================

/**
 * TODO 1:
 * Mengambil daftar pengguna dengan filter NIM opsional.
 */
export const ambilDaftarPengguna = async (nim?: string) => {
  return prisma.pengguna.findMany({
    where: nim ? { nim } : {},
    orderBy: { nim: "asc" },
  });
};

/**
 * TODO 2:
 * Membuat pengguna baru menggunakan Prisma.
 * Validasi dilakukan terpisah di controller.
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
      role: data.role ?? "mahasiswa",
    },
  });
};

/**
 * Menghapus pengguna berdasarkan NIM.
 */
export const hapusPengguna = async (nim: string) => {
  return prisma.pengguna.deleteMany({
    where: { nim },
  });
};

// ================================================================
// CONTROLLER — Validasi input dan response HTTP
// ================================================================

type DataPengguna = {
  nim: string;
  nama: string;
  email: string;
  role?: string;
};

/**
 * Validasi data pengguna dipisahkan dari operasi database.
 */
const validasiPengguna = (body: unknown) => {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {
      errors: ["Body harus berupa object JSON"],
      data: undefined,
    };
  }

  const input = body as Record<string, unknown>;

  const nim = input.nim;
  const nama = input.nama;
  const email = input.email;
  const role = input.role;

  if (typeof nim !== "string" || nim.trim() === "") {
    errors.push("NIM wajib diisi dan harus berupa string");
  }

  if (typeof nama !== "string" || nama.trim() === "") {
    errors.push("Nama wajib diisi dan harus berupa string");
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push("Email wajib diisi dengan format yang valid");
  }

  if (
    role !== undefined &&
    (typeof role !== "string" || role.trim() === "")
  ) {
    errors.push("Role harus berupa string dan tidak boleh kosong");
  }

  if (errors.length > 0) {
    return { errors, data: undefined };
  }

  const data: DataPengguna = {
    nim: (nim as string).trim(),
    nama: (nama as string).trim(),
    email: (email as string).trim(),
  };

  if (typeof role === "string") {
    data.role = role.trim();
  }

  return { errors, data };
};

// ================================================================
// ROUTES — Mengelompokkan endpoint pengguna
// ================================================================

const penggunaRoutes = express.Router();

/**
 * GET /pengguna
 * GET /pengguna?nim=240160221022
 */
penggunaRoutes.get(
  "/",
  async (request: Request, response: Response) => {
    try {
      const nimRaw = request.query.nim;
      const nimFilter =
        typeof nimRaw === "string" ? nimRaw.trim() : undefined;

      const data = await ambilDaftarPengguna(nimFilter);

      return response.status(200).json({
        success: true,
        message: "Daftar pengguna berhasil diambil",
        data,
      });
    } catch (error) {
      console.error(error);

      return response.status(500).json({
        success: false,
        message: "Gagal mengambil daftar pengguna",
      });
    }
  },
);

/**
 * TODO 3:
 * POST /pengguna
 */
penggunaRoutes.post(
  "/",
  async (request: Request, response: Response) => {
    try {
      const hasilValidasi = validasiPengguna(request.body);

      if (hasilValidasi.errors.length > 0) {
        return response.status(400).json({
          success: false,
          message: "Data pengguna tidak valid",
          details: hasilValidasi.errors,
        });
      }

      const data = hasilValidasi.data;

      if (!data) {
        return response.status(400).json({
          success: false,
          message: "Data pengguna tidak valid",
        });
      }

      const penggunaBaru = await buatPengguna(data);

      return response.status(201).json({
        success: true,
        message: "Pengguna berhasil ditambahkan",
        data: penggunaBaru,
      });
    } catch (error) {
      console.error(error);

      return response.status(500).json({
        success: false,
        message: "Gagal menambahkan pengguna. Periksa NIM atau email.",
      });
    }
  },
);

/**
 * TODO 4:
 * DELETE /pengguna/:nim
 */
penggunaRoutes.delete(
  "/:nim",
  async (request: Request, response: Response) => {
    try {
      const nimRaw = request.params.nim;

      if (typeof nimRaw !== "string" || nimRaw.trim() === "") {
        return response.status(400).json({
          success: false,
          message: "Parameter NIM tidak valid",
        });
      }

      const hasil = await hapusPengguna(nimRaw.trim());

      if (hasil.count === 0) {
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
  },
);

// ================================================================
// APP — Menyusun middleware dan routes
// ================================================================

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

// Handler endpoint tidak ditemukan
app.use((_request: Request, response: Response) => {
  return response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// ================================================================
// SERVER — Menjalankan aplikasi
// ================================================================

const port = Number(process.env.PORT_LATIHAN ?? 3009);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(
    `API Latihan Pengguna berjalan di http://localhost:${port}`,
  );
});
