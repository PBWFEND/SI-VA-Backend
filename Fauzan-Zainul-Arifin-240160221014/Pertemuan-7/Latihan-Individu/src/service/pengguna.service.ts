import { prisma } from "../../client.ts";

/**
 * Custom Error untuk resource yang tidak ditemukan (HTTP 404).
 */
export class NotFoundError extends Error {
  readonly statusCode: number = 404;
  readonly code: string = "NOT_FOUND";

  constructor(message: string = "Pengguna tidak ditemukan") {
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

  constructor(message: string = "NIM atau email sudah terdaftar") {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Data Transfer Object untuk penambahan pengguna baru.
 */
export interface CreatePenggunaDTO {
  nim: string;
  nama: string;
  email: string;
  role?: string;
}

/**
 * Mengambil daftar pengguna dengan filter NIM opsional.
 * TODO 1: Implementasi menggunakan prisma.pengguna.findMany.
 */
export const ambilDaftarPengguna = async (nim?: string) => {
  return await prisma.pengguna.findMany({
    where: nim ? { nim } : undefined,
    orderBy: { nim: "asc" },
  });
};

/**
 * Mengambil detail satu pengguna berdasarkan NIM.
 */
export const ambilPenggunaBerdasarkanNim = async (nim: string) => {
  const pengguna = await prisma.pengguna.findUnique({
    where: { nim },
  });

  if (!pengguna) {
    throw new NotFoundError("Pengguna tidak ditemukan");
  }

  return pengguna;
};

/**
 * Membuat pengguna baru di database.
 * TODO 2: Operasi database menggunakan prisma.pengguna.create.
 * Validasi input dipisahkan pada lapisan controller / validator.
 */
export const buatPengguna = async (data: CreatePenggunaDTO) => {
  try {
    const penggunaBaru = await prisma.pengguna.create({
      data: {
        nim: data.nim,
        nama: data.nama,
        email: data.email,
        role: data.role ?? "mahasiswa",
      },
    });

    return penggunaBaru;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new ConflictError("NIM atau email sudah terdaftar");
    }
    throw error;
  }
};

/**
 * Menghapus pengguna berdasarkan NIM.
 * TODO 4: Operasi hapus di service, melempar NotFoundError bila tidak ditemukan.
 */
export const hapusPengguna = async (nim: string) => {
  const pengguna = await prisma.pengguna.findUnique({
    where: { nim },
  });

  if (!pengguna) {
    throw new NotFoundError("Pengguna tidak ditemukan");
  }

  await prisma.pengguna.delete({
    where: { nim },
  });

  return true;
};

export const penggunaService = {
  ambilDaftarPengguna,
  ambilPenggunaBerdasarkanNim,
  buatPengguna,
  hapusPengguna,
};

export default penggunaService;

