import { prisma } from "../../client.ts";

// Mengambil semua data buku
export async function getAllBuku() {
  return await prisma.buku.findMany();
}

// Mengambil satu buku berdasarkan ID
export async function getBukuById(id: number) {
  return await prisma.buku.findUnique({
    where: { id },
  });
}

// Menambahkan buku
export async function createBuku(data: {
  judul: string;
  penulis: string;
  tahun: number;
  stok: number;
}) {
  return await prisma.buku.create({
    data,
  });
}

// Mengubah data buku
export async function updateBuku(
  id: number,
  data: {
    judul?: string;
    penulis?: string;
    tahun?: number;
    stok?: number;
  }
) {
  return await prisma.buku.update({
    where: { id },
    data,
  });
}

// Menghapus buku
export async function deleteBuku(id: number) {
  return await prisma.buku.delete({
    where: { id },
  });
}