import type { Request, Response, NextFunction } from "express";
import { mahasiswaService, MahasiswaNotFoundError } from "../service/mahasiswa.service.ts";

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await mahasiswaService.findAll();
    return res.status(200).json({ success: true, total: data.length, data });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID harus berupa integer positif" });
    }
    const data = await mahasiswaService.findById(id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error instanceof MahasiswaNotFoundError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nim, nama, prodi, angkatan } = req.body;
    if (!nim || !nama || !prodi || !angkatan) {
      return res.status(400).json({ success: false, message: "Field nim, nama, prodi, dan angkatan wajib diisi" });
    }
    const data = await mahasiswaService.create({ nim, nama, prodi, angkatan: Number(angkatan) });
    return res.status(201).json({ success: true, message: "Mahasiswa berhasil ditambahkan", data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID harus berupa integer positif" });
    }
    const data = await mahasiswaService.update(id, req.body);
    return res.status(200).json({ success: true, message: "Mahasiswa berhasil diperbarui", data });
  } catch (error) {
    if (error instanceof MahasiswaNotFoundError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const deleteAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID harus berupa integer positif" });
    }
    await mahasiswaService.deleteById(id);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof MahasiswaNotFoundError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const mahasiswaController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteAction,
};
export default mahasiswaController;

