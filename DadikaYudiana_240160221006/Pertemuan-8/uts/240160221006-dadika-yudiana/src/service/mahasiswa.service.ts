
import { prisma } from "../config/client.ts";

// Custom error untuk data mahasiswa yang tidak ditemukan
export class NotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";

  constructor(message = "Data mahasiswa tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

// Custom error untuk data yang mengalami duplikasi
export class ConflictError extends Error {
  readonly statusCode = 409;
  readonly code = "CONFLICT";

  constructor(message = "NIM telah digunakan") {
    super(message);
    this.name = "ConflictError";
  }
}

// Tipe filter pencarian mahasiswa
export interface MahasiswaFilter {
  prodi?: string;
  angkatan?: number;
}

// Tipe data untuk pendaftaran mahasiswa
export interface CreateMahasiswaDTO {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

// Tipe data untuk proses perubahan mahasiswa
export interface UpdateMahasiswaDTO {
  nama?: string;
  prodi?: string;
  angkatan?: number;
}

// Mengambil daftar mahasiswa dengan filter opsional
export const findAll = async (filters?: MahasiswaFilter) => {
  const conditions: { prodi?: string; angkatan?: number } = {};

  const programStudi = filters?.prodi?.trim();

  if (programStudi) {
    conditions.prodi = programStudi;
  }

  if (filters?.angkatan !== undefined) {
    conditions.angkatan = filters.angkatan;
  }

  return await prisma.mahasiswa.findMany({
    where: conditions,
    orderBy: {
      nim: "asc",
    },
  });
};

// Mengambil satu data mahasiswa berdasarkan NIM
export const findByNim = async (nim: string) => {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { nim },
  });

  if (!mahasiswa) {
    throw new NotFoundError(
      `Data mahasiswa dengan NIM '${nim}' tidak ditemukan`
    );
  }

  return mahasiswa;
};

// Menambahkan mahasiswa baru
export const create = async (data: CreateMahasiswaDTO) => {
  const mahasiswaData = {
    nim: data.nim.trim(),
    nama: data.nama.trim(),
    prodi: data.prodi.trim(),
    angkatan: data.angkatan,
  };

  try {
    return await prisma.mahasiswa.create({
      data: mahasiswaData,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new ConflictError(
        `Mahasiswa dengan NIM '${data.nim}' sudah terdaftar`
      );
    }

    throw error;
  }
};

// Memperbarui informasi mahasiswa berdasarkan NIM
export const update = async (nim: string, data: UpdateMahasiswaDTO) => {
  const changes: UpdateMahasiswaDTO = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (typeof value === "string") {
        changes[key as keyof UpdateMahasiswaDTO] = value.trim();
      } else {
        changes[key as keyof UpdateMahasiswaDTO] = value;
      }
    }
  });

  try {
    return await prisma.mahasiswa.update({
      where: { nim },
      data: changes,
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const code = (error as { code: string }).code;

      if (code === "P2025") {
        throw new NotFoundError(
          `Data mahasiswa dengan NIM '${nim}' tidak ditemukan`
        );
      }

      if (code === "P2002") {
        throw new ConflictError("NIM tersebut sudah terdaftar");
      }
    }

    throw error;
  }
};

// Menghapus data mahasiswa berdasarkan NIM
export const deleteMahasiswa = async (nim: string) => {
  try {
    return await prisma.mahasiswa.delete({
      where: { nim },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      throw new NotFoundError(
        `Data mahasiswa dengan NIM '${nim}' tidak ditemukan`
      );
    }

    throw error;
  }
};

// Alias untuk fungsi penghapusan
export { deleteMahasiswa as delete };

// Kumpulan fungsi service mahasiswa
export const mahasiswaService = {
  findAll,
  findByNim,
  create,
  update,
  delete: deleteMahasiswa,
};

export default mahasiswaService;
