import type { Request, Response, NextFunction } from "express";
import {
  ambilSemuaBuku,
  ambilBukuById,
  tambahBuku,
  ubahBuku,
  hapusBuku,
} from "../service/buku.service.ts";

// GET: Menampilkan semua buku
export const getSemuaBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buku = await ambilSemuaBuku();
    res.status(200).json(buku);
  } catch (error) {
    next(error);
  }
};

// GET: Menampilkan buku berdasarkan ID
export const getBukuById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ pesan: "ID tidak valid" });
    }

    const buku = await ambilBukuById(id);

    if (!buku) {
      return res.status(404).json({ pesan: "Buku tidak ditemukan" });
    }

    res.status(200).json(buku);
  } catch (error) {
    next(error);
  }
};

// POST: Menambahkan buku
export const postBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { judul, penulis, tahun, stok } = req.body;

    if (
      typeof judul !== "string" || judul.trim() === "" ||
      typeof penulis !== "string" || penulis.trim() === "" ||
      typeof tahun !== "number" || !Number.isInteger(tahun) ||
      tahun < 1000 || tahun > 2100 ||
      typeof stok !== "number" || !Number.isInteger(stok) || stok < 0
    ) {
      return res.status(400).json({ pesan: "Data buku tidak valid" });
    }

    const buku = await tambahBuku({
      judul: judul.trim(),
      penulis: penulis.trim(),
      tahun,
      stok,
    });

    res.status(201).json(buku);
  } catch (error) {
    next(error);
  }
};

// PATCH: Mengubah data buku
export const patchBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { judul, penulis, tahun, stok } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ pesan: "ID tidak valid" });
    }

    const data: {
      judul?: string;
      penulis?: string;
      tahun?: number;
      stok?: number;
    } = {};

    if (judul !== undefined) {
      if (typeof judul !== "string" || judul.trim() === "") {
        return res.status(400).json({ pesan: "Judul tidak valid" });
      }
      data.judul = judul.trim();
    }

    if (penulis !== undefined) {
      if (typeof penulis !== "string" || penulis.trim() === "") {
        return res.status(400).json({ pesan: "Penulis tidak valid" });
      }
      data.penulis = penulis.trim();
    }

    if (tahun !== undefined) {
      if (
        typeof tahun !== "number" || !Number.isInteger(tahun) ||
        tahun < 1000 || tahun > 2100
      ) {
        return res.status(400).json({ pesan: "Tahun tidak valid" });
      }
      data.tahun = tahun;
    }

    if (stok !== undefined) {
      if (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0) {
        return res.status(400).json({ pesan: "Stok tidak valid" });
      }
      data.stok = stok;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ pesan: "Tidak ada data untuk diubah" });
    }

    const bukuLama = await ambilBukuById(id);

    if (!bukuLama) {
      return res.status(404).json({ pesan: "Buku tidak ditemukan" });
    }

    const buku = await ubahBuku(id, data);
    res.status(200).json(buku);
  } catch (error) {
    next(error);
  }
};

// DELETE: Menghapus buku
export const deleteBuku = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ pesan: "ID tidak valid" });
    }

    const bukuLama = await ambilBukuById(id);

    if (!bukuLama) {
      return res.status(404).json({ pesan: "Buku tidak ditemukan" });
    }

    await hapusBuku(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
