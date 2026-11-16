import { Router } from "express";
import {
  getBuku,
  getBukuDetail,
  tambahBuku,
  ubahBuku,
  hapusBuku,
} from "../controller/buku.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// Semua endpoint buku wajib login
router.use(authenticateToken);

// GET semua buku
router.get("/", getBuku);

// GET buku berdasarkan ID
router.get("/:id", getBukuDetail);

// POST tambah buku (khusus admin)
router.post("/", authorizeRoles("admin"), tambahBuku);

// PATCH ubah buku (khusus admin)
router.patch("/:id", authorizeRoles("admin"), ubahBuku);

// DELETE hapus buku (khusus admin)
router.delete("/:id", authorizeRoles("admin"), hapusBuku);

export default router;
