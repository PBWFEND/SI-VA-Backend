
import type { Request, Response, NextFunction } from "express";
import {
  ambilSemuaBuku,
  ambilBukuBerdasarkanId,
  tambahBuku,
  ubahBuku,
  hapusBuku
} from "../service/buku.service.ts";

function ambilId(value: string | string[]): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function getSemuaBuku(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await ambilSemuaBuku();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function getDetailBuku(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = ambilId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID buku tidak valid"
      });
    }

    const buku = await ambilBukuBerdasarkanId(id);

    if (!buku) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan"
      });
    }

    return res.status(200).json({
      success: true,
      data: buku
    });
  } catch (error) {
    next(error);
  }
}

export async function postBuku(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { judul, penulis, tahun, stok } = req.body ?? {};

    if (
      typeof judul !== "string" || judul.trim() === "" ||
      typeof penulis !== "string" || penulis.trim() === "" ||
      typeof tahun !== "number" || !Number.isInteger(tahun) ||
      tahun < 1000 || tahun > 2100 ||
      typeof stok !== "number" || !Number.isInteger(stok) ||
      stok < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Input tidak valid. Isi judul, penulis, tahun (1000-2100), dan stok (minimal 0) dengan tipe yang benar."
      });
    }

    const buku = await tambahBuku({
      judul: judul.trim(),
      penulis: penulis.trim(),
      tahun,
      stok
    });

    return res.status(201).json({
      success: true,
      message: "Buku berhasil ditambahkan",
      data: buku
    });
  } catch (error) {
    next(error);
  }
}

export async function patchBuku(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = ambilId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID buku tidak valid"
      });
    }

    const { judul, penulis, tahun, stok } = req.body ?? {};
    const data: {
      judul?: string;
      penulis?: string;
      tahun?: number;
      stok?: number;
    } = {};

    if (judul !== undefined) {
      if (typeof judul !== "string" || judul.trim() === "") {
        return res.status(400).json({ success: false, message: "Judul harus berupa teks dan tidak boleh kosong" });
      }
      data.judul = judul.trim();
    }

    if (penulis !== undefined) {
      if (typeof penulis !== "string" || penulis.trim() === "") {
        return res.status(400).json({ success: false, message: "Penulis harus berupa teks dan tidak boleh kosong" });
      }
      data.penulis = penulis.trim();
    }

    if (tahun !== undefined) {
      if (typeof tahun !== "number" || !Number.isInteger(tahun) || tahun < 1000 || tahun > 2100) {
        return res.status(400).json({ success: false, message: "Tahun harus berupa angka 1000 sampai 2100" });
      }
      data.tahun = tahun;
    }

    if (stok !== undefined) {
      if (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0) {
        return res.status(400).json({ success: false, message: "Stok harus berupa bilangan bulat minimal 0" });
      }
      data.stok = stok;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Masukkan minimal satu data yang ingin diubah"
      });
    }

    const hasil = await ubahBuku(id, data);

    if (hasil.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan"
      });
    }

    const buku = await ambilBukuBerdasarkanId(id);

    return res.status(200).json({
      success: true,
      message: "Buku berhasil diubah",
      data: buku
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBuku(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = ambilId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID buku tidak valid"
      });
    }

    const hasil = await hapusBuku(id);

    if (hasil.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan"
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
