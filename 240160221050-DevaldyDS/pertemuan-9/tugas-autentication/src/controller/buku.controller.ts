import type { Request, Response, NextFunction } from "express";
import {
  getAllBuku,
  getBukuById,
  createBuku,
  updateBuku,
  deleteBuku,
} from "../service/buku.service.js";

// GET: Mengambil semua buku
export const getBuku = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllBuku();

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar buku",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET: Mengambil buku berdasarkan ID
export const getBukuDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa bilangan bulat positif",
      });
    }

    const data = await getBukuById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail buku",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// POST: Menambahkan buku
export const tambahBuku = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { judul, penulis, tahun, stok } = req.body ?? {};

    if (
      typeof judul !== "string" ||
      judul.trim() === "" ||
      typeof penulis !== "string" ||
      penulis.trim() === "" ||
      typeof tahun !== "number" ||
      !Number.isInteger(tahun) ||
      tahun < 1000 ||
      tahun > 2100 ||
      (stok !== undefined &&
        (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Data tidak valid. Judul dan penulis wajib diisi, tahun harus bilangan bulat 1000-2100, dan stok harus bilangan bulat minimal 0.",
      });
    }

    const data = await createBuku({
      judul: judul.trim(),
      penulis: penulis.trim(),
      tahun,
      stok,
    });

    res.status(201).json({
      success: true,
      message: "Buku berhasil ditambahkan",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH: Mengubah sebagian data buku
export const ubahBuku = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa bilangan bulat positif",
      });
    }

    const body = req.body ?? {};
    const allowedFields = ["judul", "penulis", "tahun", "stok"];
    const keys = Object.keys(body);

    if (
      typeof body !== "object" ||
      Array.isArray(body) ||
      keys.length === 0 ||
      keys.some((key) => !allowedFields.includes(key))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Data update kosong atau mengandung field yang tidak diizinkan",
      });
    }

    if (
      ("judul" in body &&
        (typeof body.judul !== "string" || body.judul.trim() === "")) ||
      ("penulis" in body &&
        (typeof body.penulis !== "string" || body.penulis.trim() === "")) ||
      ("tahun" in body &&
        (typeof body.tahun !== "number" ||
          !Number.isInteger(body.tahun) ||
          body.tahun < 1000 ||
          body.tahun > 2100)) ||
      ("stok" in body &&
        (typeof body.stok !== "number" ||
          !Number.isInteger(body.stok) ||
          body.stok < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Data update tidak valid",
      });
    }

    const buku = await getBukuById(id);

    if (!buku) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    const data = await updateBuku(id, {
      ...body,
      ...(body.judul !== undefined && { judul: body.judul.trim() }),
      ...(body.penulis !== undefined && { penulis: body.penulis.trim() }),
    });

    res.status(200).json({
      success: true,
      message: "Buku berhasil diperbarui",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE: Menghapus buku
export const hapusBuku = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa bilangan bulat positif",
      });
    }

    const buku = await getBukuById(id);

    if (!buku) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    await deleteBuku(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
