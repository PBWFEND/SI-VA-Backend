import { Router } from "express";
import {
  getSemuaBuku,
  getBukuById,
  postBuku,
  patchBuku,
  deleteBuku,
} from "../controller/buku.controller.ts";

const router = Router();

router.get("/", getSemuaBuku);
router.get("/:id", getBukuById);
router.post("/", postBuku);
router.patch("/:id", patchBuku);
router.delete("/:id", deleteBuku);

export default router;

