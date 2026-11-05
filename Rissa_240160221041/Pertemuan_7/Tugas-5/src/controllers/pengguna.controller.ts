import type { Request, Response, NextFunction } from "express";
import { penggunaService } from "../services/pengguna.service.ts";

export class PenggunaController {
  // GET /pengguna (List & Search Query)
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const nimQuery = req.query.nim as string | undefined;
      const data = await penggunaService.getAll(nimQuery);
      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data pengguna",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /pengguna/:nim (Detail)
  async getByNim(req: Request, res: Response, next: NextFunction) {
    try {
      const nim = req.params.nim as string;
      const pengguna = await penggunaService.getByNim(nim);

      if (!pengguna) {
        return res.status(404).json({
          success: false,
          message: `Pengguna dengan NIM ${nim} tidak ditemukan`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Detail pengguna ditemukan",
        data: pengguna,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /pengguna (Create)
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { nim, nama, email, role } = req.body;

      // Gerbang Validasi Typeof & Required
      if (!nim || typeof nim !== "string" || nim.trim() === "") {
        return res.status(400).json({ success: false, message: "NIM wajib diisi dan berupa string" });
      }
      if (!nama || typeof nama !== "string" || nama.trim() === "") {
        return res.status(400).json({ success: false, message: "Nama wajib diisi dan berupa string" });
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ success: false, message: "Email tidak valid" });
      }
      if (role && typeof role !== "string") {
        return res.status(400).json({ success: false, message: "Role harus berupa string" });
      }

      const newPengguna = await penggunaService.create({
        nim: nim.trim(),
        nama: nama.trim(),
        email: email.trim(),
        role: role ? role.trim() : undefined,
      });

      return res.status(201).json({
        success: true,
        message: "Pengguna berhasil ditambahkan",
        data: newPengguna,
      });
    } catch (error: any) {
      // Menangani error Unique constraint dari Prisma
      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "NIM atau Email sudah terdaftar",
        });
      }
      next(error);
    }
  }

  // PATCH /pengguna/:nim (Update Partial)
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const nim = req.params.nim as string;
      const { nama, email, role } = req.body;

      // Cek ketersediaan data terlebih dahulu
      const existing = await penggunaService.getByNim(nim);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Pengguna dengan NIM ${nim} tidak ditemukan`,
        });
      }

      // Validasi gerbang typeof bila field dikirimkan
      if (nama !== undefined && (typeof nama !== "string" || nama.trim() === "")) {
        return res.status(400).json({ success: false, message: "Nama harus berupa string valid" });
      }
      if (email !== undefined && (typeof email !== "string" || !email.includes("@"))) {
        return res.status(400).json({ success: false, message: "Email tidak valid" });
      }
      if (role !== undefined && typeof role !== "string") {
        return res.status(400).json({ success: false, message: "Role harus berupa string" });
      }

      const updated = await penggunaService.update(nim, {
        nama: nama ? nama.trim() : undefined,
        email: email ? email.trim() : undefined,
        role: role ? role.trim() : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Data pengguna berhasil diperbarui",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /pengguna/:nim (Delete)
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const nim = req.params.nim as string;

      const existing = await penggunaService.getByNim(nim);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Pengguna dengan NIM ${nim} tidak ditemukan`,
        });
      }

      await penggunaService.delete(nim);
      
      // Status Code 204 No Content untuk penghapusan sukses
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const penggunaController = new PenggunaController();