import { prisma } from "../../client.ts";

// Mengambil daftar pengguna, bisa difilter berdasarkan NIM
export const ambilDaftarPengguna = async (nim?: string) => {
  return prisma.pengguna.findMany({
    where: nim ? { nim } : undefined,
  });
};

// Mengambil detail pengguna berdasarkan NIM
export const ambilPenggunaByNim = async (nim: string) => {
  return prisma.pengguna.findUnique({
    where: { nim },
  });
};

// Membuat pengguna baru
export const buatPengguna = async (data: {
  nim: string;
  nama: string;
  email: string;
  role?: string;
}) => {
  return prisma.pengguna.create({
    data: {
      nim: data.nim,
      nama: data.nama,
      email: data.email,
      role: data.role ?? "mahasiswa",
    },
  });
};

// Menghapus pengguna berdasarkan NIM
export const hapusPengguna = async (nim: string) => {
  return prisma.pengguna.delete({
    where: { nim },
  });
};
