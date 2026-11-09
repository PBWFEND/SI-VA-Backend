import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtService, type UserJwtPayload } from "../service/jwt.service.ts";

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}

export const autentikasiWajib = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Header Authorization tidak ditemukan",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message:
        "Akses ditolak: Format header Authorization tidak valid. Gunakan format 'Bearer <token>'",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Token tidak boleh kosong",
    });
  }

  try {
    const payload = jwtService.verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak: Token telah kedaluwarsa. Silakan login kembali",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message:
          "Akses ditolak: Token tidak valid atau signature tidak sesuai",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Autentikasi token gagal",
    });
  }
};

export const periksaRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak: Pengguna belum terautentikasi",
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Role '${userRole}' tidak memiliki izin untuk mengakses resource ini`,
      });
    }

    return next();
  };
};

export default {
  autentikasiWajib,
  periksaRole,
};

