import type { Request, Response, NextFunction } from "express";
import { bukuService, NotFoundError } from "../service/buku.service.ts";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { penulis, tahun, minStok, q } = req.query;

    const filter: any = {};
    if (typeof penulis === "string" && penulis.trim()) {
      filter.penulis = penulis.trim();
    }
    if (tahun !== undefined) {
      const parsedTahun = Number(tahun);
      if (!Number.isNaN(parsedTahun)) {
        filter.tahun = parsedTahun;
      }
    }
    if (minStok !== undefined) {
      const parsedStok = Number(minStok);
      if (!Number.isNaN(parsedStok)) {
        filter.minStok = parsedStok;
      }
    }
    if (typeof q === "string" && q.trim()) {
      filter.q = q.trim();
    }

    const data = await bukuService.findAll(filter);

    return res.status(200).json({
      success: true,
      message: "Daftar buku berhasil diambil",
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID buku harus berupa bilangan bulat positif",
      });
    }

    const data = await bukuService.findById(id);

    return res.status(200).json({
      success: true,
      message: "Detail buku berhasil diambil",
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

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const { judul, penulis, tahun, stok } = body;
    const errors: string[] = [];

    if (typeof judul !== "string" || !judul.trim()) {
      errors.push("Field 'judul' wajib diisi dengan teks tidak kosong");
    }

    if (typeof penulis !== "string" || !penulis.trim()) {
      errors.push("Field 'penulis' wajib diisi dengan teks tidak kosong");
    }

    const parsedTahun = typeof tahun === "number" ? tahun : Number(tahun);
    if (!Number.isInteger(parsedTahun) || parsedTahun < 1000 || parsedTahun > 2100) {
      errors.push("Field 'tahun' harus berupa bilangan bulat antara 1000 hingga 2100");
    }

    const parsedStok = typeof stok === "number" ? stok : Number(stok);
    if (!Number.isInteger(parsedStok) || parsedStok < 0) {
      errors.push("Field 'stok' harus berupa bilangan bulat non-negatif (>= 0)");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validasi penambahan buku gagal",
        details: errors,
      });
    }

    const newBuku = await bukuService.create({
      judul: judul.trim(),
      penulis: penulis.trim(),
      tahun: parsedTahun,
      stok: parsedStok,
    });

    return res.status(201).json({
      success: true,
      message: "Buku berhasil ditambahkan",
      data: newBuku,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID buku harus berupa bilangan bulat positif",
      });
    }

    const body = req.body;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const dataUpdate: any = {};
    const errors: string[] = [];

    if (Object.hasOwn(body, "judul")) {
      if (typeof body.judul !== "string" || !body.judul.trim()) {
        errors.push("Field 'judul' harus berupa teks dan tidak boleh kosong");
      } else {
        dataUpdate.judul = body.judul.trim();
      }
    }

    if (Object.hasOwn(body, "penulis")) {
      if (typeof body.penulis !== "string" || !body.penulis.trim()) {
        errors.push("Field 'penulis' harus berupa teks dan tidak boleh kosong");
      } else {
        dataUpdate.penulis = body.penulis.trim();
      }
    }

    if (Object.hasOwn(body, "tahun")) {
      const parsedTahun = Number(body.tahun);
      if (!Number.isInteger(parsedTahun) || parsedTahun < 1000 || parsedTahun > 2100) {
        errors.push("Field 'tahun' harus berupa angka antara 1000 hingga 2100");
      } else {
        dataUpdate.tahun = parsedTahun;
      }
    }

    if (Object.hasOwn(body, "stok")) {
      const parsedStok = Number(body.stok);
      if (!Number.isInteger(parsedStok) || parsedStok < 0) {
        errors.push("Field 'stok' harus berupa angka bulat non-negatif (>= 0)");
      } else {
        dataUpdate.stok = parsedStok;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validasi pembaruan buku gagal",
        details: errors,
      });
    }

    if (Object.keys(dataUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal salah satu field harus diisi: judul, penulis, tahun, atau stok",
      });
    }

    const updated = await bukuService.update(id, dataUpdate);

    return res.status(200).json({
      success: true,
      message: "Data buku berhasil diperbarui",
      data: updated,
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

export const deleteBuku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID buku harus berupa bilangan bulat positif",
      });
    }

    await bukuService.delete(id);

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

export const bukuController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteBuku,
};

export default bukuController;

