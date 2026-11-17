
import { prisma } from "../../client.ts";

export async function ambilSemuaBuku() {
  return await prisma.buku.findMany({
    orderBy: { id: "asc" }
  });
}

export async function ambilBukuBerdasarkanId(id: number) {
  return await prisma.buku.findUnique({
    where: { id }
  });
}

export async function tambahBuku(data: {
  judul: string;
  penulis: string;
  tahun: number;
  stok: number;
}) {
  return await prisma.buku.create({
    data
  });
}

export async function ubahBuku(
  id: number,
  data: {
    judul?: string;
    penulis?: string;
    tahun?: number;
    stok?: number;
  }
) {
  return await prisma.buku.updateMany({
    where: { id },
    data
  });
}

export async function hapusBuku(id: number) {
  return await prisma.buku.deleteMany({
    where: { id }
  });
}
