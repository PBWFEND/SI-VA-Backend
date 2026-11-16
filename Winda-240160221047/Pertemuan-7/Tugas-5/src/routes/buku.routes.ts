
import { Router } from "express";
import {
  getSemuaBuku,
  getDetailBuku,
  postBuku,
  patchBuku,
  deleteBuku
} from "../controller/buku.controller.ts";

const router = Router();

router.get("/", getSemuaBuku);
router.get("/:id", getDetailBuku);
router.post("/", postBuku);
router.patch("/:id", patchBuku);
router.delete("/:id", deleteBuku);

export { router as bukuRoutes };
