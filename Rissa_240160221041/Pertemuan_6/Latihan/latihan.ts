/**
 * Pertemuan 6 — latihan resource Pengguna dengan Prisma
 * Tujuan: menerapkan operasi create, update, dan delete pada model pengguna.
 * Jalankan: npx prisma migrate dev --name pengguna lalu node --experimental-strip-types latihan.ts
 */

import express, { type Request, type Response } from "express";
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const app = express();
app.disable("x-powered-by");
app.use(express.json());

const sendSuccess = (response: Response, statusCode: number, message: string, data: unknown) => {
  return response.status(statusCode).json({ success: true, message, data });
};

const sendError = (response: Response, statusCode: number, message: string, details?: unknown) => {
  return response.status(statusCode).json({ 
    success: false, 
    message, 
    ...(details !== undefined ? { details } : {}) 
  });
};

// GET /pengguna (Get All)
app.get("/pengguna", async (_request: Request, response: Response) => {
  try {
    const data = await prisma.pengguna.findMany({ orderBy: { nim: "asc" } });
    return sendSuccess(response, 200, "Data pengguna berhasil diambil", { total: data.length, data });
  } catch (error) {
    return sendError(response, 500, "Gagal mengambil data pengguna", error);
  }
});

// TODO 1: GET /pengguna/:nim (Detail dengan status 404 jika tidak ditemukan)
app.get("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const { nim } = request.params;
    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    return sendSuccess(response, 200, "Detail pengguna berhasil diambil", pengguna);
  } catch (error) {
    return sendError(response, 500, "Terjadi kesalahan pada server", error);
  }
});

// TODO 2: POST /pengguna (Validasi nim, nama, email, dan role)
app.post("/pengguna", async (request: Request, response: Response) => {
  try {
    const { nim, nama, email, role } = request.body;

    if (!nim || !nama || !email || !role) {
      return sendError(response, 400, "Atribut nim, nama, email, dan role wajib diisi");
    }

    // Cek ketersediaan NIM atau Email agar tidak terjadi constraint error
    const existingUser = await prisma.pengguna.findFirst({
      where: { OR: [{ nim }, { email }] },
    });

    if (existingUser) {
      return sendError(response, 400, "NIM atau Email sudah terdaftar");
    }

    const penggunaBaru = await prisma.pengguna.create({
      data: { nim, nama, email, role },
    });

    return sendSuccess(response, 201, "Pengguna berhasil ditambahkan", penggunaBaru);
  } catch (error) {
    return sendError(response, 500, "Gagal menambahkan pengguna", error);
  }
});

// TODO 3: PATCH /pengguna/:nim (Mengubah nama, email, atau role)
app.patch("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const { nim } = request.params;
    const { nama, email, role } = request.body;

    // Cek ketersediaan pengguna
    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    if (!nama && !email && !role) {
      return sendError(response, 400, "Setidaknya kirim satu atribut yang ingin diperbarui");
    }

    const penggunaUpdated = await prisma.pengguna.update({
      where: { nim },
      data: {
        ...(nama && { nama }),
        ...(email && { email }),
        ...(role && { role }),
      },
    });

    return sendSuccess(response, 200, "Data pengguna berhasil diperbarui", penggunaUpdated);
  } catch (error) {
    return sendError(response, 500, "Gagal memperbarui data pengguna", error);
  }
});

// TODO 4: DELETE /pengguna/:nim (Response 204)
app.delete("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const { nim } = request.params;

    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    await prisma.pengguna.delete({
      where: { nim },
    });

    return response.status(204).send();
  } catch (error) {
    return sendError(response, 500, "Gagal menghapus pengguna", error);
  }
});

const port = Number(process.env.PORT_LATIHAN ?? 3009);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`Latihan Database API berjalan di http://localhost:${port}`);
});