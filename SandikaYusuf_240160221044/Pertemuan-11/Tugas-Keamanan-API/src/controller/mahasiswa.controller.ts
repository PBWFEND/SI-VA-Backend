import type { Request, Response, NextFunction } from "express";
import { mahasiswaService, MahasiswaNotFoundError } from "../service/mahasiswa.service.ts";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const data = await mahasiswaService.findAll(search);
    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diambil",
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
        message: "ID harus berupa integer positif valid",
      });
    }

    const data = await mahasiswaService.findById(id);
    return res.status(200).json({
      success: true,
      message: "Data mahasiswa ditemukan",
      data,
    });
  } catch (error) {
    if (error instanceof MahasiswaNotFoundError) {
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
    const data = await mahasiswaService.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Mahasiswa berhasil ditambahkan secara aman",
      data,
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
        message: "ID harus berupa integer positif valid",
      });
    }

    const data = await mahasiswaService.update(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Mahasiswa berhasil diperbarui",
      data,
    });
  } catch (error) {
    if (error instanceof MahasiswaNotFoundError) {
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
        message: "ID harus berupa integer positif valid",
      });
    }

    const data = await mahasiswaService.deleteById(id);
    return res.status(200).json({
      success: true,
      message: "Mahasiswa berhasil dihapus",
      data,
    });
  } catch (error) {
    if (error instanceof MahasiswaNotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const mahasiswaController = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default mahasiswaController;

