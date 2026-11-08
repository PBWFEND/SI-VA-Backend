import { Router } from "express";
import {
  autentikasiWajib,
  periksaRole,
} from "../middleware/auth.middleware.ts";
import { protectedController } from "../controller/protected.controller.ts";

const router = Router();

// Seluruh endpoint di bawah /protected WAJIB melewati middleware autentikasi
router.use(autentikasiWajib);

// GET /protected/me — Dapat diakses oleh semua pengguna yang login (mahasiswa, dosen, staf)
router.get("/me", protectedController.getProfile);

// GET /protected/peminjaman — HANYA dapat diakses oleh role 'staf'
router.get(
  "/peminjaman",
  periksaRole("staf"),
  protectedController.getPeminjaman
);

// GET /protected/pengguna — HANYA dapat diakses oleh role 'staf'
router.get(
  "/pengguna",
  periksaRole("staf"),
  protectedController.getSemuaPengguna
);

export { router as protectedRoutes };
export default router;

