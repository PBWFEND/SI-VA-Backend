import type { Request, Response, NextFunction } from "express";
import { absensiService } from "../service/absensi.service.ts";
import type { AbsensiFilter, CreateAbsensiDTO, UpdateAbsensiDTO } from "../service/absensi.service.ts";

const VALID_STATUSES = ["Hadir", "Izin", "Sakit", "Alpa"] as const;
type StatusAbsensi = typeof VALID_STATUSES[number];

/**
 * Validasi apakah status absensi valid.
 */
const isValidStatus = (status: unknown): status is StatusAbsensi => {
  return typeof status === "string" && VALID_STATUSES.includes(status as StatusAbsensi);
};

/**
 * Validasi parameter ID integer positif.
 */
const parsePositiveIntId = (idStr: unknown): number | null => {
  if (typeof idStr !== "string" || !/^[1-9]\d*$/.test(idStr.trim())) {
    return null;
  }
  const idNum = Number(idStr.trim());
  return Number.isSafeInteger(idNum) && idNum > 0 ? idNum : null;
};

/**
 * Validasi format tanggal ISO / valid date string.
 */
const isValidDateString = (dateStr: unknown): boolean => {
  if (typeof dateStr !== "string" || dateStr.trim() === "") {
    return false;
  }
  const timestamp = Date.parse(dateStr);
  return !Number.isNaN(timestamp);
};

/**
 * Controller untuk mengambil daftar seluruh data absensi dengan filter opsional.
 * GET /api/absensi
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const filters: AbsensiFilter = {};

    if (status !== undefined) {
      if (typeof status !== "string" || status.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'status' harus berupa teks yang tidak kosong",
        });
      }

      if (!isValidStatus(status.trim())) {
        return res.status(400).json({
          success: false,
          message: `Parameter query 'status' harus salah satu dari: ${VALID_STATUSES.join(", ")}`,
        });
      }

      filters.status = status.trim();
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
 * Controller untuk mengambil detail data absensi berdasarkan ID.
 * GET /api/absensi/:id
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parsedId = parsePositiveIntId(id);

    if (parsedId === null) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID harus berupa bilangan bulat positif",
      });
    }

    const data = await absensiService.findById(parsedId);

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
 * POST /api/absensi
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const { nim, namaMahasiswa, kelas, tanggal, status, keterangan } = req.body;

    // 1. Validasi nim
    if (typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' wajib diisi dan harus berupa string yang tidak kosong",
      });
    }
    if (nim.trim().length > 30) {
      return res.status(400).json({
        success: false,
        message: "Panjang field 'nim' maksimal 30 karakter",
      });
    }

    // 2. Validasi namaMahasiswa
    if (typeof namaMahasiswa !== "string" || namaMahasiswa.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'namaMahasiswa' wajib diisi dan harus berupa string yang tidak kosong",
      });
    }
    if (namaMahasiswa.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Panjang field 'namaMahasiswa' maksimal 100 karakter",
      });
    }

    // 3. Validasi kelas
    if (typeof kelas !== "string" || kelas.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'kelas' wajib diisi dan harus berupa string yang tidak kosong",
      });
    }
    if (kelas.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Panjang field 'kelas' maksimal 50 karakter",
      });
    }

    // 4. Validasi tanggal
    if (!isValidDateString(tanggal)) {
      return res.status(400).json({
        success: false,
        message: "Field 'tanggal' wajib diisi dengan format tanggal/ISO 8601 yang valid",
      });
    }

    // 5. Validasi status
    if (typeof status !== "string" || status.trim() === "") {
      return res.status(400).json({
        success: false,
        message: `Field 'status' wajib diisi dan harus salah satu dari: ${VALID_STATUSES.join(", ")}`,
      });
    }
    if (!isValidStatus(status.trim())) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Nilai yang diperbolehkan hanya: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // 6. Validasi keterangan (opsional)
    if (keterangan !== undefined && keterangan !== null) {
      if (typeof keterangan !== "string") {
        return res.status(400).json({
          success: false,
          message: "Field 'keterangan' harus berupa string jika disertakan",
        });
      }
      if (keterangan.trim().length > 255) {
        return res.status(400).json({
          success: false,
          message: "Panjang field 'keterangan' maksimal 255 karakter",
        });
      }
    }

    const payload: CreateAbsensiDTO = {
      nim: nim.trim(),
      namaMahasiswa: namaMahasiswa.trim(),
      kelas: kelas.trim(),
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
 * Controller untuk memperbarui data absensi secara parsial.
 * PATCH /api/absensi/:id
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parsedId = parsePositiveIntId(id);

    if (parsedId === null) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID harus berupa bilangan bulat positif",
      });
    }

    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    // Penolakan body kosong {}
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body tidak boleh kosong. Sertakan setidaknya satu field untuk diperbarui",
      });
    }

    const { nim, namaMahasiswa, kelas, tanggal, status, keterangan } = req.body;
    const updateData: UpdateAbsensiDTO = {};

    // Validasi nim jika dikirim
    if (nim !== undefined) {
      if (typeof nim !== "string" || nim.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'nim' harus berupa string yang tidak kosong",
        });
      }
      if (nim.trim().length > 30) {
        return res.status(400).json({
          success: false,
          message: "Panjang field 'nim' maksimal 30 karakter",
        });
      }
      updateData.nim = nim.trim();
    }

    // Validasi namaMahasiswa jika dikirim
    if (namaMahasiswa !== undefined) {
      if (typeof namaMahasiswa !== "string" || namaMahasiswa.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'namaMahasiswa' harus berupa string yang tidak kosong",
        });
      }
      if (namaMahasiswa.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Panjang field 'namaMahasiswa' maksimal 100 karakter",
        });
      }
      updateData.namaMahasiswa = namaMahasiswa.trim();
    }

    // Validasi kelas jika dikirim
    if (kelas !== undefined) {
      if (typeof kelas !== "string" || kelas.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'kelas' harus berupa string yang tidak kosong",
        });
      }
      if (kelas.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: "Panjang field 'kelas' maksimal 50 karakter",
        });
      }
      updateData.kelas = kelas.trim();
    }

    // Validasi tanggal jika dikirim
    if (tanggal !== undefined) {
      if (!isValidDateString(tanggal)) {
        return res.status(400).json({
          success: false,
          message: "Field 'tanggal' harus berupa format tanggal/ISO 8601 yang valid",
        });
      }
      updateData.tanggal = new Date(tanggal);
    }

    // Validasi status jika dikirim
    if (status !== undefined) {
      if (typeof status !== "string" || status.trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Field 'status' harus berupa string yang tidak kosong dan salah satu dari: ${VALID_STATUSES.join(", ")}`,
        });
      }
      if (!isValidStatus(status.trim())) {
        return res.status(400).json({
          success: false,
          message: `Status tidak valid. Nilai yang diperbolehkan hanya: ${VALID_STATUSES.join(", ")}`,
        });
      }
      updateData.status = status.trim();
    }

    // Validasi keterangan jika dikirim
    if (keterangan !== undefined) {
      if (keterangan !== null && typeof keterangan !== "string") {
        return res.status(400).json({
          success: false,
          message: "Field 'keterangan' harus berupa string atau null jika disertakan",
        });
      }
      if (typeof keterangan === "string" && keterangan.trim().length > 255) {
        return res.status(400).json({
          success: false,
          message: "Panjang field 'keterangan' maksimal 255 karakter",
        });
      }
      updateData.keterangan = typeof keterangan === "string" ? keterangan.trim() : null;
    }

    const data = await absensiService.update(parsedId, updateData);

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
 * DELETE /api/absensi/:id
 */
export const deleteAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parsedId = parsePositiveIntId(id);

    if (parsedId === null) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID harus berupa bilangan bulat positif",
      });
    }

    await absensiService.deleteById(parsedId);

    // HTTP 204 No Content
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
  delete: deleteAction,
};

export default absensiController;

