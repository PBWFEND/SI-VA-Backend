
import { Router } from "express";
import { absensiController } from "../controller/absensi.controller.ts";

const router = Router();

// GET /absensi — Mengambil seluruh data absensi (dengan filter status & kegiatan)
router.get("/", absensiController.getAll);

// GET /absensi/:id — Mengambil detail absensi berdasarkan ID
router.get("/:id", absensiController.getById);

// POST /absensi — Menambahkan data absensi baru
router.post("/", absensiController.create);

// PATCH /absensi/:id — Memperbarui data absensi secara parsial berdasarkan ID
router.patch("/:id", absensiController.update);

// DELETE /absensi/:id — Menghapus data absensi berdasarkan ID
router.delete("/:id", absensiController.delete);

export default router;
export { router };
