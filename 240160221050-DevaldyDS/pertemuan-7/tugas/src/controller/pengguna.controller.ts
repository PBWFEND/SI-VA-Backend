import type { Request, Response, NextFunction } from "express";

import {
  getAllPengguna,
  getPenggunaByNim,
  createPengguna,
  updatePengguna,
  deletePengguna,
} from "../service/pengguna.service.ts";

// GET: Daftar seluruh pengguna
export const getDaftarPengguna = async (
  _request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllPengguna();

    return response.status(200).json({
      success: true,
      message: "Berhasil mengambil data pengguna",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET: Detail pengguna berdasarkan NIM
export const getDetailPengguna = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { nim } = request.params;

    if (typeof nim !== "string" || nim.trim() === "") {
      return response.status(400).json({
        success: false,
        message: "NIM tidak valid",
      });
    }

    const data = await getPenggunaByNim(nim);

    if (!data) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Detail pengguna berhasil ditemukan",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// POST: Membuat pengguna baru
export const postPengguna = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const body: unknown = request.body;

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return response.status(400).json({
        success: false,
        message: "Body harus berupa object",
      });
    }

    const { nim, nama, email, role } = body as Record<string, unknown>;

    if (
      typeof nim !== "string" ||
      nim.trim() === "" ||
      typeof nama !== "string" ||
      nama.trim() === "" ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      (role !== undefined && typeof role !== "string")
    ) {
      return response.status(400).json({
        success: false,
        message: "Data pengguna tidak valid",
      });
    }

    const data = await createPengguna({
      nim: nim.trim(),
      nama: nama.trim(),
      email: email.trim(),
      role:
        typeof role === "string" && role.trim() !== ""
          ? role.trim()
          : "mahasiswa",
    });

    return response.status(201).json({
      success: true,
      message: "Pengguna berhasil ditambahkan",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH: Memperbarui data pengguna
export const patchPengguna = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { nim } = request.params;
    const body: unknown = request.body;

    if (typeof nim !== "string" || nim.trim() === "") {
      return response.status(400).json({
        success: false,
        message: "NIM tidak valid",
      });
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return response.status(400).json({
        success: false,
        message: "Body harus berupa object",
      });
    }

    const { nama, email, role } = body as Record<string, unknown>;

    if (
      (nama !== undefined &&
        (typeof nama !== "string" || nama.trim() === "")) ||
      (email !== undefined &&
        (typeof email !== "string" ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) ||
      (role !== undefined && (typeof role !== "string" || role.trim() === ""))
    ) {
      return response.status(400).json({
        success: false,
        message: "Data pembaruan tidak valid",
      });
    }

    if (nama === undefined && email === undefined && role === undefined) {
      return response.status(400).json({
        success: false,
        message: "Minimal satu field harus diperbarui",
      });
    }

    const pengguna = await getPenggunaByNim(nim);

    if (!pengguna) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    const data = await updatePengguna(nim, {
      ...(typeof nama === "string" && { nama: nama.trim() }),
      ...(typeof email === "string" && { email: email.trim() }),
      ...(typeof role === "string" && { role: role.trim() }),
    });

    return response.status(200).json({
      success: true,
      message: "Pengguna berhasil diperbarui",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE: Menghapus pengguna
export const hapusPengguna = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { nim } = request.params;

    if (typeof nim !== "string" || nim.trim() === "") {
      return response.status(400).json({
        success: false,
        message: "NIM tidak valid",
      });
    }

    const pengguna = await getPenggunaByNim(nim);

    if (!pengguna) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    await deletePengguna(nim);

    return response.status(204).send();
  } catch (error) {
    next(error);
  }
};
