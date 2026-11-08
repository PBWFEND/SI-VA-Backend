import { prisma } from "../config/client.ts";

/**
 * Custom Error untuk entitas absensi yang tidak ditemukan (HTTP 404).
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
 * Opsi filter pencarian data absensi.
 */
export interface AbsensiFilter {
  status?: string;
}

/**
 * Data Transfer Object untuk penambahan data absensi baru.
 */
export interface CreateAbsensiDTO {
  nim: string;
  namaMahasiswa: string;
  kelas: string;
  tanggal: string | Date;
  status: string;
  keterangan?: string | null;
}

/**
 * Data Transfer Object untuk pembaruan data absensi.
 */
export interface UpdateAbsensiDTO {
  nim?: string;
  namaMahasiswa?: string;
  kelas?: string;
  tanggal?: string | Date;
  status?: string;
  keterangan?: string | null;
}

/**
 * Mengambil semua data absensi dengan opsi filter status.
 */
export const findAll = async (filters?: AbsensiFilter) => {
  const where: { status?: string } = {};

  if (filters?.status !== undefined && filters.status.trim() !== "") {
    where.status = filters.status.trim();
  }

  return await prisma.absensi.findMany({
    where,
    orderBy: { id: "asc" },
  });
};

/**
 * Mengambil satu catatan absensi berdasarkan ID (primary key).
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
 * Menambahkan data absensi baru ke database.
 */
export const create = async (data: CreateAbsensiDTO) => {
  const parsedDate = typeof data.tanggal === "string" ? new Date(data.tanggal) : data.tanggal;

  return await prisma.absensi.create({
    data: {
      nim: data.nim.trim(),
      namaMahasiswa: data.namaMahasiswa.trim(),
      kelas: data.kelas.trim(),
      tanggal: parsedDate,
      status: data.status.trim(),
      keterangan: data.keterangan !== undefined && data.keterangan !== null ? data.keterangan.trim() : null,
    },
  });
};

/**
 * Memperbarui data absensi secara parsial berdasarkan ID.
 * Melempar NotFoundError jika ID tidak ditemukan.
 */
export const update = async (id: number, data: UpdateAbsensiDTO) => {
  // Pastikan data ada sebelum di-update
  await findById(id);

  const updateData: {
    nim?: string;
    namaMahasiswa?: string;
    kelas?: string;
    tanggal?: Date;
    status?: string;
    keterangan?: string | null;
  } = {};

  if (data.nim !== undefined) {
    updateData.nim = data.nim.trim();
  }
  if (data.namaMahasiswa !== undefined) {
    updateData.namaMahasiswa = data.namaMahasiswa.trim();
  }
  if (data.kelas !== undefined) {
    updateData.kelas = data.kelas.trim();
  }
  if (data.tanggal !== undefined) {
    updateData.tanggal = typeof data.tanggal === "string" ? new Date(data.tanggal) : data.tanggal;
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

