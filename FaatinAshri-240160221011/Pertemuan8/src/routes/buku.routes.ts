import { Router } from "express";
import {
  getBuku,
  getBukuDetail,
  tambahBuku,
  ubahBuku,
  hapusBuku,
} from "../controller/buku.controller.ts";

const router = Router();

router.get("/", getBuku);
router.get("/:id", getBukuDetail);
router.post("/", tambahBuku);
router.patch("/:id", ubahBuku);
router.delete("/:id", hapusBuku);

export default router;