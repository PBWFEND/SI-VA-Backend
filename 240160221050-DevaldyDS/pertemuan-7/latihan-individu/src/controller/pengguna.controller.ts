import type { Request, Response } from "express";

import {
  ambilDaftarPengguna,
  ambilPenggunaByNim,
  buatPengguna,
  hapusPengguna,
} from "../service/pengguna.service.ts";

// GET /pengguna — mengambil daftar pengguna
export const getDaftarPengguna = async (
  request: Request,
  response: Response,
) => {
  try {
    const nimRaw = request.query.nim;
    const nim = typeof nimRaw === "string" ? nimRaw : undefined;

    const data = await ambilDaftarPengguna(nim);

    return response.status(200).json({
      success: true,
      message: "Daftar pengguna berhasil diambil",
      data,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pengguna",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// POST /pengguna — menambahkan pengguna baru
export const postPengguna = async (request: Request, response: Response) => {
  const body = request.body;
  const errors: string[] = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    errors.push("Body harus berupa objek JSON");
  } else {
    if (typeof body.nim !== "string" || body.nim.trim() === "") {
      errors.push("NIM wajib diisi");
    }

    if (typeof body.nama !== "string" || body.nama.trim() === "") {
      errors.push("Nama wajib diisi");
    }

    if (
      typeof body.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
    ) {
      errors.push("Email tidak valid");
    }

    if (
      body.role !== undefined &&
      (typeof body.role !== "string" || body.role.trim() === "")
    ) {
      errors.push("Role harus berupa string dan tidak boleh kosong");
    }
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors,
    });
  }

  try {
    const data = await buatPengguna(body);

    return response.status(201).json({
      success: true,
      message: "Pengguna berhasil dibuat",
      data,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Gagal membuat pengguna",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// DELETE /pengguna/:nim — menghapus pengguna
export const deletePengguna = async (request: Request, response: Response) => {
  const nim = request.params.nim;

  if (typeof nim !== "string" || nim.trim() === "") {
    return response.status(400).json({
      success: false,
      message: "NIM tidak valid",
    });
  }

  try {
    const pengguna = await ambilPenggunaByNim(nim);

    if (!pengguna) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    await hapusPengguna(nim);

    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Gagal menghapus pengguna",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
