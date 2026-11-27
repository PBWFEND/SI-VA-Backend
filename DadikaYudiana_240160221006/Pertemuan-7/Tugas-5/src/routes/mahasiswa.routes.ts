import { Router } from "express";
import { mahasiswaController } from "../controller/mahasiswa.controller.ts";

const router = Router();

// GET /mahasiswa — Mengambil seluruh data mahasiswa (dengan filter prodi & angkatan)
router.get("/", mahasiswaController.getAll);

// GET /mahasiswa/:nim — Mengambil detail data satu mahasiswa berdasarkan NIM
router.get("/:nim", mahasiswaController.getByNim);

// POST /mahasiswa — Menambahkan data mahasiswa baru
router.post("/", mahasiswaController.create);

// PATCH /mahasiswa/:nim — Memperbarui data mahasiswa secara parsial berdasarkan NIM
router.patch("/:nim", mahasiswaController.update);

// DELETE /mahasiswa/:nim — Menghapus data mahasiswa berdasarkan NIM
router.delete("/:nim", mahasiswaController.delete);

export default router;
export { router };

