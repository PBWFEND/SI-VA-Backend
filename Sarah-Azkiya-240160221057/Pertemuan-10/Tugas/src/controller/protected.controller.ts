import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../client.ts";

export const getProfile = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Pengguna belum terautentikasi",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Profil pengguna berhasil diambil",
    data: {
      id: req.user.sub,
      nama: req.user.nama,
      nim: req.user.nim,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

export const getPeminjaman = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const dataPeminjaman = [
    {
      id: 1,
      nimPeminjam: "240160221057",
      namaPeminjam: "Sarah Azkiya",
      bukuId: 1,
      judulBuku: "Clean Code",
      tanggalPinjam: "2026-11-01",
      batasKembali: "2026-11-08",
      status: "DIPINJAM",
    },
    {
      id: 2,
      nimPeminjam: "240160221036",
      namaPeminjam: "Raihan Anugrah Pratama",
      bukuId: 2,
      judulBuku: "Refactoring",
      tanggalPinjam: "2026-11-03",
      batasKembali: "2026-11-10",
      status: "DIPINJAM",
    },
    {
      id: 3,
      nimPeminjam: "240160221048",
      namaPeminjam: "Yosep Adipura Herdi",
      bukuId: 3,
      judulBuku: "Design Patterns",
      tanggalPinjam: "2026-11-05",
      batasKembali: "2026-11-12",
      status: "DIPINJAM",
    },
  ];

  return res.status(200).json({
    success: true,
    message: "Data peminjaman buku perpustakaan (khusus staf perpustakaan)",
    total: dataPeminjaman.length,
    data: dataPeminjaman,
  });
};

export const getSemuaPengguna = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.pengguna.findMany({
      select: {
        id: true,
        nama: true,
        nim: true,
        email: true,
        role: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Daftar pengguna perpustakaan (khusus staf)",
      total: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const protectedController = {
  getProfile,
  getPeminjaman,
  getSemuaPengguna,
};

export default protectedController;

