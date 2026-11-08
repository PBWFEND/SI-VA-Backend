import { prisma } from "../../client.ts";
import { NotFoundError, ConflictError } from "./buku.service.ts";

// DTO untuk menambahkan anggota
export interface CreateAnggotaDTO {
  nama: string;
  nim: string;
  jurusan: string;
}

// DTO untuk memperbarui anggota
export interface UpdateAnggotaDTO {
  nama?: string;
  nim?: string;
  jurusan?: string;
}

// GET semua anggota
export const findAll = async () => {
  return await prisma.anggota.findMany({
    orderBy: {
      nama: "asc",
    },
  });
};

// GET anggota berdasarkan ID
export const findById = async (id: number) => {
  const anggota = await prisma.anggota.findUnique({
    where: {
      id,
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
        nama: data.nama.trim(),
        nim: data.nim.trim(),
        jurusan: data.jurusan.trim(),
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new ConflictError("NIM sudah terdaftar");
    }

    throw error;
  }
};

// PATCH memperbarui anggota
export const update = async (
  id: number,
  data: UpdateAnggotaDTO
) => {
  const updateData: UpdateAnggotaDTO = {};

  if (data.nama !== undefined) {
    updateData.nama = data.nama.trim();
  }

  if (data.nim !== undefined) {
    updateData.nim = data.nim.trim();
  }

  if (data.jurusan !== undefined) {
    updateData.jurusan = data.jurusan.trim();
  }

  try {
    return await prisma.anggota.update({
      where: {
        id,
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
        throw new ConflictError("NIM sudah digunakan anggota lain");
      }
    }

    throw error;
  }
};

// DELETE menghapus anggota
export const deleteAnggota = async (id: number) => {
  try {
    return await prisma.anggota.delete({
      where: {
        id,
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