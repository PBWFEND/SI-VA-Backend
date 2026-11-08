
import type { Request, Response, NextFunction } from "express";
import {
  ambilSemuaAbsensi,
  ambilAbsensiById,
  tambahAbsensi,
  ubahAbsensi,
  hapusAbsensi,
} from "../service/absensiService.ts";

const statusValid = ["Hadir", "Izin", "Sakit", "Alpa"];

function validasiId(id: string | string[] | undefined): number | null {
  if (typeof id !== "string") {
    return null;
  }

  const nilai = Number(id);

  return Number.isInteger(nilai) && nilai > 0 ? nilai : null;
}

export async function getSemuaAbsensi(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await ambilSemuaAbsensi();

    res.status(200).json({
      success: true,
      message: "Daftar absensi berhasil diambil",
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
    const id = validasiId(req.params.id);

    if (id === null) {
      res.status(400).json({
        success: false,
        message: "ID absensi harus berupa bilangan bulat positif",
      });
      return;
    }

    const data = await ambilAbsensiById(id);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Data absensi tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Detail absensi berhasil diambil",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function postAbsensi(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { anggotaId, tanggal, waktuMasuk, status, keterangan } = req.body;

    if (
      typeof anggotaId !== "number" ||
      !Number.isInteger(anggotaId) ||
      anggotaId <= 0 ||
      typeof tanggal !== "string" ||
      isNaN(Date.parse(tanggal)) ||
      typeof status !== "string" ||
      !statusValid.includes(status) ||
      (waktuMasuk !== undefined &&
        waktuMasuk !== null &&
        typeof waktuMasuk !== "string") ||
      (keterangan !== undefined &&
        keterangan !== null &&
        typeof keterangan !== "string")
    ) {
      res.status(400).json({
        success: false,
        message: "Input absensi tidak valid",
        details:
          "Periksa anggotaId, tanggal, waktuMasuk, status, dan keterangan",
      });
      return;
    }

    const data = await tambahAbsensi({
      anggotaId,
      tanggal: new Date(tanggal),
      waktuMasuk,
      status,
      keterangan,
    });

    res.status(201).json({
      success: true,
      message: "Absensi berhasil ditambahkan",
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
    const id = validasiId(req.params.id);

    if (id === null) {
      res.status(400).json({
        success: false,
        message: "ID absensi tidak valid",
      });
      return;
    }

    const { anggotaId, tanggal, waktuMasuk, status, keterangan } = req.body;

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body) ||
      Object.keys(req.body).length === 0 ||
      (anggotaId !== undefined &&
        (typeof anggotaId !== "number" ||
          !Number.isInteger(anggotaId) ||
          anggotaId <= 0)) ||
      (tanggal !== undefined &&
        (typeof tanggal !== "string" || isNaN(Date.parse(tanggal)))) ||
      (status !== undefined &&
        (typeof status !== "string" || !statusValid.includes(status))) ||
      (waktuMasuk !== undefined &&
        waktuMasuk !== null &&
        typeof waktuMasuk !== "string") ||
      (keterangan !== undefined &&
        keterangan !== null &&
        typeof keterangan !== "string")
    ) {
      res.status(400).json({
        success: false,
        message: "Data perubahan absensi tidak valid",
      });
      return;
    }

    const data = await ubahAbsensi(id, {
      ...(anggotaId !== undefined && { anggotaId }),
      ...(tanggal !== undefined && { tanggal: new Date(tanggal) }),
      ...(waktuMasuk !== undefined && { waktuMasuk }),
      ...(status !== undefined && { status }),
      ...(keterangan !== undefined && { keterangan }),
    });

    res.status(200).json({
      success: true,
      message: "Absensi berhasil diperbarui",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAbsensi(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validasiId(req.params.id);

    if (id === null) {
      res.status(400).json({
        success: false,
        message: "ID absensi tidak valid",
      });
      return;
    }

    await hapusAbsensi(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
