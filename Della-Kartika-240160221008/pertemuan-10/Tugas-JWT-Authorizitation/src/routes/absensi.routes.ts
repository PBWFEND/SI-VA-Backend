import { Router } from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controller/absensi.controller.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.ts";

const router = Router();

// Seluruh rute absensi wajib terautentikasi (JWT)
router.use(authenticateToken as any);

// Operasi Baca: Boleh diakses oleh seluruh pengguna terotentikasi (MAHASISWA, DOSEN, STAF, ADMIN)
router.get("/", getAll);
router.get("/:id", getById);

// Operasi Input Presensi: Mahasiswa, Dosen, Staf, Admin
router.post("/", authorizeRoles("MAHASISWA", "DOSEN", "STAF", "ADMIN") as any, create);

// Operasi Koreksi Status Presensi: Dibatasi untuk ADMIN, DOSEN, STAF (Mahasiswa tidak boleh edit mandiri)
router.put("/:id", authorizeRoles("ADMIN", "DOSEN", "STAF") as any, update);

// Operasi Hapus Catatan Presensi: Dibatasi HANYA untuk ADMIN
router.delete("/:id", authorizeRoles("ADMIN") as any, remove);

export default router;

