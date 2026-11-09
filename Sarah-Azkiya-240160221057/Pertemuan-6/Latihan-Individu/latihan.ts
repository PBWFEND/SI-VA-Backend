/**
 * Pertemuan 6 — Latihan Individu: Resource Pengguna dengan Prisma ORM
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 *
 * Mengimplementasikan:
 * 1. GET /pengguna — mengambil semua data pengguna
 * 2. GET /pengguna/:nim — mengambil detail pengguna berdasarkan NIM (404 jika tidak ditemukan)
 * 3. POST /pengguna — menambahkan pengguna baru dengan validasi nim, nama, email, role (201 jika berhasil)
 * 4. PATCH /pengguna/:nim — memperbarui nama, email, atau role pengguna (200 jika berhasil)
 * 5. DELETE /pengguna/:nim — menghapus pengguna berdasarkan NIM (204 jika berhasil)
 */

import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./client.ts";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

const sendSuccess = (response: Response, statusCode: number, message: string, data: unknown) => {
  return response.status(statusCode).json({ success: true, message, data });
};

const sendError = (response: Response, statusCode: number, message: string, details?: unknown) => {
  return response.status(statusCode).json({ success: false, message, ...(details ? { details } : {}) });
};

// GET /pengguna — Ambil semua data pengguna
app.get("/pengguna", async (_request: Request, response: Response) => {
  try {
    const data = await prisma.pengguna.findMany({ orderBy: { nim: "asc" } });
    return sendSuccess(response, 200, "Data pengguna berhasil diambil", {
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Error get pengguna:", error);
    return sendError(response, 500, "Terjadi kesalahan pada server saat mengambil data pengguna");
  }
});

// GET /pengguna/:nim — Ambil detail pengguna berdasarkan NIM (404 jika tidak ditemukan)
app.get("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = request.params.nim;

    if (!nim || typeof nim !== "string" || !nim.trim()) {
      return sendError(response, 400, "Parameter NIM tidak valid");
    }

    const cleanNim = nim.trim();
    const data = await prisma.pengguna.findUnique({
      where: { nim: cleanNim },
    });

    if (!data) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    return sendSuccess(response, 200, "Detail pengguna berhasil diambil", data);
  } catch (error) {
    console.error("Error get detail pengguna:", error);
    return sendError(response, 500, "Terjadi kesalahan pada server");
  }
});

// POST /pengguna — Menambahkan pengguna dengan validasi nim, nama, email, role
app.post("/pengguna", async (request: Request, response: Response) => {
  try {
    const { nim, nama, email, role } = request.body ?? {};

    const errors: string[] = [];

    if (typeof nim !== "string" || !nim.trim()) {
      errors.push("NIM wajib diisi dengan teks tidak kosong");
    }
    if (typeof nama !== "string" || !nama.trim()) {
      errors.push("Nama wajib diisi dengan teks tidak kosong");
    }
    if (typeof email !== "string" || !email.trim()) {
      errors.push("Email wajib diisi");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push("Format email tidak valid (contoh: user@mail.com)");
      }
    }
    if (typeof role !== "string" || !role.trim()) {
      errors.push("Role wajib diisi dengan teks tidak kosong (contoh: mahasiswa, dosen, pustakawan)");
    }

    if (errors.length > 0) {
      return sendError(response, 400, "Validasi data pengguna gagal", errors);
    }

    const cleanNim = String(nim).trim();
    const cleanNama = String(nama).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanRole = String(role).trim();

    // Periksa apakah NIM atau email sudah terdaftar
    const existing = await prisma.pengguna.findFirst({
      where: {
        OR: [{ nim: cleanNim }, { email: cleanEmail }],
      },
    });

    if (existing) {
      const duplicateField = existing.nim === cleanNim ? "NIM" : "Email";
      return sendError(response, 409, `${duplicateField} sudah terdaftar dalam sistem`);
    }

    const data = await prisma.pengguna.create({
      data: {
        nim: cleanNim,
        nama: cleanNama,
        email: cleanEmail,
        role: cleanRole,
      },
    });

    return sendSuccess(response, 201, "Pengguna berhasil ditambahkan", data);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return sendError(response, 409, "NIM atau email sudah terdaftar");
    }
    console.error("Error create pengguna:", error);
    return sendError(response, 500, "Terjadi kesalahan pada server saat menambahkan pengguna");
  }
});

// PATCH /pengguna/:nim — Memperbarui nama, email, atau role pengguna
app.patch("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = request.params.nim;

    if (!nim || typeof nim !== "string" || !nim.trim()) {
      return sendError(response, 400, "Parameter NIM tidak valid");
    }

    const cleanNim = nim.trim();
    const body = request.body ?? {};
    const dataUpdate: { nama?: string; email?: string; role?: string } = {};
    const errors: string[] = [];

    if (Object.hasOwn(body, "nama")) {
      if (typeof body.nama !== "string" || !body.nama.trim()) {
        errors.push("Nama harus berupa teks dan tidak boleh kosong");
      } else {
        dataUpdate.nama = body.nama.trim();
      }
    }

    if (Object.hasOwn(body, "email")) {
      if (typeof body.email !== "string" || !body.email.trim()) {
        errors.push("Email harus berupa teks dan tidak boleh kosong");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email.trim())) {
          errors.push("Format email tidak valid");
        } else {
          dataUpdate.email = body.email.trim().toLowerCase();
        }
      }
    }

    if (Object.hasOwn(body, "role")) {
      if (typeof body.role !== "string" || !body.role.trim()) {
        errors.push("Role harus berupa teks dan tidak boleh kosong");
      } else {
        dataUpdate.role = body.role.trim();
      }
    }

    if (errors.length > 0) {
      return sendError(response, 400, "Validasi pembaruan gagal", errors);
    }

    if (Object.keys(dataUpdate).length === 0) {
      return sendError(response, 400, "Isi minimal satu field untuk diperbarui: nama, email, atau role");
    }

    // Cari pengguna terlebih dahulu
    const pengguna = await prisma.pengguna.findUnique({
      where: { nim: cleanNim },
    });

    if (!pengguna) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    // Bila email diubah, pastikan tidak konflik dengan pengguna lain
    if (dataUpdate.email && dataUpdate.email !== pengguna.email) {
      const emailConflict = await prisma.pengguna.findUnique({
        where: { email: dataUpdate.email },
      });
      if (emailConflict) {
        return sendError(response, 409, "Email sudah terdaftar oleh pengguna lain");
      }
    }

    const data = await prisma.pengguna.update({
      where: { nim: cleanNim },
      data: dataUpdate,
    });

    return sendSuccess(response, 200, "Data pengguna berhasil diperbarui", data);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return sendError(response, 409, "Email sudah terdaftar");
    }
    console.error("Error update pengguna:", error);
    return sendError(response, 500, "Terjadi kesalahan pada server saat memperbarui pengguna");
  }
});

// DELETE /pengguna/:nim — Menghapus pengguna dengan response 204
app.delete("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = request.params.nim;

    if (!nim || typeof nim !== "string" || !nim.trim()) {
      return sendError(response, 400, "Parameter NIM tidak valid");
    }

    const cleanNim = nim.trim();
    const pengguna = await prisma.pengguna.findUnique({
      where: { nim: cleanNim },
    });

    if (!pengguna) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    await prisma.pengguna.delete({
      where: { nim: cleanNim },
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error delete pengguna:", error);
    return sendError(response, 500, "Terjadi kesalahan pada server saat menghapus pengguna");
  }
});

// Middleware 404 jika route tidak ditemukan
app.use((_request: Request, response: Response) => {
  return sendError(response, 404, "Endpoint tidak ditemukan pada Latihan Individu");
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
    return sendError(res, 400, "Format JSON tidak valid");
  }

  console.error("Unhandled error:", err);
  return sendError(res, 500, "Terjadi kesalahan server internal");
});

const port = Number(process.env.PORT_LATIHAN ?? 3009);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Hanya jalankan listener jika file dieksekusi secara langsung
if (process.argv[1]?.endsWith("latihan.ts") || process.argv[1]?.endsWith("latihan.js")) {
  app.listen(port, () => {
    console.log(`Latihan Individu berjalan di http://localhost:${port}`);
  });
}

export { app };
export default app;

