import { Router } from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controller/mahasiswa.controller.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.ts";
import { validateMahasiswaBody, validateQuerySearch } from "../middleware/validation.middleware.ts";

const router = Router();

// Seluruh rute data mahasiswa wajib membawa JWT yang sah
router.use(authenticateToken as any);

// Operasi Baca: Seluruh pengguna terotentikasi, dilengkapi sanitasi parameter pencarian
router.get("/", validateQuerySearch, getAll);
router.get("/:id", getById);

// Operasi Tambah & Ubah: Terbatas role ADMIN, DOSEN, STAF dengan validasi body ketat
router.post("/", authorizeRoles("ADMIN", "DOSEN", "STAF") as any, validateMahasiswaBody, create);
router.put("/:id", authorizeRoles("ADMIN", "DOSEN", "STAF") as any, update);

// Operasi Hapus: Terbatas hanya untuk ADMIN
router.delete("/:id", authorizeRoles("ADMIN") as any, remove);

export default router;

