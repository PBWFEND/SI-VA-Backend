import { prisma } from "../config/client.ts";

/**
 * Custom Error untuk entitas yang tidak ditemukan (HTTP 404).
 */
export class NotFoundError extends Error {
  readonly statusCode: number = 404;
  readonly code: string = "NOT_FOUND";

  constructor(message: string = "Mahasiswa tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Custom Error untuk konflik data unik / duplikasi (HTTP 409).
 */
export class ConflictError extends Error {
  readonly statusCode: number = 409;
  readonly code: string = "CONFLICT";

  constructor(message: string = "NIM sudah terdaftar") {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Filter opsi pencarian daftar mahasiswa.
 */
export interface MahasiswaFilter {
  prodi?: string;
  angkatan?: number;
}

/**
 * Data Transfer Object untuk penambahan mahasiswa baru.
 */
export interface CreateMahasiswaDTO {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

/**
 * Data Transfer Object untuk pembaruan data mahasiswa.
 */
export interface UpdateMahasiswaDTO {
  nama?: string;
  prodi?: string;
  angkatan?: number;
}

/**
 * Mengambil semua data mahasiswa dengan opsi filter prodi dan angkatan.
 */
export const findAll = async (filters?: MahasiswaFilter) => {
  const where: { prodi?: string; angkatan?: number } = {};

  if (filters?.prodi !== undefined && filters.prodi.trim() !== "") {
    where.prodi = filters.prodi.trim();
  }

  if (filters?.angkatan !== undefined) {
    where.angkatan = filters.angkatan;
  }

  return await prisma.mahasiswa.findMany({
    where,
    orderBy: { nim: "asc" },
  });
};

/**
 * Mengambil satu mahasiswa berdasarkan NIM.
 * Melempar NotFoundError jika data tidak ditemukan.
 */
export const findByNim = async (nim: string) => {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { nim },
  });

  if (!mahasiswa) {
    throw new NotFoundError(`Mahasiswa dengan NIM '${nim}' tidak ditemukan`);
  }

  return mahasiswa;
};

/**
 * Menambahkan data mahasiswa baru ke database.
 * Melempar ConflictError jika terjadi pelanggaran unique constraint pada NIM (P2002).
 */
export const create = async (data: CreateMahasiswaDTO) => {
  try {
    return await prisma.mahasiswa.create({
      data: {
        nim: data.nim.trim(),
        nama: data.nama.trim(),
        prodi: data.prodi.trim(),
        angkatan: data.angkatan,
      },
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      throw new ConflictError(`NIM '${data.nim}' sudah terdaftar`);
    }
    throw error;
  }
};

/**
 * Memperbarui data mahasiswa berdasarkan NIM.
 * Melempar NotFoundError jika NIM tidak ditemukan (P2025).
 * Melempar ConflictError jika terjadi konflik duplikasi (P2002).
 */
export const update = async (nim: string, data: UpdateMahasiswaDTO) => {
  const updateData: { nama?: string; prodi?: string; angkatan?: number } = {};

  if (data.nama !== undefined) {
    updateData.nama = data.nama.trim();
  }
  if (data.prodi !== undefined) {
    updateData.prodi = data.prodi.trim();
  }
  if (data.angkatan !== undefined) {
    updateData.angkatan = data.angkatan;
  }

  try {
    return await prisma.mahasiswa.update({
      where: { nim },
      data: updateData,
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2025") {
        throw new NotFoundError(`Mahasiswa dengan NIM '${nim}' tidak ditemukan`);
      }
      if (prismaError.code === "P2002") {
        throw new ConflictError("NIM sudah terdaftar");
      }
    }
    throw error;
  }
};

/**
 * Menghapus data mahasiswa berdasarkan NIM.
 * Melempar NotFoundError jika NIM tidak ditemukan (P2025).
 */
export const deleteMahasiswa = async (nim: string) => {
  try {
    return await prisma.mahasiswa.delete({
      where: { nim },
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2025") {
      throw new NotFoundError(`Mahasiswa dengan NIM '${nim}' tidak ditemukan`);
    }
    throw error;
  }
};

export { deleteMahasiswa as delete };

/**
 * Bundle service object untuk kemudahan import.
 */
export const mahasiswaService = {
  findAll,
  findByNim,
  create,
  update,
  delete: deleteMahasiswa,
};

export default mahasiswaService;

