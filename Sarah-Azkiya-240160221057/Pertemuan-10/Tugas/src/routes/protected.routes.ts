import { Router } from "express";
import {
  autentikasiWajib,
  periksaRole,
} from "../middleware/auth.middleware.ts";
import { protectedController } from "../controller/protected.controller.ts";

const router = Router();

router.use(autentikasiWajib);

router.get("/me", protectedController.getProfile);
router.get(
  "/peminjaman",
  periksaRole("staf"),
  protectedController.getPeminjaman
);
router.get(
  "/pengguna",
  periksaRole("staf"),
  protectedController.getSemuaPengguna
);

export { router as protectedRoutes };
export default router;

