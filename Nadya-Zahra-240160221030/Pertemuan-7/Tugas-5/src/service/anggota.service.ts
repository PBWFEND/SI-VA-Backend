
import { prisma } from "../../client.ts";

// Mengambil semua anggota beserta data absensinya
export async function getAllAnggota() {
  return await prisma.anggota.findMany({
    include: { absensi: true },
  });
}

// Mengambil satu anggota berdasarkan ID
export async function getAnggotaById(id: string) {
  return await prisma.anggota.findUnique({
    where: { id_anggota: id },
    include: { absensi: true },
  });
}

// Menambahkan anggota
export async function createAnggota(data: {
  id_anggota: string;
  nama: string;
  nim: string;
  jabatan: string;
}) {
  return await prisma.anggota.create({
    data,
  });
}

// Mengubah data anggota
export async function updateAnggota(
  id: string,
  data: {
    nama?: string;
    nim?: string;
    jabatan?: string;
  }
) {
  return await prisma.anggota.update({
    where: { id_anggota: id },
    data,
  });
}

// Menghapus anggota
export async function deleteAnggota(id: string) {
  return await prisma.anggota.delete({
    where: { id_anggota: id },
  });
}
