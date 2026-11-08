
import { prisma } from "../../client.ts";


/**
 * Custom Error untuk data yang tidak ditemukan (HTTP 404).
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
 * Custom Error untuk konflik data unik / duplikasi (HTTP 409).
 */
export class ConflictError extends Error {
  readonly statusCode: number = 409;
  readonly code: string = "CONFLICT";

  constructor(message: string = "ID absensi sudah terdaftar") {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Filter opsi pencarian daftar absensi.
 */
export interface AbsensiFilter {
  status?: string;
  kegiatan?: string;
}

/**
 * Data Transfer Object untuk penambahan absensi baru.
 */
export interface CreateAbsensiDTO {
  id_absensi: string;
  id_anggota: string;
  kegiatan: string;
  tanggal: string;
  status: string;
}

/**
 * Data Transfer Object untuk pembaruan data absensi.
 */
export interface UpdateAbsensiDTO {
  id_anggota?: string;
  kegiatan?: string;
  tanggal?: string;
  status?: string;
}

/**
 * Mengambil semua data absensi dengan opsi filter status dan kegiatan.
 */
export const findAll = async (filters?: AbsensiFilter) => {
  const where: {
    status?: string;
    kegiatan?: { contains: string };
  } = {};

  if (filters?.status !== undefined && filters.status.trim() !== "") {
    where.status = filters.status.trim();
  }

  if (filters?.kegiatan !== undefined && filters.kegiatan.trim() !== "") {
    where.kegiatan = {
      contains: filters.kegiatan.trim(),
    };
  }

  return await prisma.absensi.findMany({
    where,
    include: {
      anggota: true,
    },
    orderBy: {
      tanggal: "desc",
    },
  });
};

/**
 * Mengambil satu data absensi berdasarkan ID.
 * Melempar NotFoundError jika data tidak ditemukan.
 */
export const findById = async (id: string) => {
  const absensi = await prisma.absensi.findUnique({
    where: {
      id_absensi: id,
    },
    include: {
      anggota: true,
    },
  });

  if (!absensi) {
    throw new NotFoundError(
      `Data absensi dengan ID '${id}' tidak ditemukan`
    );
  }

  return absensi;
};

/**
 * Menambahkan data absensi baru ke database.
 * Melempar ConflictError jika ID absensi sudah terdaftar (P2002).
 * Melempar NotFoundError jika anggota tidak ditemukan (P2003).
 */
export const create = async (data: CreateAbsensiDTO) => {
  try {
    return await prisma.absensi.create({
      data: {
        id_absensi: data.id_absensi.trim(),
        id_anggota: data.id_anggota.trim(),
        kegiatan: data.kegiatan.trim(),
        tanggal: data.tanggal,
        status: data.status,
      },
      include: {
        anggota: true,
      },
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2002") {
        throw new ConflictError(
          `ID absensi '${data.id_absensi}' sudah terdaftar`
        );
      }

      if (prismaError.code === "P2003") {
        throw new NotFoundError(
          `Anggota dengan ID '${data.id_anggota}' tidak ditemukan`
        );
      }
    }

    throw error;
  }
};

/**
 * Memperbarui data absensi berdasarkan ID.
 * Melempar NotFoundError jika data tidak ditemukan (P2025).
 */
export const update = async (id: string, data: UpdateAbsensiDTO) => {
  const updateData: {
    id_anggota?: string;
    kegiatan?: string;
    tanggal?: string;
    status?: string;
  } = {};

  if (data.id_anggota !== undefined) {
    updateData.id_anggota = data.id_anggota.trim();
  }

  if (data.kegiatan !== undefined) {
    updateData.kegiatan = data.kegiatan.trim();
  }

  if (data.tanggal !== undefined) {
    updateData.tanggal = data.tanggal;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  try {
    return await prisma.absensi.update({
      where: {
        id_absensi: id,
      },
      data: updateData,
      include: {
        anggota: true,
      },
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2025") {
        throw new NotFoundError(
          `Data absensi dengan ID '${id}' tidak ditemukan`
        );
      }

      if (prismaError.code === "P2003") {
        throw new NotFoundError("Anggota yang dipilih tidak ditemukan");
      }
    }

    throw error;
  }
};

/**
 * Menghapus data absensi berdasarkan ID.
 * Melempar NotFoundError jika ID tidak ditemukan (P2025).
 */
export const deleteAbsensi = async (id: string) => {
  try {
    return await prisma.absensi.delete({
      where: {
        id_absensi: id,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      throw new NotFoundError(
        `Data absensi dengan ID '${id}' tidak ditemukan`
      );
    }

    throw error;
  }
};

export { deleteAbsensi as delete };

/**
 * Bundle service object untuk kemudahan import.
 */
export const absensiService = {
  findAll,
  findById,
  create,
  update,
  delete: deleteAbsensi,
};

export default absensiService;
