
import { Router } from "express";
import * as anggotaController from "../controller/anggota.controller.ts";

const router = Router();

// GET semua anggota
router.get("/", anggotaController.getAllAnggota);

// GET anggota berdasarkan ID
router.get("/:id", anggotaController.getAnggotaById);

// POST tambah anggota
router.post("/", anggotaController.createAnggota);

// PATCH ubah data anggota
router.patch("/:id", anggotaController.updateAnggota);

// DELETE hapus anggota
router.delete("/:id", anggotaController.deleteAnggota);

export { router as anggotaRoutes };
