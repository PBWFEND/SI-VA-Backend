
import { Router } from "express";
import {
  getSemuaAbsensi,
  getAbsensiById,
  postAbsensi,
  patchAbsensi,
  deleteAbsensi,
} from "../controller/absensiController.ts";

const router = Router();

router.get("/", getSemuaAbsensi);
router.get("/:id", getAbsensiById);
router.post("/", postAbsensi);
router.patch("/:id", patchAbsensi);
router.delete("/:id", deleteAbsensi);

export default router;
