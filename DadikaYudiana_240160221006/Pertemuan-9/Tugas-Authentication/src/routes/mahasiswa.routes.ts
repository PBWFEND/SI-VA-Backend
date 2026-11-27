import { Router } from "express";
import { mahasiswaController } from "../controller/mahasiswa.controller.ts";

const router = Router();

router.get("/", mahasiswaController.getAll);
router.get("/:id", mahasiswaController.getById);
router.post("/", mahasiswaController.create);
router.put("/:id", mahasiswaController.update);
router.delete("/:id", mahasiswaController.delete);

export default router;
export { router };

