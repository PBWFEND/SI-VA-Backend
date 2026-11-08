import { prisma } from "../../client.ts";

// GET: Mengambil semua pengguna
export const getAllPengguna = async () => {
  return prisma.pengguna.findMany();
};

// GET: Mengambil pengguna berdasarkan NIM
export const getPenggunaByNim = async (nim: string) => {
  return prisma.pengguna.findUnique({
    where: { nim },
  });
};

// POST: Membuat pengguna baru
export const createPengguna = async (data: {
  nim: string;
  nama: string;
  email: string;
  role: string;
}) => {
  return prisma.pengguna.create({
    data,
  });
};

// PATCH: Memperbarui pengguna berdasarkan NIM
export const updatePengguna = async (
  nim: string,
  data: {
    nama?: string;
    email?: string;
    role?: string;
  },
) => {
  return prisma.pengguna.update({
    where: { nim },
    data,
  });
};

// DELETE: Menghapus pengguna berdasarkan NIM
export const deletePengguna = async (nim: string) => {
  return prisma.pengguna.delete({
    where: { nim },
  });
};
