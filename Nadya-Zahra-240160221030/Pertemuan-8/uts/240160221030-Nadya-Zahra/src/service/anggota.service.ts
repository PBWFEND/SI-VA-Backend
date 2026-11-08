
import { prisma } from "../../client.ts";
import { NotFoundError, ConflictError } from "./absensi.service.ts";

// DTO untuk menambahkan anggota
export interface CreateAnggotaDTO {
  id_anggota: string;
  nama: string;
  nim: string;
  jabatan: string;
}

// DTO untuk memperbarui anggota
export interface UpdateAnggotaDTO {
  nama?: string;
  nim?: string;
  jabatan?: string;
}

// GET semua anggota beserta data absensinya
export const findAll = async () => {
  return await prisma.anggota.findMany({
    include: {
      absensi: true,
    },
    orderBy: {
      nama: "asc",
    },
  });
};

// GET anggota berdasarkan ID beserta data absensinya
export const findById = async (id: string) => {
  const anggota = await prisma.anggota.findUnique({
    where: {
      id_anggota: id,
    },
    include: {
      absensi: true,
    },
  });

  if (!anggota) {
    throw new NotFoundError(
      `Anggota dengan ID '${id}' tidak ditemukan`
    );
  }

  return anggota;
};

// POST menambahkan anggota
export const create = async (data: CreateAnggotaDTO) => {
  try {
    return await prisma.anggota.create({
      data: {
        id_anggota: data.id_anggota.trim(),
        nama: data.nama.trim(),
        nim: data.nim.trim(),
        jabatan: data.jabatan.trim(),
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new ConflictError(
        "ID anggota atau NIM sudah terdaftar"
      );
    }

    throw error;
  }
};

// PATCH memperbarui anggota
export const update = async (
  id: string,
  data: UpdateAnggotaDTO
) => {
  const updateData: UpdateAnggotaDTO = {};

  if (data.nama !== undefined) {
    updateData.nama = data.nama.trim();
  }

  if (data.nim !== undefined) {
    updateData.nim = data.nim.trim();
  }

  if (data.jabatan !== undefined) {
    updateData.jabatan = data.jabatan.trim();
  }

  try {
    return await prisma.anggota.update({
      where: {
        id_anggota: id,
      },
      data: updateData,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error
    ) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2025") {
        throw new NotFoundError(
          `Anggota dengan ID '${id}' tidak ditemukan`
        );
      }

      if (prismaError.code === "P2002") {
        throw new ConflictError(
          "NIM sudah digunakan anggota lain"
        );
      }
    }

    throw error;
  }
};

// DELETE menghapus anggota
export const deleteAnggota = async (id: string) => {
  try {
    return await prisma.anggota.delete({
      where: {
        id_anggota: id,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error
    ) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2025") {
        throw new NotFoundError(
          `Anggota dengan ID '${id}' tidak ditemukan`
        );
      }

      if (prismaError.code === "P2003") {
        throw new ConflictError(
          "Anggota tidak dapat dihapus karena masih memiliki data absensi"
        );
      }
    }

    throw error;
  }
};

// Alias delete
export { deleteAnggota as delete };

// Bundle service Anggota
export const anggotaService = {
  findAll,
  findById,
  create,
  update,
  delete: deleteAnggota,
};

export default anggotaService;
