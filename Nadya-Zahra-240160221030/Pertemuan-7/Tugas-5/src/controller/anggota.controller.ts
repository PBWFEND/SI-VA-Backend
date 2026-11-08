
import type { Request, Response, NextFunction } from "express";
import * as anggotaService from "../service/anggota.service.ts";

// Tipe data anggota
type DataAnggota = {
  id_anggota: string;
  nama: string;
  nim: string;
  jabatan: string;
};

// Validasi input anggota
function validasiAnggota(
  data: unknown,
  partial = false
): string | null {
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data)
  ) {
    return "Body harus berupa object JSON";
  }

  const body = data as Record<string, unknown>;

  const fieldWajib = ["id_anggota", "nama", "nim", "jabatan"];
  const fieldUpdate = ["nama", "nim", "jabatan"];
  const fieldDiizinkan = partial ? fieldUpdate : fieldWajib;

  const fieldDikirim = Object.keys(body);

  if (fieldDikirim.length === 0) {
    return "Data tidak boleh kosong";
  }

  const fieldTidakDikenal = fieldDikirim.find(
    (field) => !fieldDiizinkan.includes(field)
  );

  if (fieldTidakDikenal) {
    return `Field '${fieldTidakDikenal}' tidak diizinkan`;
  }

  for (const field of fieldDikirim) {
    if (
      typeof body[field] !== "string" ||
      body[field].trim() === ""
    ) {
      return `Field '${field}' harus berupa teks dan tidak boleh kosong`;
    }
  }

  if (!partial) {
    const fieldKosong = fieldWajib.find(
      (field) =>
        typeof body[field] !== "string" ||
        body[field].trim() === ""
    );

    if (fieldKosong) {
      return `Field '${fieldKosong}' wajib diisi`;
    }
  }

  return null;
}

// Validasi ID anggota dari URL
function validasiId(id: unknown): id is string {
  return typeof id === "string" && id.trim() !== "";
}

// GET semua anggota
export async function getAllAnggota(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await anggotaService.getAllAnggota();

    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
}

// GET anggota berdasarkan ID
export async function getAnggotaById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    if (!validasiId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID anggota tidak valid",
      });
    }

    const data = await anggotaService.getAnggotaById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Anggota tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

// POST anggota
export async function createAnggota(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const error = validasiAnggota(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const body = req.body as DataAnggota;

    const data = await anggotaService.createAnggota({
      id_anggota: body.id_anggota.trim(),
      nama: body.nama.trim(),
      nim: body.nim.trim(),
      jabatan: body.jabatan.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Anggota berhasil ditambahkan",
      data,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH anggota
export async function updateAnggota(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    if (!validasiId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID anggota tidak valid",
      });
    }

    const error = validasiAnggota(req.body, true);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const body = req.body as Record<string, string>;

    const dataUpdate: {
      nama?: string;
      nim?: string;
      jabatan?: string;
    } = {};

    if (typeof body.nama === "string") {
      dataUpdate.nama = body.nama.trim();
    }

    if (typeof body.nim === "string") {
      dataUpdate.nim = body.nim.trim();
    }

    if (typeof body.jabatan === "string") {
      dataUpdate.jabatan = body.jabatan.trim();
    }

    const data = await anggotaService.updateAnggota(
      id,
      dataUpdate
    );

    return res.status(200).json({
      success: true,
      message: "Data anggota berhasil diperbarui",
      data,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE anggota
export async function deleteAnggota(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    if (!validasiId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID anggota tidak valid",
      });
    }

    await anggotaService.deleteAnggota(id);

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}
