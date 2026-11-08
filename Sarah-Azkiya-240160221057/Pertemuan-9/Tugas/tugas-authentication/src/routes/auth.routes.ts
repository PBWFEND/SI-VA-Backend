import { Router } from "express";
import { authController } from "../controller/auth.controller.ts";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export { router as authRoutes };
export default router;

