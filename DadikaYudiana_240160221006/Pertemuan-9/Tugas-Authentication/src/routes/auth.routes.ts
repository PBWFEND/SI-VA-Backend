import { Router } from "express";
import { authController } from "../controller/auth.controller.ts";

const router = Router();

// POST /auth/register
router.post("/register", authController.register);

// POST /auth/login
router.post("/login", authController.login);

export default router;
export { router };

