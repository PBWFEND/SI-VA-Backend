import { prisma } from "../config/client.ts";

/**
 * Custom Error untuk data absensi yang tidak ditemukan (HTTP 404).
 */
export class NotFoundError extends Error {
  readonly statusCode: number = 404;
  readonly code: string = "NOT_FOUND";

  constructor(message: string = "Data absensi tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Filter opsi pencarian daftar data absensi.
 */
export interface AbsensiFilter {
  status?: string;
  nim?: string;
  tanggal?: string;
}

/**
 * Data Transfer Object untuk penambahan data absensi baru.
 */
export interface CreateAbsensiDTO {
  nim: string;
  nama: string;
  tanggal: Date;
  status: string;
  keterangan?: string | null;
}

/**
 * Data Transfer Object untuk pembaruan data absensi.
 */
export interface UpdateAbsensiDTO {
  nim?: string;
  nama?: string;
  tanggal?: Date;
  status?: string;
  keterangan?: string | null;
}

/**
 * Mengambil semua data absensi dengan opsi filter status, nim, dan tanggal.
 */
export const findAll = async (filters?: AbsensiFilter) => {
  const where: { status?: string; nim?: string; tanggal?: { gte?: Date; lte?: Date } } = {};

  if (filters?.status !== undefined && filters.status.trim() !== "") {
    where.status = filters.status.trim();
  }

  if (filters?.nim !== undefined && filters.nim.trim() !== "") {
    where.nim = filters.nim.trim();
  }

  if (filters?.tanggal !== undefined && filters.tanggal.trim() !== "") {
    const parsedDate = new Date(filters.tanggal);
    if (!isNaN(parsedDate.getTime())) {
      // Filter rentang satu hari penuh (00:00:00 s.d. 23:59:59 UTC)
      const startDate = new Date(parsedDate);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(parsedDate);
      endDate.setUTCHours(23, 59, 59, 999);
      where.tanggal = { gte: startDate, lte: endDate };
    }
  }

  return await prisma.absensi.findMany({
    where,
    orderBy: { id: "desc" },
  });
};

/**
 * Mengambil satu data absensi berdasarkan ID.
 * Melempar NotFoundError jika data tidak ditemukan.
 */
export const findById = async (id: number) => {
  const absensi = await prisma.absensi.findUnique({
    where: { id },
  });

  if (!absensi) {
    throw new NotFoundError(`Data absensi dengan ID ${id} tidak ditemukan`);
  }

  return absensi;
};

/**
 * Menambahkan data absensi baru ke basis data.
 */
export const create = async (data: CreateAbsensiDTO) => {
  return await prisma.absensi.create({
    data: {
      nim: data.nim.trim(),
      nama: data.nama.trim(),
      tanggal: data.tanggal,
      status: data.status.trim(),
      keterangan: data.keterangan !== undefined && data.keterangan !== null ? data.keterangan.trim() : null,
    },
  });
};

/**
 * Memperbarui data absensi yang sudah ada berdasarkan ID.
 * Melempar NotFoundError jika data tidak ditemukan.
 */
export const update = async (id: number, data: UpdateAbsensiDTO) => {
  // Verifikasi keberadaan data terlebih dahulu
  await findById(id);

  const updateData: {
    nim?: string;
    nama?: string;
    tanggal?: Date;
    status?: string;
    keterangan?: string | null;
  } = {};

  if (data.nim !== undefined) {
    updateData.nim = data.nim.trim();
  }

  if (data.nama !== undefined) {
    updateData.nama = data.nama.trim();
  }

  if (data.tanggal !== undefined) {
    updateData.tanggal = data.tanggal;
  }

  if (data.status !== undefined) {
    updateData.status = data.status.trim();
  }

  if (data.keterangan !== undefined) {
    updateData.keterangan = data.keterangan !== null ? data.keterangan.trim() : null;
  }

  return await prisma.absensi.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Menghapus data absensi berdasarkan ID.
 * Melempar NotFoundError jika data tidak ditemukan.
 */
export const deleteById = async (id: number) => {
  // Verifikasi keberadaan data terlebih dahulu
  await findById(id);

  return await prisma.absensi.delete({
    where: { id },
  });
};

export const absensiService = {
  findAll,
  findById,
  create,
  update,
  deleteById,
};

export default absensiService;

