import type { Request, Response, NextFunction } from "express";
import * as bukuService from "../service/buku.service";

// Helper Response
const sendSuccess = (res: Response, statusCode: number, message: string, data?: unknown) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const handleGetAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await bukuService.getAllBuku();
    return sendSuccess(res, 200, "Berhasil mengambil daftar buku", data);
  } catch (error) {
    next(error);
  }
};

export const handleGetById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID buku tidak valid" });
    }

    const buku = await bukuService.getBukuById(id);
    if (!buku) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }

    return sendSuccess(res, 200, "Berhasil mengambil detail buku", buku);
  } catch (error) {
    next(error);
  }
};

export const handleCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { judul, penulis, kategori, stok, tahunTerbit } = req.body;

    // Validasi typeof & rentang (Constraint #5)
    if (typeof judul !== "string" || judul.trim() === "") {
      return res.status(400).json({ success: false, message: "Field 'judul' wajib bertipe string dan tidak boleh kosong" });
    }
    if (typeof penulis !== "string" || penulis.trim() === "") {
      return res.status(400).json({ success: false, message: "Field 'penulis' wajib bertipe string dan tidak boleh kosong" });
    }
    if (typeof kategori !== "string" || kategori.trim() === "") {
      return res.status(400).json({ success: false, message: "Field 'kategori' wajib bertipe string dan tidak boleh kosong" });
    }
    if (typeof tahunTerbit !== "number" || tahunTerbit < 1000 || tahunTerbit > new Date().getFullYear()) {
      return res.status(400).json({ success: false, message: `Field 'tahunTerbit' harus berupa angka rentang 1000-${new Date().getFullYear()}` });
    }
    if (stok !== undefined && (typeof stok !== "number" || stok < 0)) {
      return res.status(400).json({ success: false, message: "Field 'stok' harus berupa angka murni bernilai >= 0" });
    }

    const bukuBaru = await bukuService.createBuku({
      judul: judul.trim(),
      penulis: penulis.trim(),
      kategori: kategori.trim(),
      stok,
      tahunTerbit
    });

    return sendSuccess(res, 201, "Buku berhasil ditambahkan", bukuBaru);
  } catch (error) {
    next(error);
  }
};

export const handleUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID buku tidak valid" });
    }

    const existing = await bukuService.getBukuById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }

    const { judul, penulis, kategori, stok, tahunTerbit } = req.body;

    // Validasi opsional & rentang saat update
    if (judul !== undefined && (typeof judul !== "string" || judul.trim() === "")) {
      return res.status(400).json({ success: false, message: "Field 'judul' harus berupa string valid" });
    }
    if (penulis !== undefined && (typeof penulis !== "string" || penulis.trim() === "")) {
      return res.status(400).json({ success: false, message: "Field 'penulis' harus berupa string valid" });
    }
    if (kategori !== undefined && (typeof kategori !== "string" || kategori.trim() === "")) {
      return res.status(400).json({ success: false, message: "Field 'kategori' harus berupa string valid" });
    }
    if (tahunTerbit !== undefined && (typeof tahunTerbit !== "number" || tahunTerbit < 1000 || tahunTerbit > new Date().getFullYear())) {
      return res.status(400).json({ success: false, message: "Field 'tahunTerbit' tidak dalam rentang tahun yang valid" });
    }
    if (stok !== undefined && (typeof stok !== "number" || stok < 0)) {
      return res.status(400).json({ success: false, message: "Field 'stok' harus berupa angka >= 0" });
    }

    const updated = await bukuService.updateBuku(id, {
      ...(judul && { judul: judul.trim() }),
      ...(penulis && { penulis: penulis.trim() }),
      ...(kategori && { kategori: kategori.trim() }),
      ...(stok !== undefined && { stok }),
      ...(tahunTerbit && { tahunTerbit })
    });

    return sendSuccess(res, 200, "Buku berhasil diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

export const handleDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID buku tidak valid" });
    }

    const existing = await bukuService.getBukuById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }

    await bukuService.deleteBuku(id);
    return res.status(204).send(); // Status 204 No Content
  } catch (error) {
    next(error);
  }
};