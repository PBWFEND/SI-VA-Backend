import { Router } from "express";
import {
  getBuku,
  getBukuDetail,
  tambahBuku,
  ubahBuku,
  hapusBuku,
} from "../controller/buku.controller.js";

const router = Router();

// GET semua buku
router.get("/", getBuku);

// GET buku berdasarkan ID
router.get("/:id", getBukuDetail);

// POST tambah buku
router.post("/", tambahBuku);

// PATCH ubah buku
router.patch("/:id", ubahBuku);

// DELETE hapus buku
router.delete("/:id", hapusBuku);

export default router;
