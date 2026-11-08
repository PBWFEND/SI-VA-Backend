import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.ts";

export const getStafRekap = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Data rekapitulasi operasional staf akademik",
    authorizedRole: req.user?.role,
    data: {
      totalMahasiswaTerdaftar: 450,
      berkasPendingValidasi: 12,
      jadwalKuliahTersusun: 36,
      petugas: req.user?.nama,
    },
  });
};

export const getAdminAudit = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Log audit sistem administrator tingkat tinggi",
    authorizedRole: req.user?.role,
    data: {
      statusKeamanan: "OPTIMAL",
      totalPenggunaAktif: 85,
      jwtAlgorithm: "HS256",
      inspeksiOleh: req.user?.nama,
      timestamp: new Date().toISOString(),
    },
  });
};

export const protectedController = {
  getStafRekap,
  getAdminAudit,
};

export default protectedController;

