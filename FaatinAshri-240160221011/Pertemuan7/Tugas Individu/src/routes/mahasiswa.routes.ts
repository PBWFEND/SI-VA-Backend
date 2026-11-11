import { Router } from "express";
import {
  listMahasiswa,
  detailMahasiswa,
  addMahasiswa,
  editMahasiswa,
  removeMahasiswa,
} from "../controller/mahasiswa.controller.ts";

const router = Router();

router.get("/", listMahasiswa);
router.get("/:nim", detailMahasiswa);
router.post("/", addMahasiswa);
router.patch("/:nim", editMahasiswa);
router.delete("/:nim", removeMahasiswa);

export default router;
