import type { Request, Response, NextFunction } from "express";
import { tokenService, TokenError, type UserTokenPayload } from "../service/token.service.ts";

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Header Authorization tidak ditemukan",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Format header tidak valid. Gunakan format 'Bearer <token>'",
    });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Token autentikasi kosong",
    });
  }

  try {
    const userPayload = tokenService.verifyAccessToken(token);
    req.user = userPayload;
    return next();
  } catch (error) {
    if (error instanceof TokenError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak valid atau kedaluwarsa",
    });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak: Pengguna belum terautentikasi",
      });
    }

    const userRole = req.user.role.toUpperCase();
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses terlarang: Role '${req.user.role}' tidak memiliki izin untuk mengakses resource ini`,
      });
    }

    return next();
  };
};

export default {
  authenticateToken,
  authorizeRoles,
};

