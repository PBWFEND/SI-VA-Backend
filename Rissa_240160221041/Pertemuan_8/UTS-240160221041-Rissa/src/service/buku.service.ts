import { prisma } from "../../client";

export const getAllBuku = async () => {
  return await prisma.buku.findMany({
    orderBy: { createdAt: "desc" }
  });
};

export const getBukuById = async (id: number) => {
  return await prisma.buku.findUnique({
    where: { id }
  });
};

export const createBuku = async (data: {
  judul: string;
  penulis: string;
  kategori: string;
  stok?: number;
  tahunTerbit: number;
}) => {
  return await prisma.buku.create({
    data: {
      judul: data.judul,
      penulis: data.penulis,
      kategori: data.kategori,
      stok: data.stok ?? 1,
      tahunTerbit: data.tahunTerbit
    }
  });
};

export const updateBuku = async (
  id: number,
  data: {
    judul?: string;
    penulis?: string;
    kategori?: string;
    stok?: number;
    tahunTerbit?: number;
  }
) => {
  return await prisma.buku.update({
    where: { id },
    data
  });
};

export const deleteBuku = async (id: number) => {
  return await prisma.buku.delete({
    where: { id }
  });
};