import type { Request, Response, NextFunction } from "express";
import { bukuService } from "../service/buku.service.ts";

/**
 * Controller untuk mengambil seluruh data buku.
 * GET /buku
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await bukuService.findAll();

    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk mengambil detail buku berdasarkan ID.
 * GET /buku/:id
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID buku harus berupa angka positif",
      });
    }

    const data = await bukuService.findById(id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk menambahkan data buku baru.
 * POST /buku
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const { judul, penulis, tahun, stok } = req.body;

    if (typeof judul !== "string" || judul.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'judul' wajib diisi dan tidak boleh kosong",
      });
    }

    if (typeof penulis !== "string" || penulis.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'penulis' wajib diisi dan tidak boleh kosong",
      });
    }

    if (!Number.isInteger(tahun) || tahun < 1000 || tahun > 2100) {
      return res.status(400).json({
        success: false,
        message: "Field 'tahun' harus berupa angka antara 1000 sampai 2100",
      });
    }

    if (!Number.isInteger(stok) || stok < 0) {
      return res.status(400).json({
        success: false,
        message: "Field 'stok' harus berupa angka bulat dan tidak boleh negatif",
      });
    }

    const createPayload = {
      judul: judul.trim(),
      penulis: penulis.trim(),
      tahun,
      stok,
    };

    const result = await bukuService.create(createPayload);

    return res.status(201).json({
      success: true,
      message: "Data buku berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk memperbarui sebagian data buku.
 * PATCH /buku/:id
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID buku harus berupa angka positif",
      });
    }

    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "id")) {
      return res.status(400).json({
        success: false,
        message: "Field 'id' tidak dapat diubah melalui endpoint PATCH",
      });
    }

    const allowedFields = ["judul", "penulis", "tahun", "stok"];

    const providedFields = allowedFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );

    if (providedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Isi minimal satu field yang ingin diperbarui (judul, penulis, tahun, atau stok)",
      });
    }

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field '${invalidFields[0]}' tidak diizinkan`,
      });
    }

    const updatePayload: {
      judul?: string;
      penulis?: string;
      tahun?: number;
      stok?: number;
    } = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "judul")) {
      const { judul } = req.body;

      if (typeof judul !== "string" || judul.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'judul' harus berupa teks dan tidak boleh kosong",
        });
      }

      updatePayload.judul = judul.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "penulis")) {
      const { penulis } = req.body;

      if (typeof penulis !== "string" || penulis.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'penulis' harus berupa teks dan tidak boleh kosong",
        });
      }

      updatePayload.penulis = penulis.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "tahun")) {
      const { tahun } = req.body;

      if (!Number.isInteger(tahun) || tahun < 1000 || tahun > 2100) {
        return res.status(400).json({
          success: false,
          message: "Field 'tahun' harus berupa angka antara 1000 sampai 2100",
        });
      }

      updatePayload.tahun = tahun;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "stok")) {
      const { stok } = req.body;

      if (!Number.isInteger(stok) || stok < 0) {
        return res.status(400).json({
          success: false,
          message: "Field 'stok' harus berupa angka bulat dan tidak boleh negatif",
        });
      }

      updatePayload.stok = stok;
    }

    const updated = await bukuService.update(id, updatePayload);

    return res.status(200).json({
      success: true,
      message: "Data buku berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk menghapus data buku berdasarkan ID.
 * DELETE /buku/:id
 */
export const deleteBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID buku harus berupa angka positif",
      });
    }

    await bukuService.delete(id);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteBuku as delete };

export const bukuController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteBuku,
};

export default bukuController;