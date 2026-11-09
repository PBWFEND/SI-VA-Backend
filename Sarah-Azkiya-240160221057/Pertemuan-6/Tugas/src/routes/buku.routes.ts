import { Router } from "express";
import { bukuController } from "../controller/buku.controller.ts";

const router = Router();

// GET /buku — Mengambil seluruh daftar buku (bisa dengan filter ?penulis=.. &tahun=.. &minStok=.. &q=..)
router.get("/", bukuController.getAll);

// GET /buku/:id — Mengambil detail buku berdasarkan ID (404 jika tidak ditemukan)
router.get("/:id", bukuController.getById);

// POST /buku — Menambahkan buku baru dengan validasi (201 jika berhasil, 400 jika tidak valid)
router.post("/", bukuController.create);

// PATCH /buku/:id — Memperbarui data buku parsial berdasarkan ID (200 jika berhasil, 404 jika tidak ditemukan)
router.patch("/:id", bukuController.update);

// DELETE /buku/:id — Menghapus buku berdasarkan ID (204 jika berhasil, 404 jika tidak ditemukan)
router.delete("/:id", bukuController.delete);

export default router;
export { router };

