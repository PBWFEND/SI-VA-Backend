/**
 * Pertemuan 6 — latihan resource Pengguna dengan Prisma
 * Tujuan: menerapkan operasi create, update, dan delete pada model pengguna.
 * Jalankan: npx prisma migrate dev --name pengguna lalu node --experimental-strip-types latihan.ts
 */

import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

const sendSuccess = (response: Response, statusCode: number, message: string, data: unknown) => {
  return response.status(statusCode).json({ success: true, message, data });
};

const sendError = (response: Response, statusCode: number, message: string, details?: unknown) => {
  return response.status(statusCode).json({ success: false, message, ...(details && { details }) });
};

// 1. GET ALL: Mengambil semua data pengguna
app.get("/pengguna", async (_request: Request, response: Response) => {
  const data = await prisma.pengguna.findMany({ orderBy: { nim: "asc" } });
  return sendSuccess(response, 200, "Data pengguna berhasil diambil", { total: data.length, data });
});

// TODO 1: Endpoint GET /pengguna/:nim (Mencari 1 pengguna berdasarkan NIM)
app.get("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const { nim } = request.params;
    
    // Cari data pengguna di database berdasarkan NIM
    const pengguna = await prisma.pengguna.findFirst({
      where: { nim },
    });

    // Jika tidak ketemu, kirim status 404
    if (!pengguna) {
      return sendError(response, 404, `Pengguna dengan NIM ${nim} tidak ditemukan`);
    }

    return sendSuccess(response, 200, "Detail pengguna berhasil diambil", pengguna);
  } catch (error) {
    return sendError(response, 500, "Gagal mengambil data pengguna", error);
  }
});

// TODO 2: Endpoint POST /pengguna (Menambah data baru dengan validasi)
app.post("/pengguna", async (request: Request, response: Response) => {
  try {
    const { nim, nama, email, role } = request.body;

    // Validasi: pastikan semua field terisi
    if (!nim || !nama || !email || !role) {
      return sendError(response, 400, "Field nim, nama, email, dan role wajib diisi");
    }

    // Cek apakah NIM sudah pernah terdaftar
    const existing = await prisma.pengguna.findFirst({ where: { nim } });
    if (existing) {
      return sendError(response, 400, `Pengguna dengan NIM ${nim} sudah terdaftar`);
    }

    // Simpan ke database
    const penggunaBaru = await prisma.pengguna.create({
      data: { nim, nama, email, role },
    });

    return sendSuccess(response, 201, "Pengguna berhasil ditambahkan", penggunaBaru);
  } catch (error) {
    return sendError(response, 500, "Gagal menambahkan pengguna", error);
  }
});

// TODO 3: Endpoint PATCH /pengguna/:nim (Mengubah data pengguna)
app.patch("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const { nim } = request.params;
    const { nama, email, role } = request.body;

    // Cek apakah penggunanya ada di database
    const existing = await prisma.pengguna.findFirst({ where: { nim } });
    if (!existing) {
      return sendError(response, 404, `Pengguna dengan NIM ${nim} tidak ditemukan`);
    }

    // Update data berdasarkan ID uniknya
    const penggunaDiperbarui = await prisma.pengguna.update({
      where: { id: existing.id },
      data: {
        ...(nama && { nama }),
        ...(email && { email }),
        ...(role && { role }),
      },
    });

    return sendSuccess(response, 200, "Data pengguna berhasil diperbarui", penggunaDiperbarui);
  } catch (error) {
    return sendError(response, 500, "Gagal memperbarui pengguna", error);
  }
});

// TODO 4: Endpoint DELETE /pengguna/:nim (Menghapus data pengguna)
app.delete("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const { nim } = request.params;

    // Cek apakah pengguna ada
    const existing = await prisma.pengguna.findFirst({ where: { nim } });
    if (!existing) {
      return sendError(response, 404, `Pengguna dengan NIM ${nim} tidak ditemukan`);
    }

    // Hapus dari database
    await prisma.pengguna.delete({
      where: { id: existing.id },
    });

    // Response 204 artinya berhasil dihapus tanpa isi body
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