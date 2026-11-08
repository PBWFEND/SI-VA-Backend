
import { prisma } from "../../client.ts";

export const getAllMenu = async () => {
  return await prisma.menu.findMany();
};

export const getMenuById = async (id: number) => {
  return await prisma.menu.findUnique({
    where: { id },
  });
};

export const createMenu = async (data: {
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  tersedia?: boolean;
}) => {
  return await prisma.menu.create({ data });
};

export const updateMenu = async (
  id: number,
  data: {
    nama?: string;
    kategori?: string;
    harga?: number;
    stok?: number;
    tersedia?: boolean;
  }
) => {
  return await prisma.menu.update({
    where: { id },
    data,
  });
};

export const deleteMenu = async (id: number) => {
  return await prisma.menu.delete({
    where: { id },
  });
};
