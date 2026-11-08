
/**
 * Pertemuan 6 — Latihan Resource Pengguna dengan Prisma
 * Endpoint: GET, POST, PATCH, DELETE
 */

import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

const sendSuccess = (
  response: Response,
  statusCode: number,
  message: string,
  data: unknown
) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (
  response: Response,
  statusCode: number,
  message: string,
  details?: unknown
) => {
  return response.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
  });
};

// GET semua pengguna
app.get("/pengguna", async (_request: Request, response: Response) => {
  try {
    const data = await prisma.pengguna.findMany({
      orderBy: { nim: "asc" },
    });

    return sendSuccess(response, 200, "Data pengguna berhasil diambil", {
      total: data.length,
      data,
    });
  } catch (error) {
    return sendError(response, 500, "Gagal mengambil data pengguna", error);
  }
});

// GET pengguna berdasarkan NIM
app.get("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = String(request.params.nim);

    const data = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!data) {
      return sendError(response, 404, "Data pengguna tidak ditemukan");
    }

    return sendSuccess(response, 200, "Data pengguna berhasil ditemukan", data);
  } catch (error) {
    return sendError(response, 500, "Gagal mengambil data pengguna", error);
  }
});

// POST menambahkan pengguna
app.post("/pengguna", async (request: Request, response: Response) => {
  try {
    const { nim, nama, email, role } = request.body ?? {};

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
        response,
        400,
        "NIM, nama, email, dan role wajib diisi dengan teks"
      );
    }

    const data = await prisma.pengguna.create({
      data: {
        nim: nim.trim(),
        nama: nama.trim(),
        email: email.trim(),
        role: role.trim(),
      },
    });

    return sendSuccess(response, 201, "Data pengguna berhasil ditambahkan", data);
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(response, 409, "NIM atau email sudah digunakan");
    }

    return sendError(response, 500, "Gagal menambahkan pengguna", error);
  }
});

// PATCH mengubah data pengguna
app.patch("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = String(request.params.nim);
    const { nama, email, role } = request.body ?? {};

    const dataUpdate: {
      nama?: string;
      email?: string;
      role?: string;
    } = {};

    if (nama !== undefined) {
      if (typeof nama !== "string" || !nama.trim()) {
        return sendError(response, 400, "Nama harus berupa teks dan tidak boleh kosong");
      }
      dataUpdate.nama = nama.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return sendError(response, 400, "Email harus berupa teks dan tidak boleh kosong");
      }
      dataUpdate.email = email.trim();
    }

    if (role !== undefined) {
      if (typeof role !== "string" || !role.trim()) {
        return sendError(response, 400, "Role harus berupa teks dan tidak boleh kosong");
      }
      dataUpdate.role = role.trim();
    }

    if (Object.keys(dataUpdate).length === 0) {
      return sendError(response, 400, "Masukkan minimal satu data yang ingin diubah");
    }

    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return sendError(response, 404, "Data pengguna tidak ditemukan");
    }

    const data = await prisma.pengguna.update({
      where: { nim },
      data: dataUpdate,
    });

    return sendSuccess(response, 200, "Data pengguna berhasil diperbarui", data);
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(response, 409, "Email sudah digunakan");
    }

    return sendError(response, 500, "Gagal memperbarui data pengguna", error);
  }
});

// DELETE menghapus pengguna
app.delete("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = String(request.params.nim);

    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return sendError(response, 404, "Data pengguna tidak ditemukan");
    }

    await prisma.pengguna.delete({
      where: { nim },
    });

    return response.status(204).send();
  } catch (error) {
    return sendError(response, 500, "Gagal menghapus data pengguna", error);
  }
});

// Menjalankan server
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
