import { Router } from "express";
import { register, login, me } from "../controller/auth.controller.ts";
import { authenticateToken } from "../middleware/auth.middleware.ts";
import { authLimiter } from "../middleware/security.middleware.ts";

const router = Router();

// Rute pendaftaran dan login diproteksi rate limiter ketat (cegah brute force)
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticateToken, me);

export default router;

