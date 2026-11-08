
/**
 * Pertemuan 6 — Latihan Resource Pengguna dengan Prisma
 * Operasi: GET, POST, PATCH, DELETE.
 */

import "dotenv/config";
import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

const sendSuccess = (
  response: Response,
  statusCode: number,
  message: string,
  data: unknown,
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
  details?: unknown,
) => {
  return response.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
  });
};

// GET /pengguna
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
    console.error(error);
    return sendError(response, 500, "Gagal mengambil data pengguna");
  }
});

// GET /pengguna/:nim
app.get("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = String(request.params.nim);

    const data = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!data) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    return sendSuccess(
      response,
      200,
      "Data pengguna berhasil ditemukan",
      data,
    );
  } catch (error) {
    console.error(error);
    return sendError(response, 500, "Gagal mengambil data pengguna");
  }
});

// POST /pengguna
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
      (role !== undefined &&
        (typeof role !== "string" || !role.trim()))
    ) {
      return sendError(
        response,
        400,
        "nim, nama, dan email wajib diisi; role harus berupa teks jika diberikan",
      );
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!emailValid) {
      return sendError(response, 400, "Format email tidak valid");
    }

    const data = await prisma.pengguna.create({
      data: {
        nim: nim.trim(),
        nama: nama.trim(),
        email: email.trim(),
        role: role?.trim() || "mahasiswa",
      },
    });

    return sendSuccess(response, 201, "Pengguna berhasil ditambahkan", data);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return sendError(response, 400, "NIM atau email sudah terdaftar");
    }

    console.error(error);
    return sendError(response, 500, "Gagal menambahkan pengguna");
  }
});

// PATCH /pengguna/:nim
app.patch("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = String(request.params.nim);
    const body = request.body ?? {};

    const dataUpdate: {
      nama?: string;
      email?: string;
      role?: string;
    } = {};

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return sendError(response, 400, "Body harus berupa objek JSON");
    }

    if (Object.keys(body).length === 0) {
      return sendError(response, 400, "Data perubahan wajib diisi");
    }

    if ("nama" in body) {
      if (typeof body.nama !== "string" || !body.nama.trim()) {
        return sendError(response, 400, "Nama tidak boleh kosong");
      }

      dataUpdate.nama = body.nama.trim();
    }

    if ("email" in body) {
      if (
        typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
      ) {
        return sendError(response, 400, "Format email tidak valid");
      }

      dataUpdate.email = body.email.trim();
    }

    if ("role" in body) {
      if (typeof body.role !== "string" || !body.role.trim()) {
        return sendError(response, 400, "Role tidak boleh kosong");
      }

      dataUpdate.role = body.role.trim();
    }

    if (Object.keys(dataUpdate).length === 0) {
      return sendError(
        response,
        400,
        "Field yang boleh diubah: nama, email, dan role",
      );
    }

    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    const data = await prisma.pengguna.update({
      where: { nim },
      data: dataUpdate,
    });

    return sendSuccess(
      response,
      200,
      "Data pengguna berhasil diperbarui",
      data,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return sendError(response, 400, "Email sudah digunakan pengguna lain");
    }

    console.error(error);
    return sendError(response, 500, "Gagal memperbarui data pengguna");
  }
});

// DELETE /pengguna/:nim
app.delete("/pengguna/:nim", async (request: Request, response: Response) => {
  try {
    const nim = String(request.params.nim);

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
    console.error(error);
    return sendError(response, 500, "Gagal menghapus data pengguna");
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