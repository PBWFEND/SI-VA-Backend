
import express from "express";

import {
  getSemuaAbsensi,
  getAbsensiById,
  postAbsensi,
  patchAbsensi,
  deleteAbsensi,
} from "../controller/absensi.controller.js";

const router = express.Router();

router.get("/", getSemuaAbsensi);
router.get("/:id", getAbsensiById);
router.post("/", postAbsensi);
router.patch("/:id", patchAbsensi);
router.delete("/:id", deleteAbsensi);

export default router;
