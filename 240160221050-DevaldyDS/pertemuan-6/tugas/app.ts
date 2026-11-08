import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";

import { prisma } from "./client.ts";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Response sukses
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

// Response error
const sendError = (res: Response, statusCode: number, message: string) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// Middleware logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// GET collection: mengambil semua pengguna
app.get("/pengguna", async (req: Request, res: Response) => {
  try {
    const pengguna = await prisma.pengguna.findMany();

    return sendSuccess(
      res,
      200,
      "Data seluruh pengguna berhasil diambil",
      pengguna,
    );
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Gagal mengambil data pengguna");
  }
});

// GET detail: mengambil pengguna berdasarkan NIM
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
      return sendError(res, 500, "Gagal mengambil detail pengguna");
    }
  },
);

// POST: menambahkan pengguna baru
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
      return sendError(res, 400, "NIM, nama, email, dan role wajib diisi");
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return sendError(res, 400, "Format email tidak valid");
    }

    // Menyimpan data ke database
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
      "Gagal menambahkan pengguna. NIM mungkin sudah terdaftar.",
    );
  }
});

// PATCH: memperbarui data pengguna
app.patch(
  "/pengguna/:nim",
  async (req: Request<{ nim: string }>, res: Response) => {
    try {
      const nim = req.params.nim;
      const { nama, email, role } = req.body as Record<string, unknown>;

      // Memeriksa data pengguna
      const pengguna = await prisma.pengguna.findUnique({
        where: { nim },
      });

      if (!pengguna) {
        return sendError(res, 404, "Pengguna tidak ditemukan");
      }

      // Memeriksa data yang akan diperbarui
      if (nama === undefined && email === undefined && role === undefined) {
        return sendError(res, 400, "Tidak ada data yang diperbarui");
      }

      if (nama !== undefined && (typeof nama !== "string" || !nama.trim())) {
        return sendError(res, 400, "Nama tidak boleh kosong");
      }

      if (
        email !== undefined &&
        (typeof email !== "string" ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      ) {
        return sendError(res, 400, "Format email tidak valid");
      }

      if (role !== undefined && (typeof role !== "string" || !role.trim())) {
        return sendError(res, 400, "Role tidak boleh kosong");
      }

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

// Endpoint utama
app.get("/", (req: Request, res: Response) => {
  return sendSuccess(res, 200, "REST API Pengguna berjalan", {
    endpoints: [
      "GET /pengguna",
      "GET /pengguna/:nim",
      "POST /pengguna",
      "PATCH /pengguna/:nim",
    ],
  });
});

// Endpoint tidak ditemukan
app.use((req: Request, res: Response) => {
  return sendError(res, 404, "Endpoint tidak ditemukan");
});

// Error handler
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  return sendError(res, 500, "Terjadi kesalahan internal server");
});

export { app, prisma };
