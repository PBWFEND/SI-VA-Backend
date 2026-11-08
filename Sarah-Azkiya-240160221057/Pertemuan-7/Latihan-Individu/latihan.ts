/**
 * Pertemuan 7 — Latihan Individu §11
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 * 
 * Menerapkan pola pemisahan tanggung jawab (Layering):
 * - Service: ambilDaftarPengguna, buatPengguna, hapusPengguna
 * - Controller: validasiPengguna & handler HTTP
 * - Routes: express.Router()
 * - App: middleware express.json(), 404 handler, error handler
 */

import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./client.ts";

// ================================================================
// SERVICE — Mengelola operasi database Prisma
// ================================================================

/**
 * TODO 1:
 * Mengambil daftar pengguna dengan filter NIM opsional.
 * Menggunakan prisma.pengguna.findMany
 */
export const ambilDaftarPengguna = async (nim?: string) => {
  return await prisma.pengguna.findMany({
    where: nim ? { nim } : {},
    orderBy: { nim: "asc" },
  });
};

/**
 * Mengambil satu data pengguna berdasarkan NIM.
 */
export const ambilPenggunaByNim = async (nim: string) => {
  return await prisma.pengguna.findUnique({
    where: { nim },
  });
};

/**
 * TODO 2:
 * Membuat pengguna baru menggunakan Prisma.
 * Operasi database dipisahkan secara murni dari logika validasi controller.
 */
export const buatPengguna = async (data: {
  nim: string;
  nama: string;
  email: string;
  role?: string;
}) => {
  return await prisma.pengguna.create({
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
  return await prisma.pengguna.delete({
    where: { nim },
  });
};

// ================================================================
// CONTROLLER — Validasi input dan response HTTP
// ================================================================

export type DataPenggunaInput = {
  nim: string;
  nama: string;
  email: string;
  role?: string;
};

/**
 * Validasi data pengguna dipisahkan dari operasi database.
 * Memeriksa tipe data, nilai kosong, dan format email secara ketat.
 */
export const validasiPengguna = (body: unknown): { errors: string[]; data?: DataPenggunaInput } => {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {
      errors: ["Request body harus berupa objek JSON yang valid"],
    };
  }

  const input = body as Record<string, unknown>;
  const { nim, nama, email, role } = input;

  if (typeof nim !== "string" || nim.trim() === "") {
    errors.push("NIM wajib diisi dan harus berupa string");
  }

  if (typeof nama !== "string" || nama.trim() === "") {
    errors.push("Nama wajib diisi dan harus berupa string");
  }

  if (typeof email !== "string" || email.trim() === "") {
    errors.push("Email wajib diisi dan harus berupa string");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Format email tidak valid (contoh: user@mail.com)");
    }
  }

  if (role !== undefined) {
    if (typeof role !== "string" || role.trim() === "") {
      errors.push("Role harus berupa string dan tidak boleh kosong");
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const cleanData: DataPenggunaInput = {
    nim: (nim as string).trim(),
    nama: (nama as string).trim(),
    email: (email as string).trim().toLowerCase(),
    role: typeof role === "string" && role.trim() ? role.trim() : "mahasiswa",
  };

  return { errors: [], data: cleanData };
};

// ================================================================
// ROUTES — Mengelompokkan endpoint pengguna
// ================================================================

const penggunaRoutes = express.Router();

/**
 * GET /pengguna
 * Mendukung filter query: GET /pengguna?nim=...
 */
penggunaRoutes.get("/", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const nimRaw = request.query.nim;
    const nimFilter = typeof nimRaw === "string" && nimRaw.trim() ? nimRaw.trim() : undefined;

    const data = await ambilDaftarPengguna(nimFilter);

    return response.status(200).json({
      success: true,
      message: "Daftar pengguna berhasil diambil",
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /pengguna/:nim
 * Mengambil detail pengguna berdasarkan parameter NIM (404 jika tidak ditemukan)
 */
penggunaRoutes.get("/:nim", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const nimRaw = request.params.nim;
    if (typeof nimRaw !== "string" || !nimRaw.trim()) {
      return response.status(400).json({
        success: false,
        message: "Parameter NIM tidak valid",
      });
    }

    const data = await ambilPenggunaByNim(nimRaw.trim());

    if (!data) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Detail pengguna berhasil diambil",
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * TODO 3:
 * POST /pengguna
 * Menambahkan data pengguna baru dengan validasi controller dan penanganan duplikasi (409).
 */
penggunaRoutes.post("/", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const hasilValidasi = validasiPengguna(request.body);

    if (hasilValidasi.errors.length > 0 || !hasilValidasi.data) {
      return response.status(400).json({
        success: false,
        message: "Data pengguna tidak valid",
        details: hasilValidasi.errors,
      });
    }

    const data = hasilValidasi.data;

    // Periksa duplikasi NIM atau Email
    const existing = await prisma.pengguna.findFirst({
      where: {
        OR: [{ nim: data.nim }, { email: data.email }],
      },
    });

    if (existing) {
      const fieldDuplikat = existing.nim === data.nim ? "NIM" : "Email";
      return response.status(409).json({
        success: false,
        message: `${fieldDuplikat} sudah terdaftar dalam sistem`,
      });
    }

    const penggunaBaru = await buatPengguna(data);

    return response.status(201).json({
      success: true,
      message: "Pengguna berhasil ditambahkan",
      data: penggunaBaru,
    });
  } catch (error: any) {
    if (typeof error === "object" && error !== null && error.code === "P2002") {
      return response.status(409).json({
        success: false,
        message: "NIM atau email sudah terdaftar dalam database",
      });
    }
    next(error);
  }
});

/**
 * TODO 4:
 * DELETE /pengguna/:nim
 * Menghapus pengguna: status 204 No Content tanpa response body jika ditemukan,
 * atau status 404 Not Found jika tidak ditemukan.
 */
penggunaRoutes.delete("/:nim", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const nimRaw = request.params.nim;

    if (typeof nimRaw !== "string" || nimRaw.trim() === "") {
      return response.status(400).json({
        success: false,
        message: "Parameter NIM tidak valid",
      });
    }

    const cleanNim = nimRaw.trim();
    const existing = await ambilPenggunaByNim(cleanNim);

    if (!existing) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    await hapusPengguna(cleanNim);

    // Status 204 No Content wajib tanpa body
    return response.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ================================================================
// APP — Menyusun middleware dan routes
// ================================================================

const app = express();
app.disable("x-powered-by");
app.use(express.json());

// Logger sederhana
app.use((request: Request, _response: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
  next();
});

app.get("/", (_request: Request, response: Response) => {
  return response.status(200).json({
    success: true,
    message: "API Latihan Individu Pertemuan 7 — Resource Pengguna",
    mahasiswa: "Sarah Azkiya",
    nim: "240160221057",
  });
});

app.use("/pengguna", penggunaRoutes);

// Handler endpoint tidak ditemukan (404)
app.use((_request: Request, response: Response) => {
  return response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Global Error Handler
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (
    err instanceof SyntaxError &&
    typeof err === "object" &&
    err !== null &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Format JSON pada body request tidak valid",
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server",
  });
});

// ================================================================
// SERVER
// ================================================================

const port = Number(process.env.PORT_LATIHAN ?? 3009);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

if (process.argv[1]?.endsWith("latihan.ts") || process.argv[1]?.endsWith("latihan.js")) {
  app.listen(port, () => {
    console.log(`API Latihan Pengguna berjalan di http://localhost:${port}`);
  });
}

export { app };
export default app;

