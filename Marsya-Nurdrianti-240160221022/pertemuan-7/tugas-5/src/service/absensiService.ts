
import { prisma } from "../client.ts";

export async function ambilSemuaAbsensi() {
  return await prisma.absensi.findMany({
    include: { anggota: true },
    orderBy: { tanggal: "desc" },
  });
}

export async function ambilAbsensiById(id: number) {
  return await prisma.absensi.findUnique({
    where: { id },
    include: { anggota: true },
  });
}

export async function tambahAbsensi(data: {
  anggotaId: number;
  tanggal: Date;
  waktuMasuk?: string | null;
  status: string;
  keterangan?: string | null;
}) {
  return await prisma.absensi.create({
    data,
    include: { anggota: true },
  });
}

export async function ubahAbsensi(
  id: number,
  data: {
    anggotaId?: number;
    tanggal?: Date;
    waktuMasuk?: string | null;
    status?: string;
    keterangan?: string | null;
  }
) {
  return await prisma.absensi.update({
    where: { id },
    data,
    include: { anggota: true },
  });
}

export async function hapusAbsensi(id: number) {
  return await prisma.absensi.delete({
    where: { id },
  });
}
