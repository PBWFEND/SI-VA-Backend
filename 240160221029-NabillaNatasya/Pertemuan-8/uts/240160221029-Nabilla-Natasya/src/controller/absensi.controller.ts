import type { Request, Response, NextFunction } from "express";
import { absensiService } from "../service/absensi.service.ts";
import type { AbsensiFilter, CreateAbsensiDTO, UpdateAbsensiDTO } from "../service/absensi.service.ts";

export const statusValid = ["Hadir", "Izin", "Sakit", "Alpa"] as const;

/**
 * Helper untuk memvalidasi apakah parameter ID berupa bilangan bulat positif.
 */
export function validasiId(idParam: unknown): number | null {
  if (typeof idParam !== "string" || idParam.trim() === "") {
    return null;
  }

  const num = Number(idParam);
  return Number.isInteger(num) && num > 0 ? num : null;
}

/**
 * Controller untuk mengambil daftar seluruh data absensi dengan filter opsional.
 * GET /absensi
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, nim, tanggal } = req.query;
    const filters: AbsensiFilter = {};

    // Validasi filter status jika disertakan
    if (status !== undefined) {
      if (typeof status !== "string" || !statusValid.includes(status as any)) {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'status' harus berupa salah satu dari: Hadir, Izin, Sakit, Alpa",
        });
      }
      filters.status = status;
    }

    // Validasi filter nim jika disertakan
    if (nim !== undefined) {
      if (typeof nim !== "string" || nim.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'nim' harus berupa teks yang tidak kosong",
        });
      }
      filters.nim = nim.trim();
    }

    // Validasi filter tanggal jika disertakan
    if (tanggal !== undefined) {
      if (typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'tanggal' harus berupa format tanggal yang valid (YYYY-MM-DD)",
        });
      }
      filters.tanggal = tanggal;
    }

    const data = await absensiService.findAll(filters);

    return res.status(200).json({
      success: true,
      message: "Daftar absensi berhasil diambil",
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk mengambil detail data absensi berdasarkan ID.
 * GET /absensi/:id
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validasiId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID absensi harus berupa bilangan bulat positif",
      });
    }

    const data = await absensiService.findById(id);

    return res.status(200).json({
      success: true,
      message: "Detail absensi berhasil diambil",
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
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const { nim, nama, tanggal, status, keterangan } = req.body;

    // Validasi field wajib 'nim'
    if (typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' wajib berupa teks dan tidak boleh kosong",
      });
    }

    // Validasi field wajib 'nama'
    if (typeof nama !== "string" || nama.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nama' wajib berupa teks dan tidak boleh kosong",
      });
    }

    // Validasi field wajib 'tanggal'
    if (typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
      return res.status(400).json({
        success: false,
        message: "Field 'tanggal' wajib berupa format tanggal yang valid (misal: 2026-11-02)",
      });
    }

    // Validasi field wajib 'status'
    if (typeof status !== "string" || !statusValid.includes(status as any)) {
      return res.status(400).json({
        success: false,
        message: "Field 'status' wajib salah satu dari: Hadir, Izin, Sakit, Alpa",
      });
    }

    // Validasi field opsional 'keterangan'
    if (keterangan !== undefined && keterangan !== null && typeof keterangan !== "string") {
      return res.status(400).json({
        success: false,
        message: "Field 'keterangan' harus berupa teks jika disertakan",
      });
    }

    const payload: CreateAbsensiDTO = {
      nim: nim.trim(),
      nama: nama.trim(),
      tanggal: new Date(tanggal),
      status: status.trim(),
      keterangan: keterangan !== undefined && keterangan !== null ? keterangan.trim() : null,
    };

    const data = await absensiService.create(payload);

    return res.status(201).json({
      success: true,
      message: "Data absensi berhasil ditambahkan",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk memperbarui data absensi secara parsial berdasarkan ID.
 * PATCH /absensi/:id atau PUT /absensi/:id
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validasiId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID absensi harus berupa bilangan bulat positif",
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body) ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body tidak boleh kosong untuk pembaruan data absensi",
      });
    }

    const { nim, nama, tanggal, status, keterangan } = req.body;
    const updateDTO: UpdateAbsensiDTO = {};

    // Validasi nim jika disertakan
    if (nim !== undefined) {
      if (typeof nim !== "string" || nim.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'nim' harus berupa teks dan tidak boleh kosong",
        });
      }
      updateDTO.nim = nim.trim();
    }

    // Validasi nama jika disertakan
    if (nama !== undefined) {
      if (typeof nama !== "string" || nama.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'nama' harus berupa teks dan tidak boleh kosong",
        });
      }
      updateDTO.nama = nama.trim();
    }

    // Validasi tanggal jika disertakan
    if (tanggal !== undefined) {
      if (typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
        return res.status(400).json({
          success: false,
          message: "Field 'tanggal' harus berupa format tanggal yang valid",
        });
      }
      updateDTO.tanggal = new Date(tanggal);
    }

    // Validasi status jika disertakan
    if (status !== undefined) {
      if (typeof status !== "string" || !statusValid.includes(status as any)) {
        return res.status(400).json({
          success: false,
          message: "Field 'status' harus salah satu dari: Hadir, Izin, Sakit, Alpa",
        });
      }
      updateDTO.status = status.trim();
    }

    // Validasi keterangan jika disertakan
    if (keterangan !== undefined) {
      if (keterangan !== null && typeof keterangan !== "string") {
        return res.status(400).json({
          success: false,
          message: "Field 'keterangan' harus berupa teks atau null",
        });
      }
      updateDTO.keterangan = keterangan !== null ? keterangan.trim() : null;
    }

    const data = await absensiService.update(id, updateDTO);

    return res.status(200).json({
      success: true,
      message: "Data absensi berhasil diperbarui",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk menghapus data absensi berdasarkan ID.
 * DELETE /absensi/:id
 */
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validasiId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID absensi harus berupa bilangan bulat positif",
      });
    }

    await absensiService.deleteById(id);

    // HTTP 204 No Content tanpa payload body sesuai standar RESTful API
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const absensiController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteById,
};

export default absensiController;

