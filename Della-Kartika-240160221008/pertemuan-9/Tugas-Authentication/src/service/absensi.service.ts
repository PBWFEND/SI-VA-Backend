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
  tanggal: string | Date;
  status: string;
  keterangan?: string | null;
}

export const findAll = async (statusFilter?: string) => {
  const where: { status?: string } = {};
  if (statusFilter && statusFilter.trim() !== "") {
    where.status = statusFilter.trim();
  }
  return await prisma.absensi.findMany({
    where,
    orderBy: { id: "asc" },
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
  const parsedDate = typeof data.tanggal === "string" ? new Date(data.tanggal) : data.tanggal;
  return await prisma.absensi.create({
    data: {
      nim: data.nim.trim(),
      namaMahasiswa: data.namaMahasiswa.trim(),
      kelas: data.kelas.trim(),
      tanggal: parsedDate,
      status: data.status.trim(),
      keterangan: data.keterangan ? data.keterangan.trim() : null,
    },
  });
};

export const update = async (id: number, data: Partial<AbsensiDTO>) => {
  await findById(id);
  const updatePayload: any = {};
  if (data.nim !== undefined) updatePayload.nim = data.nim.trim();
  if (data.namaMahasiswa !== undefined) updatePayload.namaMahasiswa = data.namaMahasiswa.trim();
  if (data.kelas !== undefined) updatePayload.kelas = data.kelas.trim();
  if (data.tanggal !== undefined) updatePayload.tanggal = typeof data.tanggal === "string" ? new Date(data.tanggal) : data.tanggal;
  if (data.status !== undefined) updatePayload.status = data.status.trim();
  if (data.keterangan !== undefined) updatePayload.keterangan = data.keterangan ? data.keterangan.trim() : null;

  return await prisma.absensi.update({
    where: { id },
    data: updatePayload,
  });
};

export const deleteById = async (id: number) => {
  await findById(id);
  return await prisma.absensi.delete({ where: { id } });
};

export const absensiService = {
  findAll,
  findById,
  create,
  update,
  deleteById,
};
export default absensiService;

