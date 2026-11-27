import { prisma } from "../config/client.ts";

export class MahasiswaNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message: string = "Data mahasiswa tidak ditemukan") {
    super(message);
    this.name = "MahasiswaNotFoundError";
  }
}

export interface MahasiswaDTO {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

export const findAll = async (search?: string) => {
  const where: any = {};
  if (search && search.trim() !== "") {
    // Parameterized search: Prisma otomatis mengikat (bind) nilai search sebagai literal
    // sehingga payload SQLi seperti "' OR '1'='1" tidak akan mengubah struktur query SQL
    where.OR = [
      { nama: { contains: search.trim() } },
      { nim: { contains: search.trim() } },
      { prodi: { contains: search.trim() } },
    ];
  }

  return await prisma.mahasiswa.findMany({
    where,
    orderBy: { id: "asc" },
  });
};

export const findById = async (id: number) => {
  const data = await prisma.mahasiswa.findUnique({ where: { id } });
  if (!data) {
    throw new MahasiswaNotFoundError(`Mahasiswa dengan ID ${id} tidak ditemukan`);
  }
  return data;
};

export const create = async (data: MahasiswaDTO) => {
  return await prisma.mahasiswa.create({
    data: {
      nim: data.nim.trim(),
      nama: data.nama.trim(),
      prodi: data.prodi.trim(),
      angkatan: data.angkatan,
    },
  });
};

export const update = async (id: number, data: Partial<MahasiswaDTO>) => {
  await findById(id);
  const updateData: any = {};
  if (data.nim !== undefined) updateData.nim = data.nim.trim();
  if (data.nama !== undefined) updateData.nama = data.nama.trim();
  if (data.prodi !== undefined) updateData.prodi = data.prodi.trim();
  if (data.angkatan !== undefined) updateData.angkatan = data.angkatan;

  return await prisma.mahasiswa.update({
    where: { id },
    data: updateData,
  });
};

export const deleteById = async (id: number) => {
  await findById(id);
  return await prisma.mahasiswa.delete({ where: { id } });
};

export const mahasiswaService = {
  findAll,
  findById,
  create,
  update,
  deleteById,
};

export default mahasiswaService;

