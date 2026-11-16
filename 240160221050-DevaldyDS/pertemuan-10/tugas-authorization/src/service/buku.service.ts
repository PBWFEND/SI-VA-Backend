import { prisma } from "../../client.js";

// Mengambil semua data buku
export const getAllBuku = async () => {
  return await prisma.buku.findMany();
};

// Mengambil satu buku berdasarkan ID
export const getBukuById = async (id: number) => {
  return await prisma.buku.findUnique({
    where: { id },
  });
};

// Menambahkan buku baru
export const createBuku = async (data: {
  judul: string;
  penulis: string;
  tahun: number;
  stok?: number;
}) => {
  return await prisma.buku.create({
    data,
  });
};

// Mengubah data buku
export const updateBuku = async (
  id: number,
  data: {
    judul?: string;
    penulis?: string;
    tahun?: number;
    stok?: number;
  },
) => {
  return await prisma.buku.update({
    where: { id },
    data,
  });
};

// Menghapus buku
export const deleteBuku = async (id: number) => {
  return await prisma.buku.delete({
    where: { id },
  });
};
