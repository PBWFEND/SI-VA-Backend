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

app.get("/pengguna", async (_request: Request, response: Response) => {
  const data = await prisma.pengguna.findMany({ orderBy: { nim: "asc" } });
  return sendSuccess(response, 200, "Data pengguna berhasil diambil", { total: data.length, data });
});

// TODO 1: tambahkan endpoint GET /pengguna/:nim dengan status 404 jika tidak ditemukan.

app.get("/pengguna/:nim", async (request: Request, response: Response) => {
  const nim = request.params.nim;

if (typeof nim !== "string") {
  return sendError(response, 400, "Parameter NIM tidak valid");
}

  const data = await prisma.pengguna.findUnique({
    where: { nim },
  });

  if (!data) {
    return sendError(response, 404, "Pengguna tidak ditemukan");
  }

  return sendSuccess(response, 200, "Data pengguna berhasil diambil", data);
});

// TODO 2: tambahkan endpoint POST /pengguna dengan validasi nim, nama, email, dan role.

app.post("/pengguna", async (request: Request, response: Response) => {
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
      "NIM, nama, email, dan role wajib diisi dengan teks yang valid"
    );
  }

  const normalizedNim = nim.trim();
  const normalizedNama = nama.trim();
  const normalizedEmail = email.trim();
  const normalizedRole = role.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return sendError(response, 400, "Format email tidak valid");
  }

  try {
    const data = await prisma.pengguna.create({
      data: {
        nim: normalizedNim,
        nama: normalizedNama,
        email: normalizedEmail,
        role: normalizedRole,
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
      return sendError(response, 409, "NIM atau email sudah terdaftar");
    }

    console.error(error);
    return sendError(response, 500, "Terjadi kesalahan pada server");
  }
});

// TODO 3: tambahkan endpoint PATCH /pengguna/:nim untuk mengubah nama, email, atau role.

app.patch("/pengguna/:nim", async (request: Request, response: Response) => {
  const nim = request.params.nim;

  if (typeof nim !== "string") {
    return sendError(response, 400, "Parameter NIM tidak valid");
  }

  const body = request.body ?? {};
  const dataUpdate: { nama?: string; email?: string; role?: string } = {};

  if (Object.hasOwn(body, "nama")) {
    if (typeof body.nama !== "string" || !body.nama.trim()) {
      return sendError(response, 400, "Nama harus berupa teks dan tidak boleh kosong");
    }
    dataUpdate.nama = body.nama.trim();
  }

  if (Object.hasOwn(body, "email")) {
    if (
      typeof body.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) {
      return sendError(response, 400, "Format email tidak valid");
    }
    dataUpdate.email = body.email.trim();
  }

  if (Object.hasOwn(body, "role")) {
    if (typeof body.role !== "string" || !body.role.trim()) {
      return sendError(response, 400, "Role harus berupa teks dan tidak boleh kosong");
    }
    dataUpdate.role = body.role.trim();
  }

  if (Object.keys(dataUpdate).length === 0) {
    return sendError(response, 400, "Isi minimal satu field: nama, email, atau role");
  }

  try {
    const pengguna = await prisma.pengguna.findUnique({ where: { nim } });

    if (!pengguna) {
      return sendError(response, 404, "Pengguna tidak ditemukan");
    }

    const data = await prisma.pengguna.update({
      where: { nim },
      data: dataUpdate,
    });

    return sendSuccess(response, 200, "Data pengguna berhasil diperbarui", data);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return sendError(response, 409, "Email sudah terdaftar");
    }

    console.error(error);
    return sendError(response, 500, "Terjadi kesalahan pada server");
  }
});

// TODO 4: tambahkan endpoint DELETE /pengguna/:nim dengan response 204.

app.delete("/pengguna/:nim", async (request: Request, response: Response) => {
  const nim = request.params.nim;

  if (typeof nim !== "string") {
    return sendError(response, 400, "Parameter NIM tidak valid");
  }

  try {
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
    return sendError(response, 500, "Terjadi kesalahan pada server");
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
  console.log("Latihan Database API berjalan di http://localhost:3009");
});