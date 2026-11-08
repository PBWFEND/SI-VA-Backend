import type { Request, Response, NextFunction } from "express";
import { absensiService } from "../service/absensi.service.ts";

/**
 * Controller untuk mengambil seluruh data absensi dengan filter opsional.
 * GET /absensi
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, kegiatan } = req.query;

    const filters: {
      status?: string;
      kegiatan?: string;
    } = {};

    // Validasi filter status
    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !["Hadir", "Izin", "Sakit"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'status' harus berupa Hadir, Izin, atau Sakit",
        });
      }

      filters.status = status;
    }

    // Validasi filter kegiatan
    if (kegiatan !== undefined) {
      if (typeof kegiatan !== "string" || kegiatan.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'kegiatan' harus berupa teks yang tidak kosong",
        });
      }

      filters.kegiatan = kegiatan.trim();
    }

    const data = await absensiService.findAll(filters);

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
 * Controller untuk mengambil detail absensi berdasarkan ID.
 * GET /absensi/:id
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Parameter ID absensi harus berupa teks yang tidak kosong",
      });
    }

    const data = await absensiService.findById(id.trim());

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk menambahkan data absensi baru.
 * POST /absensi
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

    const { id_absensi, id_anggota, kegiatan, tanggal, status } = req.body;

    // Validasi ID absensi
    if (typeof id_absensi !== "string" || id_absensi.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'id_absensi' wajib diisi dan tidak boleh kosong",
      });
    }

    // Validasi ID anggota
    if (typeof id_anggota !== "string" || id_anggota.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'id_anggota' wajib diisi dan tidak boleh kosong",
      });
    }

    // Validasi kegiatan
    if (typeof kegiatan !== "string" || kegiatan.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'kegiatan' wajib diisi dan tidak boleh kosong",
      });
    }

    // Validasi tanggal dengan format YYYY-MM-DD
    if (
      typeof tanggal !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(tanggal) ||
      Number.isNaN(Date.parse(`${tanggal}T00:00:00.000Z`)) ||
      new Date(`${tanggal}T00:00:00.000Z`).toISOString().slice(0, 10) !== tanggal
    ) {
      return res.status(400).json({
        success: false,
        message: "Field 'tanggal' wajib menggunakan format YYYY-MM-DD",
      });
    }

    // Validasi status absensi
    if (
      typeof status !== "string" ||
      !["Hadir", "Izin", "Sakit"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Field 'status' wajib berupa Hadir, Izin, atau Sakit",
      });
    }

    const createPayload = {
      id_absensi: id_absensi.trim(),
      id_anggota: id_anggota.trim(),
      kegiatan: kegiatan.trim(),
      tanggal,
      status,
    };

    const result = await absensiService.create(createPayload);

    return res.status(201).json({
      success: true,
      message: "Data absensi berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk memperbarui sebagian data absensi.
 * PATCH /absensi/:id
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Parameter ID absensi harus berupa teks yang tidak kosong",
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

    // Proteksi agar ID absensi tidak dapat diubah
    if (Object.prototype.hasOwnProperty.call(req.body, "id_absensi")) {
      return res.status(400).json({
        success: false,
        message: "Field 'id_absensi' tidak dapat diubah melalui endpoint PATCH",
      });
    }

    const allowedFields = ["id_anggota", "kegiatan", "tanggal", "status"];

    const providedFields = allowedFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );

    if (providedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Isi minimal satu field yang ingin diperbarui (id_anggota, kegiatan, tanggal, atau status)",
      });
    }

    // Menolak field yang tidak diizinkan
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
      id_anggota?: string;
      kegiatan?: string;
      tanggal?: string;
      status?: string;
    } = {};

    // Validasi ID anggota
    if (Object.prototype.hasOwnProperty.call(req.body, "id_anggota")) {
      const { id_anggota } = req.body;

      if (typeof id_anggota !== "string" || id_anggota.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'id_anggota' harus berupa teks dan tidak boleh kosong",
        });
      }

      updatePayload.id_anggota = id_anggota.trim();
    }

    // Validasi kegiatan
    if (Object.prototype.hasOwnProperty.call(req.body, "kegiatan")) {
      const { kegiatan } = req.body;

      if (typeof kegiatan !== "string" || kegiatan.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'kegiatan' harus berupa teks dan tidak boleh kosong",
        });
      }

      updatePayload.kegiatan = kegiatan.trim();
    }

    // Validasi tanggal
    if (Object.prototype.hasOwnProperty.call(req.body, "tanggal")) {
      const { tanggal } = req.body;

      if (
        typeof tanggal !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(tanggal) ||
        Number.isNaN(Date.parse(`${tanggal}T00:00:00.000Z`)) ||
        new Date(`${tanggal}T00:00:00.000Z`).toISOString().slice(0, 10) !== tanggal
      ) {
        return res.status(400).json({
          success: false,
          message: "Field 'tanggal' wajib menggunakan format YYYY-MM-DD",
        });
      }

      updatePayload.tanggal = tanggal;
    }

    // Validasi status
    if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
      const { status } = req.body;

      if (
        typeof status !== "string" ||
        !["Hadir", "Izin", "Sakit"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Field 'status' wajib berupa Hadir, Izin, atau Sakit",
        });
      }

      updatePayload.status = status;
    }

    const updated = await absensiService.update(id.trim(), updatePayload);

    return res.status(200).json({
      success: true,
      message: "Data absensi berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk menghapus data absensi berdasarkan ID.
 * DELETE /absensi/:id
 */
export const deleteAbsensi = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Parameter ID absensi harus berupa teks yang tidak kosong",
      });
    }

    await absensiService.delete(id.trim());

    // HTTP 204 No Content
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteAbsensi as delete };

export const absensiController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteAbsensi,
};

export default absensiController;
