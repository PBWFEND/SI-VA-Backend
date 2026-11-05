import type { Response, NextFunction } from "express";
import { absensiService, AbsensiNotFoundError } from "../service/absensi.service.ts";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.ts";

export const getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    // Batasan Akses Data (BOLA / Ownership Enforcement):
    // Mahasiswa hanya dapat melihat rekap kehadiran miliknya sendiri
    const userRole = (req.user?.role || "").toUpperCase();
    const filterNim = userRole === "MAHASISWA" ? req.user?.nim : undefined;

    const data = await absensiService.findAll({
      nim: filterNim,
      status,
      search,
    });

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

export const getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa integer positif valid",
      });
    }

    const data = await absensiService.findById(id);

    // Proteksi Kepemilikan (BOLA / IDOR):
    // Mahasiswa tidak berhak melihat detail absensi mahasiswa lain
    const userRole = (req.user?.role || "").toUpperCase();
    if (userRole === "MAHASISWA" && data.nim !== req.user?.nim) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Anda tidak memiliki wewenang untuk melihat data absensi mahasiswa lain",
      });
    }

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

export const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak: Pengguna belum terautentikasi",
      });
    }

    const userRole = (req.user.role || "").toUpperCase();
    let nimTarget: string;
    let namaTarget: string;

    // ANTI-SPOOFING IDENTITY ENFORCEMENT:
    // Jika pemanggil adalah MAHASISWA, backend MENGABAIKAN dan MENOLAK manipulasi body.nim
    // Backend mengikat secara permanen identitas dari payload JWT (req.user.nim & req.user.nama)
    if (userRole === "MAHASISWA") {
      nimTarget = req.user.nim;
      namaTarget = req.user.nama;
    } else {
      // Jika peran adalah ADMIN, DOSEN, atau STAF, izinkan mencatat atas nama NIM yang diberikan pada body
      if (!req.body.nim || !req.body.namaMahasiswa) {
        return res.status(400).json({
          success: false,
          message: "Field 'nim' dan 'namaMahasiswa' wajib disertakan oleh staf/dosen",
        });
      }
      nimTarget = req.body.nim;
      namaTarget = req.body.namaMahasiswa;
    }

    const newRecord = await absensiService.create({
      nim: nimTarget,
      namaMahasiswa: namaTarget,
      kelas: req.body.kelas,
      status: req.body.status,
      keterangan: req.body.keterangan,
    });

    return res.status(201).json({
      success: true,
      message: "Pencatatan kehadiran mahasiswa berhasil disimpan secara aman",
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa integer positif valid",
      });
    }

    const updated = await absensiService.update(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Data absensi berhasil diperbarui secara aman",
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

export const remove = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa integer positif valid",
      });
    }

    const deleted = await absensiService.deleteById(id);
    return res.status(200).json({
      success: true,
      message: "Data absensi berhasil dihapus dari sistem",
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

