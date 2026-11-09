import { Router } from "express";
import { getStafRekap, getAdminAudit } from "../controller/protected.controller.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.ts";

const router = Router();

// Seluruh rute dilindungi oleh middleware verifikasi token
router.use(authenticateToken as any);

// Rute Staf & Admin
router.get("/staf/rekap", authorizeRoles("STAF", "ADMIN") as any, getStafRekap as any);

// Rute Khusus Admin Tertinggi
router.get("/admin/audit", authorizeRoles("ADMIN") as any, getAdminAudit as any);

export default router;

