import { prisma } from "../client.ts";

export class NotFoundError extends Error {
  readonly statusCode: number = 404;
  constructor(message: string = "Data absensi tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

export interface AbsensiFilter {
  nim?: string;
  status?: string;
  tanggal?: string;
}

export interface CreateAbsensiDTO {
  nim: string;
  namaMahasiswa: string;
  tanggal: Date;
  waktuMasuk?: string | null;
  status: string;
  keterangan?: string | null;
}

export interface UpdateAbsensiDTO {
  nim?: string;
  namaMahasiswa?: string;
  tanggal?: Date;
  waktuMasuk?: string | null;
  status?: string;
  keterangan?: string | null;
}

export async function ambilSemuaAbsensi(filters?: AbsensiFilter) {
  const where: Record<string, unknown> = {};

  if (filters?.nim) {
    where["nim"] = filters.nim;
  }

  if (filters?.status) {
    where["status"] = filters.status;
  }

  if (filters?.tanggal) {
    const searchDate = new Date(filters.tanggal);
    if (!isNaN(searchDate.getTime())) {
      const startOfDay = new Date(searchDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where["tanggal"] = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
  }

  return await prisma.absensi.findMany({
    where,
    orderBy: { id: "asc" },
  });
}

export async function ambilAbsensiById(id: number) {
  const data = await prisma.absensi.findUnique({
    where: { id },
  });

  if (!data) {
    throw new NotFoundError(`Data absensi dengan ID ${id} tidak ditemukan`);
  }

  return data;
}

export async function tambahAbsensi(payload: CreateAbsensiDTO) {
  return await prisma.absensi.create({
    data: payload,
  });
}

export async function ubahAbsensi(id: number, payload: UpdateAbsensiDTO) {
  // Verifikasi keberadaan data terlebih dahulu
  await ambilAbsensiById(id);

  return await prisma.absensi.update({
    where: { id },
    data: payload,
  });
}

export async function hapusAbsensi(id: number) {
  // Verifikasi keberadaan data terlebih dahulu
  await ambilAbsensiById(id);

  return await prisma.absensi.delete({
    where: { id },
  });
}

export const absensiService = {
  findAll: ambilSemuaAbsensi,
  findById: ambilAbsensiById,
  create: tambahAbsensi,
  update: ubahAbsensi,
  delete: hapusAbsensi,
};

export default absensiService;

