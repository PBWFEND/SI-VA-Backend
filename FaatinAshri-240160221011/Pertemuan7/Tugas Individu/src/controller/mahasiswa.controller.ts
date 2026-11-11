import type { Request, Response, NextFunction } from "express";
import {
  getAllMahasiswa,
  getMahasiswaByNim,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "../service/mahasiswa.service.ts";

function isValidAngkatan(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 2000 &&
    value <= 2100
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getNim(req: Request): string {
  const param = req.params.nim;
  return Array.isArray(param) ? param[0] : param;
}

export async function listMahasiswa(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const prodi = req.query.prodi;
    const angkatanQuery = req.query.angkatan;

    if (prodi !== undefined && typeof prodi !== "string") {
      return res.status(400).json({
        success: false,
        message: "Filter prodi harus berupa teks",
      });
    }

    let angkatan: number | undefined;

    if (angkatanQuery !== undefined) {
      if (
        typeof angkatanQuery !== "string" ||
        !/^\d+$/.test(angkatanQuery) ||
        !isValidAngkatan(Number(angkatanQuery))
      ) {
        return res.status(400).json({
          success: false,
          message: "Angkatan harus berupa angka antara 2000–2100",
        });
      }

      angkatan = Number(angkatanQuery);
    }

    const data = await getAllMahasiswa(
      typeof prodi === "string" ? prodi : undefined,
      angkatan,
    );

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diambil",
      data: { total: data.length, data },
    });
  } catch (error) {
    next(error);
  }
}

export async function detailMahasiswa(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await getMahasiswaByNim(getNim(req));

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail mahasiswa berhasil diambil",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function addMahasiswa(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body: unknown = req.body;

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        message: "Body harus berupa object JSON",
      });
    }

    const { nim, nama, prodi, angkatan } = body as Record<string, unknown>;

    if (
      !isNonEmptyString(nim) ||
      !isNonEmptyString(nama) ||
      !isNonEmptyString(prodi) ||
      !isValidAngkatan(angkatan)
    ) {
      return res.status(400).json({
        success: false,
        message: "NIM, nama, prodi wajib berupa teks dan angkatan harus angka bulat 2000–2100",
      });
    }

    const data = await createMahasiswa({
      nim: nim.trim(),
      nama: nama.trim(),
      prodi: prodi.trim(),
      angkatan,
    });

    return res.status(201).json({
      success: true,
      message: "Mahasiswa berhasil ditambahkan",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function editMahasiswa(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body: unknown = req.body;

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        message: "Body harus berupa object JSON",
      });
    }

    const input = body as Record<string, unknown>;
    const allowedFields = ["nama", "prodi", "angkatan"];

    if (Object.keys(input).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal satu field harus diisi",
      });
    }

    if (Object.keys(input).some((key) => !allowedFields.includes(key))) {
      return res.status(400).json({
        success: false,
        message: "Field yang diizinkan hanya nama, prodi, dan angkatan",
      });
    }

    const data: {
      nama?: string;
      prodi?: string;
      angkatan?: number;
    } = {};

    if ("nama" in input) {
      if (!isNonEmptyString(input.nama)) {
        return res.status(400).json({
          success: false,
          message: "Nama harus berupa teks dan tidak boleh kosong",
        });
      }
      data.nama = input.nama.trim();
    }

    if ("prodi" in input) {
      if (!isNonEmptyString(input.prodi)) {
        return res.status(400).json({
          success: false,
          message: "Prodi harus berupa teks dan tidak boleh kosong",
        });
      }
      data.prodi = input.prodi.trim();
    }

    if ("angkatan" in input) {
      if (!isValidAngkatan(input.angkatan)) {
        return res.status(400).json({
          success: false,
          message: "Angkatan harus berupa angka bulat 2000–2100",
        });
      }
      data.angkatan = input.angkatan;
    }

    const nim = getNim(req);
    const existing = await getMahasiswaByNim(nim);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    const updated = await updateMahasiswa(nim, data);

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeMahasiswa(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const nim = getNim(req);
    const existing = await getMahasiswaByNim(nim);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    await deleteMahasiswa(nim);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
