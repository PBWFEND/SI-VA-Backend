
import { prisma } from "../../client.ts";

export const ambilSemuaBuku = () => {
  return prisma.buku.findMany({
    orderBy: { id: "asc" },
  });
};

export const ambilBukuById = (id: number) => {
  return prisma.buku.findUnique({
    where: { id },
  });
};

export const tambahBuku = (data: {
  judul: string;
  penulis: string;
  tahun: number;
  stok: number;
}) => {
  return prisma.buku.create({ data });
};

export const ubahBuku = (
  id: number,
  data: Partial<{
    judul: string;
    penulis: string;
    tahun: number;
    stok: number;
  }>
) => {
  return prisma.buku.update({
    where: { id },
    data,
  });
};

export const hapusBuku = (id: number) => {
  return prisma.buku.delete({
    where: { id },
  });
};
