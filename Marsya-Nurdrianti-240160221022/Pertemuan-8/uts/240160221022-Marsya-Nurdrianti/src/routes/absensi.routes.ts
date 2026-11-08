import { Router } from "express";
import { absensiController } from "../controller/absensi.controller.ts";

const router = Router();

// GET /api/absensi — Mengambil seluruh data absensi (dengan opsi filter)
router.get("/", absensiController.getAll);

// GET /api/absensi/:id — Mengambil detail data satu absensi berdasarkan ID
router.get("/:id", absensiController.getById);

// POST /api/absensi — Menambahkan data absensi baru
router.post("/", absensiController.create);

// PATCH /api/absensi/:id — Memperbarui data absensi secara parsial berdasarkan ID
router.patch("/:id", absensiController.update);

// DELETE /api/absensi/:id — Menghapus data absensi berdasarkan ID
router.delete("/:id", absensiController.delete);

export default router;
export { router };

