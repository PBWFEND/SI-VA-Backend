import type { Request, Response, NextFunction } from "express";
import {
  penggunaService,
  NotFoundError,
  ConflictError,
  type CreatePenggunaDTO,
} from "../service/pengguna.service.ts";

/**
 * Controller untuk mengambil daftar pengguna dengan opsi filter NIM.
 * GET /pengguna
 */
export const ambilDaftar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nimRaw = req.query.nim;
    const nimFilter =
      typeof nimRaw === "string" && nimRaw.trim() !== ""
        ? nimRaw.trim()
        : undefined;

    const data = await penggunaService.ambilDaftarPengguna(nimFilter);

    return res.status(200).json({
      success: true,
      message: "Daftar pengguna",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk mengambil detail pengguna berdasarkan NIM.
 * GET /pengguna/:nim
 */
export const ambilDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nim } = req.params;

    if (!nim || typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Parameter NIM tidak valid",
      });
    }

    const data = await penggunaService.ambilPenggunaBerdasarkanNim(nim.trim());

    return res.status(200).json({
      success: true,
      message: "Detail pengguna",
      data,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Controller untuk membuat pengguna baru.
 * Memisahkan validasi input dari logika database.
 * TODO 2 & TODO 3: POST /pengguna dengan validasi input dan status HTTP 201.
 */
export const buatPenggunaBaru = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body ?? {};
    const { nim, nama, email, role } = body;

    // Validasi field wajib
    if (
      typeof nim !== "string" ||
      !nim.trim() ||
      typeof nama !== "string" ||
      !nama.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "NIM, nama, dan email wajib diisi dengan teks yang valid",
      });
    }

    // Validasi format email
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    // Validasi role opsional
    let validatedRole: string | undefined = undefined;
    if (role !== undefined) {
      if (typeof role !== "string" || !role.trim()) {
        return res.status(400).json({
          success: false,
          message: "Role harus berupa teks dan tidak boleh kosong jika disertakan",
        });
      }
      validatedRole = role.trim();
    }

    const dto: CreatePenggunaDTO = {
      nim: nim.trim(),
      nama: nama.trim(),
      email: trimmedEmail,
      ...(validatedRole ? { role: validatedRole } : {}),
    };

    const data = await penggunaService.buatPengguna(dto);

    return res.status(201).json({
      success: true,
      message: "Pengguna berhasil ditambahkan",
      data,
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Controller untuk menghapus pengguna berdasarkan NIM.
 * TODO 4: DELETE /pengguna/:nim mengembalikan 204 jika berhasil dan 404 jika tidak ditemukan.
 */
export const hapusPenggunaByNim = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nim } = req.params;

    if (!nim || typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Parameter NIM tidak valid",
      });
    }

    await penggunaService.hapusPengguna(nim.trim());

    return res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const penggunaController = {
  ambilDaftar,
  ambilDetail,
  buatPenggunaBaru,
  hapusPenggunaByNim,
};

export default penggunaController;

