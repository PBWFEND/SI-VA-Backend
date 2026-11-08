import { Router } from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controller/mahasiswa.controller.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.ts";

const router = Router();

// Seluruh akses data mahasiswa wajib terautentikasi (JWT)
router.use(authenticateToken as any);

// Operasi Baca (Read): Boleh diakses oleh seluruh pengguna terotentikasi (MAHASISWA, DOSEN, STAF, ADMIN)
router.get("/", getAll);
router.get("/:id", getById);

// Operasi Tulis (Create & Update): Terbatas untuk ADMIN, DOSEN, STAF
router.post("/", authorizeRoles("ADMIN", "DOSEN", "STAF") as any, create);
router.put("/:id", authorizeRoles("ADMIN", "DOSEN", "STAF") as any, update);

// Operasi Hapus (Delete): Terbatas hanya untuk ADMIN
router.delete("/:id", authorizeRoles("ADMIN") as any, remove);

export default router;

