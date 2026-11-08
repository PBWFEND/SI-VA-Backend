import type { Request, Response, NextFunction } from "express";
import {
  ambilSemuaAbsensi,
  ambilAbsensiById,
  tambahAbsensi,
  ubahAbsensi,
  hapusAbsensi,
  NotFoundError,
  type CreateAbsensiDTO,
  type UpdateAbsensiDTO,
  type AbsensiFilter,
} from "../service/absensi.service.ts";

const STATUS_VALID = ["Hadir", "Izin", "Sakit", "Alpa"] as const;
const ALLOWED_FIELDS = [
  "nim",
  "namaMahasiswa",
  "tanggal",
  "waktuMasuk",
  "status",
  "keterangan",
];

function validasiId(paramId: unknown): number | null {
  if (typeof paramId !== "string" || paramId.trim() === "") {
    return null;
  }
  const nilai = Number(paramId);
  return Number.isInteger(nilai) && nilai > 0 ? nilai : null;
}

export async function getAllAbsensi(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { nim, status, tanggal } = req.query;
    const filters: AbsensiFilter = {};

    if (nim !== undefined) {
      if (typeof nim !== "string" || nim.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Parameter filter 'nim' harus berupa string yang tidak kosong",
        });
      }
      filters.nim = nim.trim();
    }

    if (status !== undefined) {
      if (typeof status !== "string" || !STATUS_VALID.includes(status as any)) {
        return res.status(400).json({
          success: false,
          message: `Parameter filter 'status' harus salah satu dari: ${STATUS_VALID.join(", ")}`,
        });
      }
      filters.status = status;
    }

    if (tanggal !== undefined) {
      if (typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
        return res.status(400).json({
          success: false,
          message: "Parameter filter 'tanggal' harus berupa format tanggal yang valid (misal YYYY-MM-DD)",
        });
      }
      filters.tanggal = tanggal;
    }

    const data = await ambilSemuaAbsensi(filters);

    return res.status(200).json({
      success: true,
      message: "Daftar absensi berhasil diambil",
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAbsensiById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validasiId(req.params["id"]);
    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID absensi harus berupa bilangan bulat positif",
      });
    }

    const data = await ambilAbsensiById(id);

    return res.status(200).json({
      success: true,
      message: "Detail absensi berhasil diambil",
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
}

export async function postAbsensi(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    // Periksa field yang tidak dikenal
    const unknownKeys = Object.keys(req.body).filter(
      (k) => !ALLOWED_FIELDS.includes(k)
    );
    if (unknownKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field tidak dikenal: ${unknownKeys.join(", ")}`,
      });
    }

    const { nim, namaMahasiswa, tanggal, waktuMasuk, status, keterangan } =
      req.body;

    // Validasi field wajib
    if (typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' wajib diisi berupa string",
      });
    }

    if (typeof namaMahasiswa !== "string" || namaMahasiswa.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'namaMahasiswa' wajib diisi berupa string",
      });
    }

    if (typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
      return res.status(400).json({
        success: false,
        message: "Field 'tanggal' wajib diisi berupa tanggal yang valid (misal: 2026-11-02)",
      });
    }

    if (
      typeof status !== "string" ||
      !STATUS_VALID.includes(status as any)
    ) {
      return res.status(400).json({
        success: false,
        message: `Field 'status' wajib salah satu dari: ${STATUS_VALID.join(", ")}`,
      });
    }

    // Validasi field opsional
    if (
      waktuMasuk !== undefined &&
      waktuMasuk !== null &&
      (typeof waktuMasuk !== "string" || waktuMasuk.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Field 'waktuMasuk' harus berupa string yang tidak kosong jika dikirim",
      });
    }

    if (
      keterangan !== undefined &&
      keterangan !== null &&
      typeof keterangan !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Field 'keterangan' harus berupa string jika dikirim",
      });
    }

    const payload: CreateAbsensiDTO = {
      nim: nim.trim(),
      namaMahasiswa: namaMahasiswa.trim(),
      tanggal: new Date(tanggal),
      waktuMasuk: waktuMasuk ? waktuMasuk.trim() : null,
      status: status.trim(),
      keterangan: keterangan !== undefined && keterangan !== null ? keterangan.trim() : null,
    };

    const data = await tambahAbsensi(payload);

    return res.status(201).json({
      success: true,
      message: "Data absensi berhasil ditambahkan",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function patchAbsensi(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validasiId(req.params["id"]);
    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID absensi harus berupa bilangan bulat positif",
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body tidak boleh kosong. Minimal satu field harus disertakan untuk pembaruan",
      });
    }

    // Validasi field yang tidak dikenal
    const unknownKeys = bodyKeys.filter((k) => !ALLOWED_FIELDS.includes(k));
    if (unknownKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field tidak dikenal: ${unknownKeys.join(", ")}`,
      });
    }

    const { nim, namaMahasiswa, tanggal, waktuMasuk, status, keterangan } =
      req.body;
    const payload: UpdateAbsensiDTO = {};

    if (nim !== undefined) {
      if (typeof nim !== "string" || nim.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'nim' harus berupa string yang tidak kosong",
        });
      }
      payload.nim = nim.trim();
    }

    if (namaMahasiswa !== undefined) {
      if (typeof namaMahasiswa !== "string" || namaMahasiswa.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Field 'namaMahasiswa' harus berupa string yang tidak kosong",
        });
      }
      payload.namaMahasiswa = namaMahasiswa.trim();
    }

    if (tanggal !== undefined) {
      if (typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
        return res.status(400).json({
          success: false,
          message: "Field 'tanggal' harus berupa tanggal yang valid",
        });
      }
      payload.tanggal = new Date(tanggal);
    }

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !STATUS_VALID.includes(status as any)
      ) {
        return res.status(400).json({
          success: false,
          message: `Field 'status' harus salah satu dari: ${STATUS_VALID.join(", ")}`,
        });
      }
      payload.status = status.trim();
    }

    if (waktuMasuk !== undefined) {
      if (
        waktuMasuk !== null &&
        (typeof waktuMasuk !== "string" || waktuMasuk.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Field 'waktuMasuk' harus berupa string yang tidak kosong atau null",
        });
      }
      payload.waktuMasuk = waktuMasuk ? waktuMasuk.trim() : null;
    }

    if (keterangan !== undefined) {
      if (keterangan !== null && typeof keterangan !== "string") {
        return res.status(400).json({
          success: false,
          message: "Field 'keterangan' harus berupa string atau null",
        });
      }
      payload.keterangan = keterangan !== null ? keterangan.trim() : null;
    }

    const data = await ubahAbsensi(id, payload);

    return res.status(200).json({
      success: true,
      message: "Data absensi berhasil diperbarui",
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
}

export async function deleteAbsensi(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validasiId(req.params["id"]);
    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "ID absensi harus berupa bilangan bulat positif",
      });
    }

    await hapusAbsensi(id);

    // 204 No Content tanpa response body
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
}

export const absensiController = {
  getAll: getAllAbsensi,
  getById: getAbsensiById,
  create: postAbsensi,
  update: patchAbsensi,
  delete: deleteAbsensi,
};

export default absensiController;

