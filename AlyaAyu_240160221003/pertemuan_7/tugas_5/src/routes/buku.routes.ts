import { Router } from "express";
import * as bukuController from "../controller/buku.controller.ts";

const router = Router();

// GET semua buku
router.get("/", bukuController.handlerDaftarBuku);

// GET buku berdasarkan ID
router.get("/:id", bukuController.handlerDetailBuku);

// POST tambah buku
router.post("/", bukuController.handlerCreateBuku);

// PATCH ubah data buku
router.patch("/:id", bukuController.handlerPatchBuku);

// DELETE hapus buku
router.delete("/:id", bukuController.handlerDeleteBuku);

export { router as bukuRoutes };