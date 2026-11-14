import { Router } from "express";
import { register, login } from "./auth.controller.js";

const router = Router();

// Endpoint untuk Register
router.post("/register", register);

// Endpoint untuk Login
router.post("/login", login);

export default router;
