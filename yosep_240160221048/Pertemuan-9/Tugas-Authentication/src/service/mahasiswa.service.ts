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

export const findAll = async () => {
  return await prisma.mahasiswa.findMany({
    orderBy: { id: "asc" },
  });
};

export const findById = async (id: number) => {
  const mhs = await prisma.mahasiswa.findUnique({ where: { id } });
  if (!mhs) {
    throw new MahasiswaNotFoundError(`Mahasiswa dengan ID ${id} tidak ditemukan`);
  }
  return mhs;
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
  return await prisma.mahasiswa.update({
    where: { id },
    data,
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

