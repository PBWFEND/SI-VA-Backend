import { Router } from "express";
import { authController } from "../controller/auth.controller.ts";

const router = Router();

// Endpoint Registrasi Pengguna Baru
// POST /auth/register
router.post("/register", authController.register);

// Endpoint Login Autentikasi Pengguna
// POST /auth/login
router.post("/login", authController.login);

export { router as authRoutes };
export default router;

