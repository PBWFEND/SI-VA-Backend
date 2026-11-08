import { Router } from "express";
import { register, login, me } from "../controller/auth.controller.ts";
import { authenticateToken } from "../middleware/auth.middleware.ts";
import { authLimiter } from "../middleware/security.middleware.ts";

const router = Router();

// Rute registrasi dan login diproteksi oleh rate limiter ketat (cegah serangan brute force)
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticateToken, me);

export default router;

