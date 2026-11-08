import { Router } from "express";
import { getStafRekap, getAdminAudit } from "../controller/protected.controller.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.ts";

const router = Router();

router.use(authenticateToken as any);

router.get("/staf/rekap", authorizeRoles("STAF", "ADMIN") as any, getStafRekap as any);
router.get("/admin/audit", authorizeRoles("ADMIN") as any, getAdminAudit as any);

export default router;

