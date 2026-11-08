import { prisma } from "../../client.ts";

/**
 * Custom Error untuk data yang tidak ditemukan (HTTP 404).
 */
export class NotFoundError extends Error {
  readonly statusCode: number = 404;
  readonly code: string = "NOT_FOUND";

  constructor(message: string = "Data buku tidak ditemukan") {
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

  constructor(message: string = "Data buku sudah terdaftar") {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Data Transfer Object untuk penambahan buku baru.
 */
export interface CreateBukuDTO {
  judul: string;
  penulis: string;
  tahun: number;
  stok: number;
}

/**
 * Data Transfer Object untuk pembaruan data buku.
 */
export interface UpdateBukuDTO {
  judul?: string;
  penulis?: string;
  tahun?: number;
  stok?: number;
}

/**
 * Mengambil semua data buku.
 */
export const findAll = async () => {
  return await prisma.buku.findMany({
    orderBy: {
      judul: "asc",
    },
  });
};

/**
 * Mengambil satu data buku berdasarkan ID.
 * Melempar NotFoundError jika data tidak ditemukan.
 */
export const findById = async (id: number) => {
  const buku = await prisma.buku.findUnique({
    where: {
      id,
    },
  });

  if (!buku) {
    throw new NotFoundError(
      `Data buku dengan ID '${id}' tidak ditemukan`
    );
  }

  return buku;
};

/**
 * Menambahkan data buku baru ke database.
 */
export const create = async (data: CreateBukuDTO) => {
  try {
    return await prisma.buku.create({
      data: {
        judul: data.judul.trim(),
        penulis: data.penulis.trim(),
        tahun: data.tahun,
        stok: data.stok,
      },
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2002") {
        throw new ConflictError("Data buku sudah terdaftar");
      }
    }

    throw error;
  }
};

/**
 * Memperbarui data buku berdasarkan ID.
 * Melempar NotFoundError jika data tidak ditemukan (P2025).
 */
export const update = async (id: number, data: UpdateBukuDTO) => {
  const updateData: UpdateBukuDTO = {};

  if (data.judul !== undefined) {
    updateData.judul = data.judul.trim();
  }

  if (data.penulis !== undefined) {
    updateData.penulis = data.penulis.trim();
  }

  if (data.tahun !== undefined) {
    updateData.tahun = data.tahun;
  }

  if (data.stok !== undefined) {
    updateData.stok = data.stok;
  }

  try {
    return await prisma.buku.update({
      where: {
        id,
      },
      data: updateData,
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2025") {
        throw new NotFoundError(
          `Data buku dengan ID '${id}' tidak ditemukan`
        );
      }
    }

    throw error;
  }
};

/**
 * Menghapus data buku berdasarkan ID.
 * Melempar NotFoundError jika ID tidak ditemukan (P2025).
 */
export const deleteBuku = async (id: number) => {
  try {
    return await prisma.buku.delete({
      where: {
        id,
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
        `Data buku dengan ID '${id}' tidak ditemukan`
      );
    }

    throw error;
  }
};

export { deleteBuku as delete };

/**
 * Bundle service object untuk kemudahan import.
 */
export const bukuService = {
  findAll,
  findById,
  create,
  update,
  delete: deleteBuku,
};

export default bukuService;