import { Router } from "express";
import { penggunaController } from "../controllers/pengguna.controller.ts";

const router = Router();

router.get("/", (req, res, next) => penggunaController.getAll(req, res, next));
router.get("/:nim", (req, res, next) => penggunaController.getByNim(req, res, next));
router.post("/", (req, res, next) => penggunaController.create(req, res, next));
router.patch("/:nim", (req, res, next) => penggunaController.update(req, res, next));
router.delete("/:nim", (req, res, next) => penggunaController.delete(req, res, next));

export default router;