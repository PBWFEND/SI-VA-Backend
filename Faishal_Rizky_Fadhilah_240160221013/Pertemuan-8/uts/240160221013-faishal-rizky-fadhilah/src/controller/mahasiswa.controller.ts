import type { Request, Response, NextFunction } from "express";
import { mahasiswaService } from "../service/mahasiswa.service.ts";
import type { MahasiswaFilter, CreateMahasiswaDTO, UpdateMahasiswaDTO } from "../service/mahasiswa.service.ts";

/**
 * Controller untuk mengambil daftar seluruh mahasiswa dengan filter opsional.
 * GET /mahasiswa
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prodi, angkatan } = req.query;
    const filters: MahasiswaFilter = {};
    const currentYear = new Date().getFullYear();

    // Validasi filter prodi jika disertakan
    if (prodi !== undefined) {
      if (typeof prodi !== "string" || prodi.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'prodi' harus berupa teks yang tidak kosong",
        });
      }
      filters.prodi = prodi.trim();
    }

    // Validasi filter angkatan jika disertakan
    if (angkatan !== undefined) {
      if (typeof angkatan !== "string" || !/^\d{4}$/.test(angkatan)) {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'angkatan' harus berupa tahun 4 digit, misalnya 2024",
        });
      }

      const tahun = Number(angkatan);
      if (!Number.isInteger(tahun) || tahun < 2000 || tahun > currentYear) {
        return res.status(400).json({
          success: false,
          message: `Parameter query 'angkatan' harus berupa bilangan bulat antara 2000 dan ${currentYear}`,
        });
      }
      filters.angkatan = tahun;
    }

    const data = await mahasiswaService.findAll(filters);

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
 * Controller untuk mengambil detail mahasiswa berdasarkan NIM.
 * GET /mahasiswa/:nim
 */
export const getByNim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nim } = req.params;

    if (typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Parameter NIM harus berupa teks yang tidak kosong",
      });
    }

    const data = await mahasiswaService.findByNim(nim.trim());

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk menambahkan data mahasiswa baru.
 * POST /mahasiswa
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const { nim, nama, prodi, angkatan } = req.body;
    const currentYear = new Date().getFullYear();

    // Validasi tipe dan nilai field nim
    if (typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Validasi tipe dan nilai field nama
    if (typeof nama !== "string" || nama.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nama' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Validasi tipe dan nilai field prodi
    if (typeof prodi !== "string" || prodi.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'prodi' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Validasi ketat angkatan: wajib number, integer, 2000..currentYear (tanpa konversi Number())
    if (
      typeof angkatan !== "number" ||
      !Number.isInteger(angkatan) ||
      angkatan < 2000 ||
      angkatan > currentYear
    ) {
      return res.status(400).json({
        success: false,
        message: `Field 'angkatan' wajib berupa angka bilangan bulat antara 2000 dan ${currentYear}`,
      });
    }

    const createPayload: CreateMahasiswaDTO = {
      nim: nim.trim(),
      nama: nama.trim(),
      prodi: prodi.trim(),
      angkatan,
    };

    const result = await mahasiswaService.create(createPayload);

    return res.status(201).json({
      success: true,
      message: "Mahasiswa berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk memperbarui sebagian data mahasiswa berdasarkan NIM.
 * PATCH /mahasiswa/:nim
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nim } = req.params;

    if (typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Parameter NIM harus berupa teks yang tidak kosong",
      });
    }

    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    // Proteksi agar NIM tidak dapat diubah melalui endpoint PATCH
    if (Object.prototype.hasOwnProperty.call(req.body, "nim")) {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' tidak dapat diubah melalui endpoint PATCH",
      });
    }

    const allowedFields = ["nama", "prodi", "angkatan"];
    const providedFields = allowedFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );

    if (providedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Isi minimal satu field yang ingin diperbarui (nama, prodi, atau angkatan)",
      });
    }

    const updatePayload: UpdateMahasiswaDTO = {};
    const currentYear = new Date().getFullYear();

    if (Object.prototype.hasOwnProperty.call(req.body, "nama")) {
      const { nama } = req.body;
      if (typeof nama !== "string" || nama.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'nama' harus berupa teks dan tidak boleh kosong",
        });
      }
      updatePayload.nama = nama.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "prodi")) {
      const { prodi } = req.body;
      if (typeof prodi !== "string" || prodi.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'prodi' harus berupa teks dan tidak boleh kosong",
        });
      }
      updatePayload.prodi = prodi.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "angkatan")) {
      const { angkatan } = req.body;
      if (
        typeof angkatan !== "number" ||
        !Number.isInteger(angkatan) ||
        angkatan < 2000 ||
        angkatan > currentYear
      ) {
        return res.status(400).json({
          success: false,
          message: `Field 'angkatan' wajib berupa angka bilangan bulat antara 2000 dan ${currentYear}`,
        });
      }
      updatePayload.angkatan = angkatan;
    }

    const updated = await mahasiswaService.update(nim.trim(), updatePayload);

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk menghapus data mahasiswa berdasarkan NIM.
 * DELETE /mahasiswa/:nim
 */
export const deleteMahasiswa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nim } = req.params;

    if (typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Parameter NIM harus berupa teks yang tidak kosong",
      });
    }

    await mahasiswaService.delete(nim.trim());

    // HTTP 204 No Content: operasi berhasil tanpa response body
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteMahasiswa as delete };

export const mahasiswaController = {
  getAll,
  getByNim,
  create,
  update,
  delete: deleteMahasiswa,
};

export default mahasiswaController;

