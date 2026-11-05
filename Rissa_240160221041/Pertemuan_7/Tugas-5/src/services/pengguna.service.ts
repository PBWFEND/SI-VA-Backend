import { prisma } from "../config/client.ts";

export class PenggunaService {
  async getAll(nim?: string) {
    if (nim) {
      return await prisma.pengguna.findMany({
        where: { nim },
      });
    }
    return await prisma.pengguna.findMany();
  }

  async getByNim(nim: string) {
    return await prisma.pengguna.findUnique({
      where: { nim },
    });
  }

  async create(data: { nim: string; nama: string; email: string; role?: string }) {
    return await prisma.pengguna.create({
      data,
    });
  }

  async update(nim: string, data: { nama?: string; email?: string; role?: string }) {
    return await prisma.pengguna.update({
      where: { nim },
      data,
    });
  }

  async delete(nim: string) {
    return await prisma.pengguna.delete({
      where: { nim },
    });
  }
}

export const penggunaService = new PenggunaService();