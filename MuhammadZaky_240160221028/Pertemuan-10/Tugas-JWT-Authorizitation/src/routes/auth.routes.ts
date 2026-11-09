import { Router } from "express";
import { register, login, me } from "../controller/auth.controller.ts";
import { authenticateToken } from "../middleware/auth.middleware.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, me);

export default router;

