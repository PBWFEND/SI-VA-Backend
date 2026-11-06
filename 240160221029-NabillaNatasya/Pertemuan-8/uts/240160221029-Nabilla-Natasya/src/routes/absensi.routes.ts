import { Router } from "express";
import { absensiController } from "../controller/absensi.controller.ts";

const router = Router();

// GET /absensi — Mengambil seluruh daftar data absensi (dengan opsi filter)
router.get("/", absensiController.getAll);

// GET /absensi/:id — Mengambil detail data absensi berdasarkan ID
router.get("/:id", absensiController.getById);

// POST /absensi — Menambahkan record data absensi baru
router.post("/", absensiController.create);

// PATCH /absensi/:id — Memperbarui data absensi secara parsial berdasarkan ID
router.patch("/:id", absensiController.update);

// PUT /absensi/:id — Mendukung pembaruan data absensi berdasarkan ID
router.put("/:id", absensiController.update);

// DELETE /absensi/:id — Menghapus data absensi berdasarkan ID (HTTP 204 No Content)
router.delete("/:id", absensiController.delete);

export default router;
export { router };

