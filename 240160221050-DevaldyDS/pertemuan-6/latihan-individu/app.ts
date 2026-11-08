import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";

import { prisma } from "./client.ts";

const app = express();

// Konfigurasi dasar Express
app.disable("x-powered-by");
app.use(express.json());

// Helper response sukses
const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  });
};

// Helper response error
const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  details?: unknown,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
  });
};

// Middleware logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Endpoint utama
app.get("/", (req: Request, res: Response) => {
  return sendSuccess(res, 200, "API Pengguna berjalan", {
    endpoints: [
      "GET /pengguna/:nim",
      "POST /pengguna",
      "PATCH /pengguna/:nim",
      "DELETE /pengguna/:nim",
    ],
  });
});

// Endpoint health check
app.get("/health", (req: Request, res: Response) => {
  return sendSuccess(res, 200, "Server dalam keadaan sehat");
});

// ========================================
// GET /pengguna/:nim
// Mengambil data pengguna berdasarkan NIM
// ========================================
app.get(
  "/pengguna/:nim",
  async (req: Request<{ nim: string }>, res: Response) => {
    try {
      const nim = req.params.nim;

      const pengguna = await prisma.pengguna.findUnique({
        where: { nim },
      });

      if (!pengguna) {
        return sendError(res, 404, "Pengguna tidak ditemukan");
      }

      return sendSuccess(
        res,
        200,
        "Data pengguna berhasil ditemukan",
        pengguna,
      );
    } catch (error) {
      console.error(error);
      return sendError(res, 500, "Terjadi kesalahan pada server");
    }
  },
);

// ========================================
// POST /pengguna
// Menambahkan pengguna baru
// ========================================
app.post("/pengguna", async (req: Request, res: Response) => {
  try {
    const { nim, nama, email, role } = req.body as Record<string, unknown>;

    // Validasi input
    if (
      typeof nim !== "string" ||
      !nim.trim() ||
      typeof nama !== "string" ||
      !nama.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof role !== "string" ||
      !role.trim()
    ) {
      return sendError(
        res,
        400,
        "NIM, nama, email, dan role wajib diisi dengan benar",
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return sendError(res, 400, "Format email tidak valid");
    }

    // Simpan ke database
    const pengguna = await prisma.pengguna.create({
      data: {
        nim: nim.trim(),
        nama: nama.trim(),
        email: email.trim(),
        role: role.trim(),
      },
    });

    return sendSuccess(res, 201, "Pengguna berhasil ditambahkan", pengguna);
  } catch (error) {
    console.error(error);
    return sendError(
      res,
      500,
      "Gagal menambahkan pengguna. Pastikan NIM belum digunakan.",
    );
  }
});

// ========================================
// PATCH /pengguna/:nim
// Mengubah data pengguna
// ========================================
app.patch(
  "/pengguna/:nim",
  async (req: Request<{ nim: string }>, res: Response) => {
    try {
      const nim = req.params.nim;
      const { nama, email, role } = req.body as Record<string, unknown>;

      // Periksa apakah pengguna tersedia
      const pengguna = await prisma.pengguna.findUnique({
        where: { nim },
      });

      if (!pengguna) {
        return sendError(res, 404, "Pengguna tidak ditemukan");
      }

      // Periksa apakah ada data yang dikirim
      if (nama === undefined && email === undefined && role === undefined) {
        return sendError(res, 400, "Tidak ada data yang diubah");
      }

      // Validasi nama
      if (nama !== undefined && (typeof nama !== "string" || !nama.trim())) {
        return sendError(res, 400, "Nama tidak boleh kosong");
      }

      // Validasi email
      if (email !== undefined) {
        if (
          typeof email !== "string" ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
          return sendError(res, 400, "Format email tidak valid");
        }
      }

      // Validasi role
      if (role !== undefined && (typeof role !== "string" || !role.trim())) {
        return sendError(res, 400, "Role tidak boleh kosong");
      }

      // Update data
      const updatedPengguna = await prisma.pengguna.update({
        where: { nim },
        data: {
          ...(nama !== undefined ? { nama: (nama as string).trim() } : {}),
          ...(email !== undefined ? { email: (email as string).trim() } : {}),
          ...(role !== undefined ? { role: (role as string).trim() } : {}),
        },
      });

      return sendSuccess(
        res,
        200,
        "Data pengguna berhasil diperbarui",
        updatedPengguna,
      );
    } catch (error) {
      console.error(error);
      return sendError(res, 500, "Gagal memperbarui data pengguna");
    }
  },
);

// ========================================
// DELETE /pengguna/:nim
// Menghapus pengguna berdasarkan NIM
// ========================================
app.delete(
  "/pengguna/:nim",
  async (req: Request<{ nim: string }>, res: Response) => {
    try {
      const nim = req.params.nim;

      // Periksa apakah pengguna tersedia
      const pengguna = await prisma.pengguna.findUnique({
        where: { nim },
      });

      if (!pengguna) {
        return sendError(res, 404, "Pengguna tidak ditemukan");
      }

      // Hapus data pengguna
      await prisma.pengguna.delete({
        where: { nim },
      });

      // Status 204: berhasil, tanpa response body
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return sendError(res, 500, "Gagal menghapus pengguna");
    }
  },
);

// ========================================
// 404 - Endpoint tidak ditemukan
// ========================================
app.use((req: Request, res: Response) => {
  return sendError(res, 404, "Endpoint tidak ditemukan");
});

// ========================================
// Error handler
// ========================================
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  return sendError(res, 500, "Terjadi kesalahan internal server");
});

export { app, prisma };
