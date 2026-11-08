/**
 * Controller Layer: Resource Buku
 * Tanggung Jawab: Menerima request HTTP, validasi input & parameter, memanggil Service, membentuk response JSON & HTTP status.
 * Larangan: Tidak boleh menulis query Prisma langsung.
 */

import type { Request, Response, NextFunction } from "express";
import { bukuService, NotFoundError } from "../service/buku.service.ts";

/**
 * Helper validasi ID numerik dari parameter URL.
 * Memeriksa typeof sebelum melakukan konversi Number().
 */
const parseIdParam = (rawId: unknown): { id?: number; error?: string } => {
  if (typeof rawId !== "string" || rawId.trim() === "") {
    return { error: "Parameter ID harus berupa string angka" };
  }

  const trimmed = rawId.trim();
  const idNumber = Number(trimmed);

  if (!Number.isInteger(idNumber) || idNumber <= 0 || !/^\d+$/.test(trimmed)) {
    return { error: "Parameter ID buku harus berupa bilangan bulat positif" };
  }

  return { id: idNumber };
};

/**
 * Controller untuk mengambil seluruh daftar buku (dengan filter query opsional).
 * GET /buku
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { penulis, tahun, minStok, q } = req.query;

    const filter: any = {};

    if (penulis !== undefined) {
      if (typeof penulis === "string" && penulis.trim() !== "") {
        filter.penulis = penulis.trim();
      }
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

    if (q !== undefined) {
      if (typeof q === "string" && q.trim() !== "") {
        filter.q = q.trim();
      }
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

/**
 * Controller untuk mengambil detail buku berdasarkan ID.
 * GET /buku/:id
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idValidation = parseIdParam(req.params.id);

    if (idValidation.error || idValidation.id === undefined) {
      return res.status(400).json({
        success: false,
        message: idValidation.error ?? "Parameter ID buku tidak valid",
      });
    }

    const data = await bukuService.findById(idValidation.id);

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

/**
 * Controller untuk menambahkan data buku baru.
 * POST /buku
 * Menerapkan penguatan validasi dan mengumpulkan seluruh error dalam array.
 */
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

    // Validasi field 'judul'
    if (typeof judul !== "string" || judul.trim() === "") {
      errors.push("Field 'judul' wajib diisi dan harus berupa string tidak kosong");
    }

    // Validasi field 'penulis'
    if (typeof penulis !== "string" || penulis.trim() === "") {
      errors.push("Field 'penulis' wajib diisi dan harus berupa string tidak kosong");
    }

    // Validasi field 'tahun'
    if (typeof tahun !== "number" || !Number.isInteger(tahun) || tahun < 1000 || tahun > 2100) {
      errors.push("Field 'tahun' wajib diisi dengan angka bulat antara tahun 1000 hingga 2100");
    }

    // Validasi field 'stok' (opsional, jika diisi harus integer >= 0)
    let parsedStok = 0;
    if (stok !== undefined) {
      if (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0) {
        errors.push("Field 'stok' harus berupa bilangan bulat non-negatif (>= 0)");
      } else {
        parsedStok = stok;
      }
    }

    // Jika terdapat satu atau lebih error validasi
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validasi data buku gagal",
        details: errors,
      });
    }

    const newBuku = await bukuService.create({
      judul: (judul as string).trim(),
      penulis: (penulis as string).trim(),
      tahun: tahun as number,
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

/**
 * Controller untuk memperbarui data buku secara parsial.
 * PATCH /buku/:id
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idValidation = parseIdParam(req.params.id);

    if (idValidation.error || idValidation.id === undefined) {
      return res.status(400).json({
        success: false,
        message: idValidation.error ?? "Parameter ID buku tidak valid",
      });
    }

    const body = req.body;

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const errors: string[] = [];
    const dataUpdate: any = {};

    if (Object.hasOwn(body, "judul")) {
      if (typeof body.judul !== "string" || body.judul.trim() === "") {
        errors.push("Field 'judul' harus berupa teks string tidak kosong");
      } else {
        dataUpdate.judul = body.judul.trim();
      }
    }

    if (Object.hasOwn(body, "penulis")) {
      if (typeof body.penulis !== "string" || body.penulis.trim() === "") {
        errors.push("Field 'penulis' harus berupa teks string tidak kosong");
      } else {
        dataUpdate.penulis = body.penulis.trim();
      }
    }

    if (Object.hasOwn(body, "tahun")) {
      const parsedTahun = Number(body.tahun);
      if (typeof body.tahun !== "number" || !Number.isInteger(parsedTahun) || parsedTahun < 1000 || parsedTahun > 2100) {
        errors.push("Field 'tahun' harus berupa bilangan bulat antara tahun 1000 hingga 2100");
      } else {
        dataUpdate.tahun = parsedTahun;
      }
    }

    if (Object.hasOwn(body, "stok")) {
      const parsedStok = Number(body.stok);
      if (typeof body.stok !== "number" || !Number.isInteger(parsedStok) || parsedStok < 0) {
        errors.push("Field 'stok' harus berupa bilangan bulat non-negatif (>= 0)");
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
        message: "Minimal salah satu field harus diisi untuk pembaruan: judul, penulis, tahun, atau stok",
      });
    }

    const updatedBuku = await bukuService.update(idValidation.id, dataUpdate);

    return res.status(200).json({
      success: true,
      message: "Data buku berhasil diperbarui",
      data: updatedBuku,
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

/**
 * Controller untuk menghapus data buku berdasarkan ID.
 * DELETE /buku/:id
 */
export const deleteBuku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idValidation = parseIdParam(req.params.id);

    if (idValidation.error || idValidation.id === undefined) {
      return res.status(400).json({
        success: false,
        message: idValidation.error ?? "Parameter ID buku tidak valid",
      });
    }

    await bukuService.delete(idValidation.id);

    // Status 204 No Content wajib tanpa body
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
