import { prisma } from "../../client.ts";

export const getAllBuku = async (filter?: {
  penulis?: string;
  minStok?: number;
}) => {
  return await prisma.buku.findMany({
    where: {
      ...(filter?.penulis !== undefined && {
        penulis: filter.penulis,
      }),
      ...(filter?.minStok !== undefined && {
        stok: { gte: filter.minStok },
      }),
    },
    orderBy: {
      judul: "asc",
    },
  });
};

export const getBukuById = async (id: number) => {
  return await prisma.buku.findUnique({
    where: { id },
  });
};

export const createBuku = async (data: {
  judul: string;
  penulis: string;
  tahun: number;
  stok: number;
}) => {
  return await prisma.buku.create({
    data,
  });
};

export const updateBuku = async (
  id: number,
  data: {
    judul?: string;
    penulis?: string;
    tahun?: number;
    stok?: number;
  }
) => {
  return await prisma.buku.update({
    where: { id },
    data,
  });
};

export const deleteBuku = async (id: number) => {
  return await prisma.buku.delete({
    where: { id },
  });
};