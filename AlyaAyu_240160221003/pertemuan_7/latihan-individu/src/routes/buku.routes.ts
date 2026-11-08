import { Router } from "express";
import { bukuController } from "../controller/buku.controller.ts";

const router = Router();

// GET /buku — Mengambil seluruh data buku (dengan filter status & kegiatan)
router.get("/", bukuController.getAll);

// GET /buku/:id — Mengambil detail buku berdasarkan ID
router.get("/:id", bukuController.getById);

// POST /buku — Menambahkan data buku baru
router.post("/", bukuController.create);

// PATCH /buku/:id — Memperbarui data buku secara parsial berdasarkan ID
router.patch("/:id", bukuController.update);

// DELETE /buku/:id — Menghapus data buku berdasarkan ID
router.delete("/:id", bukuController.delete);

export default router;
export { router };