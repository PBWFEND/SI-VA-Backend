
import { Router } from "express";
import * as menuController from "../controller/menu.controller.ts";

const router = Router();

router.get("/", menuController.getAllMenu);
router.get("/:id", menuController.getMenuById);
router.post("/", menuController.createMenu);
router.patch("/:id", menuController.updateMenu);
router.delete("/:id", menuController.deleteMenu);

export { router as menuRoutes };
