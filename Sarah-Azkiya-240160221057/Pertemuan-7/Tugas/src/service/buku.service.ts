/**
 * Service Layer: Resource Buku
 * Tanggung Jawab: Operasi manipulasi database Prisma & logika bisnis domain.
 * Larangan: Tidak boleh mengakses objek HTTP (req, res), tidak boleh mengetahui status code HTTP.
 */

import { prisma } from "../../client.ts";

export class NotFoundError extends Error {
  readonly statusCode: number = 404;
  readonly code: string = "NOT_FOUND";

  constructor(message: string = "Data buku tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

export interface CreateBukuDTO {
  judul: string;
  penulis: string;
  tahun: number;
  stok: number;
}

export interface UpdateBukuDTO {
  judul?: string;
  penulis?: string;
  tahun?: number;
  stok?: number;
}

export interface FilterBukuQuery {
  penulis?: string;
  tahun?: number;
  minStok?: number;
  q?: string;
}

/**
 * Mengambil seluruh daftar buku dengan dukungan filter query opsional.
 */
export const findAll = async (filter?: FilterBukuQuery) => {
  const where: any = {};

  if (filter?.penulis) {
    where.penulis = { contains: filter.penulis };
  }

  if (filter?.tahun !== undefined) {
    where.tahun = filter.tahun;
  }

  if (filter?.minStok !== undefined) {
    where.stok = { gte: filter.minStok };
  }

  if (filter?.q) {
    where.OR = [
      { judul: { contains: filter.q } },
      { penulis: { contains: filter.q } },
    ];
  }

  return await prisma.buku.findMany({
    where,
    orderBy: { id: "asc" },
  });
};

/**
 * Mengambil detail buku berdasarkan ID.
 * Melempar NotFoundError jika data tidak ditemukan di database.
 */
export const findById = async (id: number) => {
  const buku = await prisma.buku.findUnique({
    where: { id },
  });

  if (!buku) {
    throw new NotFoundError(`Buku dengan ID ${id} tidak ditemukan`);
  }

  return buku;
};

/**
 * Membuat data buku baru di database.
 */
export const create = async (data: CreateBukuDTO) => {
  return await prisma.buku.create({
    data: {
      judul: data.judul.trim(),
      penulis: data.penulis.trim(),
      tahun: data.tahun,
      stok: data.stok,
    },
  });
};

/**
 * Memperbarui data buku parsial.
 * Memastikan data ada terlebih dahulu sebelum melakukan update.
 */
export const update = async (id: number, data: UpdateBukuDTO) => {
  await findById(id);

  const dataUpdate: any = {};
  if (data.judul !== undefined) dataUpdate.judul = data.judul.trim();
  if (data.penulis !== undefined) dataUpdate.penulis = data.penulis.trim();
  if (data.tahun !== undefined) dataUpdate.tahun = data.tahun;
  if (data.stok !== undefined) dataUpdate.stok = data.stok;

  return await prisma.buku.update({
    where: { id },
    data: dataUpdate,
  });
};

/**
 * Menghapus data buku berdasarkan ID.
 * Memastikan data ada terlebih dahulu sebelum menghapus.
 */
export const deleteBuku = async (id: number) => {
  await findById(id);

  await prisma.buku.delete({
    where: { id },
  });
};

export const bukuService = {
  findAll,
  findById,
  create,
  update,
  delete: deleteBuku,
};

export default bukuService;
