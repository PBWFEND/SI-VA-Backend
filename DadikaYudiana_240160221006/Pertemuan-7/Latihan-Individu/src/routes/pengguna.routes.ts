import { Router } from "express";
import { penggunaController } from "../controller/pengguna.controller.ts";

const router = Router();

// GET /pengguna — Mengambil seluruh daftar pengguna (dengan opsi filter ?nim=)
router.get("/", penggunaController.ambilDaftar);

// GET /pengguna/:nim — Mengambil detail pengguna berdasarkan NIM
router.get("/:nim", penggunaController.ambilDetail);

// POST /pengguna — Membuat pengguna baru (TODO 3: status 201)
router.post("/", penggunaController.buatPenggunaBaru);

// DELETE /pengguna/:nim — Menghapus pengguna (TODO 4: status 204 atau 404)
router.delete("/:nim", penggunaController.hapusPenggunaByNim);

export default router;
export { router as penggunaRoutes };

