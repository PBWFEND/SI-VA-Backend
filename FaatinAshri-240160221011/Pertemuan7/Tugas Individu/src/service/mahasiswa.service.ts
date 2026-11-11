import { prisma } from "../../client.ts";

export async function getAllMahasiswa(prodi?: string, angkatan?: number) {
  return prisma.mahasiswa.findMany({
    where: {
      ...(prodi ? { prodi } : {}),
      ...(angkatan ? { angkatan } : {}),
    },
    orderBy: {
      nim: "asc",
    },
  });
}

export async function getMahasiswaByNim(nim: string) {
  return prisma.mahasiswa.findUnique({
    where: { nim },
  });
}

export async function createMahasiswa(data: {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}) {
  return prisma.mahasiswa.create({
    data,
  });
}

export async function updateMahasiswa(
  nim: string,
  data: {
    nama?: string;
    prodi?: string;
    angkatan?: number;
  },
) {
  return prisma.mahasiswa.update({
    where: { nim },
    data,
  });
}

export async function deleteMahasiswa(nim: string) {
  return prisma.mahasiswa.delete({
    where: { nim },
  });
}
