import express from "express";

import {
  getDaftarPengguna,
  getDetailPengguna,
  postPengguna,
  patchPengguna,
  hapusPengguna,
} from "../controller/pengguna.controller.ts";

const penggunaRoutes = express.Router();

// GET: Daftar pengguna
penggunaRoutes.get("/", getDaftarPengguna);

// GET: Detail pengguna berdasarkan NIM
penggunaRoutes.get("/:nim", getDetailPengguna);

// POST: Tambah pengguna
penggunaRoutes.post("/", postPengguna);

// PATCH: Perbarui pengguna berdasarkan NIM
penggunaRoutes.patch("/:nim", patchPengguna);

// DELETE: Hapus pengguna berdasarkan NIM
penggunaRoutes.delete("/:nim", hapusPengguna);

export default penggunaRoutes;
