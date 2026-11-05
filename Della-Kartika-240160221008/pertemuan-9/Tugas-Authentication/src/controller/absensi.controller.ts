import type { Request, Response, NextFunction } from "express";
import { absensiService, AbsensiNotFoundError } from "../service/absensi.service.ts";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const data = await absensiService.findAll(status);
    return res.status(200).json({
      success: true,
      message: "Data absensi berhasil diambil",
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka integer valid",
      });
    }

    const data = await absensiService.findById(id);
    return res.status(200).json({
      success: true,
      message: "Data absensi ditemukan",
      data,
    });
  } catch (error) {
    if (error instanceof AbsensiNotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nim, namaMahasiswa, kelas, tanggal, status, keterangan } = req.body;

    if (!nim || typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' wajib diisi",
      });
    }
    if (!namaMahasiswa || typeof namaMahasiswa !== "string" || namaMahasiswa.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'namaMahasiswa' wajib diisi",
      });
    }
    if (!kelas || typeof kelas !== "string" || kelas.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'kelas' wajib diisi",
      });
    }
    if (!status || typeof status !== "string" || status.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'status' wajib diisi (HADIR, IZIN, SAKIT, ALPA)",
      });
    }

    const validStatus = ["HADIR", "IZIN", "SAKIT", "ALPA"];
    if (!validStatus.includes(status.trim().toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Status '${status}' tidak valid. Pilihan: ${validStatus.join(", ")}`,
      });
    }

    const tgl = tanggal ? new Date(tanggal) : new Date();
    if (isNaN(tgl.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal tidak valid",
      });
    }

    const newAbsensi = await absensiService.create({
      nim: nim.trim(),
      namaMahasiswa: namaMahasiswa.trim(),
      kelas: kelas.trim(),
      tanggal: tgl,
      status: status.trim().toUpperCase(),
      keterangan: keterangan || null,
    });

    return res.status(201).json({
      success: true,
      message: "Data absensi berhasil ditambahkan",
      data: newAbsensi,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka integer valid",
      });
    }

    const updated = await absensiService.update(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Data absensi berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    if (error instanceof AbsensiNotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka integer valid",
      });
    }

    const deleted = await absensiService.deleteById(id);
    return res.status(200).json({
      success: true,
      message: "Data absensi berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    if (error instanceof AbsensiNotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const absensiController = {
  getAll,
  getById,
  create,
  update,
  remove,
};
export default absensiController;

