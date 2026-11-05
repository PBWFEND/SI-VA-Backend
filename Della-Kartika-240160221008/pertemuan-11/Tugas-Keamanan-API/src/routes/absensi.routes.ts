import { Router } from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controller/absensi.controller.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.ts";
import { validateAbsensiBody, validateQuerySearch } from "../middleware/validation.middleware.ts";

const router = Router();

// Seluruh rute data absensi wajib membawa JWT terverifikasi
router.use(authenticateToken as any);

// Operasi Baca: Semua pengguna terotentikasi (Mahasiswa hanya melihat data miliknya)
router.get("/", validateQuerySearch, getAll as any);
router.get("/:id", getById as any);

// Operasi Tambah Kehadiran:
// Mahasiswa mencatat kehadiran diri sendiri (Anti-Spoofing otomatis dipaksakan)
// Admin/Dosen/Staf dapat mencatat kehadiran siapa saja
router.post("/", validateAbsensiBody, create as any);

// Operasi Ubah: Hanya boleh diakses oleh ADMIN, DOSEN, dan STAF
router.put("/:id", authorizeRoles("ADMIN", "DOSEN", "STAF") as any, update as any);

// Operasi Hapus: Hanya boleh diakses oleh role ADMIN
router.delete("/:id", authorizeRoles("ADMIN") as any, remove as any);

export default router;

