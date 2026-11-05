import { prisma } from "../config/client.ts";

export class AbsensiNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message: string = "Data absensi tidak ditemukan") {
    super(message);
    this.name = "AbsensiNotFoundError";
  }
}

export interface AbsensiDTO {
  nim: string;
  namaMahasiswa: string;
  kelas: string;
  status: string;
  tanggal?: Date;
  keterangan?: string | null;
}

export interface FindAllOptions {
  nim?: string;
  status?: string;
  search?: string;
}

export const findAll = async (options: FindAllOptions = {}) => {
  const where: any = {};

  // Filter kepemilikan NIM (dipakai jika role MAHASISWA)
  if (options.nim) {
    where.nim = options.nim.trim();
  }

  // Filter status absensi jika diberikan
  if (options.status) {
    where.status = options.status.trim().toUpperCase();
  }

  // Parameterized search: Prisma otomatis mengikat nilai pencarian sebagai literal string (anti-SQLi)
  if (options.search && options.search.trim() !== "") {
    const term = options.search.trim();
    where.OR = [
      { namaMahasiswa: { contains: term } },
      { nim: { contains: term } },
      { kelas: { contains: term } },
      { status: { contains: term } },
    ];
  }

  return await prisma.absensi.findMany({
    where,
    orderBy: { id: "desc" },
  });
};

export const findById = async (id: number) => {
  const data = await prisma.absensi.findUnique({ where: { id } });
  if (!data) {
    throw new AbsensiNotFoundError(`Data absensi dengan ID ${id} tidak ditemukan`);
  }
  return data;
};

export const create = async (data: AbsensiDTO) => {
  return await prisma.absensi.create({
    data: {
      nim: data.nim.trim(),
      namaMahasiswa: data.namaMahasiswa.trim(),
      kelas: data.kelas.trim(),
      status: data.status.trim().toUpperCase(),
      tanggal: data.tanggal ?? new Date(),
      keterangan: data.keterangan ? data.keterangan.trim() : null,
    },
  });
};

export const update = async (id: number, data: Partial<AbsensiDTO>) => {
  await findById(id);
  const updateData: any = {};
  if (data.nim !== undefined) updateData.nim = data.nim.trim();
  if (data.namaMahasiswa !== undefined) updateData.namaMahasiswa = data.namaMahasiswa.trim();
  if (data.kelas !== undefined) updateData.kelas = data.kelas.trim();
  if (data.status !== undefined) updateData.status = data.status.trim().toUpperCase();
  if (data.tanggal !== undefined) updateData.tanggal = data.tanggal;
  if (data.keterangan !== undefined) updateData.keterangan = data.keterangan ? data.keterangan.trim() : null;

  return await prisma.absensi.update({
    where: { id },
    data: updateData,
  });
};

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

