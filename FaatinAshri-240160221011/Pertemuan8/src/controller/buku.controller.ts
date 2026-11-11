import type { Request, Response, NextFunction } from "express";
import {
  getAllBuku,
  getBukuById,
  createBuku,
  updateBuku,
  deleteBuku,
} from "../service/buku.service.ts";

// GET semua buku + filter
export const getBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const penulisRaw = req.query.penulis;
    const penulis =
      typeof penulisRaw === "string" ? penulisRaw.trim() : undefined;

    const minStokRaw = req.query.minStok;
    const minStok =
      typeof minStokRaw === "string" && minStokRaw.trim() !== ""
        ? Number(minStokRaw)
        : undefined;

    if (
      minStok !== undefined &&
      (!Number.isInteger(minStok) || minStok < 0)
    ) {
      res.status(400).json({
        success: false,
        message: "Parameter minStok harus berupa bilangan bulat minimal 0",
      });
      return;
    }

    const buku = await getAllBuku({
      ...(penulis !== undefined && penulis !== "" && { penulis }),
      ...(minStok !== undefined && { minStok }),
    });

    res.status(200).json({
      success: true,
      message: "Data buku berhasil diambil",
      total: buku.length,
      data: buku,
    });
  } catch (error) {
    next(error);
  }
};

// GET buku berdasarkan ID
export const getBukuDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "ID buku tidak valid",
      });
      return;
    }

    const buku = await getBukuById(id);

    if (!buku) {
      res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Detail buku berhasil diambil",
      data: buku,
    });
  } catch (error) {
    next(error);
  }
};

// POST tambah buku
export const tambahBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { judul, penulis, tahun, stok } = req.body;
    const errors: string[] = [];

    if (typeof judul !== "string" || judul.trim() === "") {
      errors.push("Field judul wajib diisi");
    }

    if (typeof penulis !== "string" || penulis.trim() === "") {
      errors.push("Field penulis wajib diisi");
    }

    if (typeof tahun !== "number" || !Number.isInteger(tahun)) {
      errors.push("Field tahun wajib berupa bilangan bulat");
    } else if (tahun < 1000 || tahun > 2100) {
      errors.push("Field tahun berada di luar rentang 1000–2100");
    }

    if (
      stok !== undefined &&
      (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0)
    ) {
      errors.push("Field stok harus bilangan bulat minimal 0");
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Data buku tidak valid",
        details: errors,
      });
      return;
    }

    const buku = await createBuku({
      judul: judul.trim(),
      penulis: penulis.trim(),
      tahun,
      stok: stok ?? 0,
    });

    res.status(201).json({
      success: true,
      message: "Buku berhasil ditambahkan",
      data: buku,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH ubah buku
export const ubahBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { judul, penulis, tahun, stok } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "ID buku tidak valid",
      });
      return;
    }

    const bukuAda = await getBukuById(id);

    if (!bukuAda) {
      res.status(404).json({
        success: false,
         message: "Buku tidak ditemukan",
       });
      return;
    }

    if (
      judul === undefined &&
      penulis === undefined &&
      tahun === undefined &&
      stok === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "Minimal satu data harus diubah",
      });
      return;
    }

    const errors: string[] = [];

    if (judul !== undefined && (typeof judul !== "string" || judul.trim() === "")) {
      errors.push("Field judul, bila dikirim, wajib berupa string tidak kosong");
    }

    if (penulis !== undefined && (typeof penulis !== "string" || penulis.trim() === "")) {
      errors.push("Field penulis, bila dikirim, wajib berupa string tidak kosong");
    }

    if (tahun !== undefined && (typeof tahun !== "number" || !Number.isInteger(tahun))) {
      errors.push("Field tahun, bila dikirim, wajib berupa bilangan bulat");
    } else if (tahun !== undefined && (tahun < 1000 || tahun > 2100)) {
      errors.push("Field tahun berada di luar rentang 1000–2100");
    }

    if (stok !== undefined && (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0)) {
      errors.push("Field stok, bila dikirim, wajib bilangan bulat minimal 0");
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Data perubahan buku tidak valid",
        details: errors,
      });
      return;
    }

    const data: {
      judul?: string;
      penulis?: string;
      tahun?: number;
      stok?: number;
    } = {};

    if (judul !== undefined) data.judul = judul.trim();
    if (penulis !== undefined) data.penulis = penulis.trim();
    if (tahun !== undefined) data.tahun = tahun;
    if (stok !== undefined) data.stok = stok;

    const buku = await updateBuku(id, data);

    res.status(200).json({
      success: true,
      message: "Buku berhasil diperbarui",
      data: buku,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE hapus buku
export const hapusBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "ID buku tidak valid",
      });
      return;
    }

    const bukuAda = await getBukuById(id);

    if (!bukuAda) {
      res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
      return;
    }

    await deleteBuku(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};