import type { Request, Response, NextFunction } from "express";
import { authService, AuthConflictError, AuthUnauthorizedError } from "../service/auth.service.ts";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.ts";

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa JSON object yang valid",
      });
    }

    const { nim, nama, email, password, role } = req.body;

    if (role !== undefined && !["ADMIN", "DOSEN", "STAF", "MAHASISWA"].includes(String(role).toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Pilihan role tidak valid. Pilihan: ADMIN, DOSEN, STAF, MAHASISWA",
      });
    }

    // 1. Validasi NIM
    if (typeof nim !== "string" || nim.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' wajib diisi dengan teks yang tidak kosong",
      });
    }
    if (nim.trim().length < 8 || nim.trim().length > 20 || !/^\d+$/.test(nim.trim())) {
      return res.status(400).json({
        success: false,
        message: "Format 'nim' harus berupa 8-20 digit angka",
      });
    }

    // 2. Validasi Nama
    if (typeof nama !== "string" || nama.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nama' wajib diisi dengan teks yang tidak kosong",
      });
    }
    if (nama.trim().length < 2 || nama.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Panjang 'nama' harus antara 2 hingga 100 karakter",
      });
    }

    // 3. Validasi Email
    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'email' wajib diisi",
      });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Format 'email' tidak valid",
      });
    }

    // 4. Validasi Password
    if (typeof password !== "string" || password === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'password' wajib diisi",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password minimal harus 8 karakter",
      });
    }

    const user = await authService.register({
      nim: nim.trim(),
      nama: nama.trim(),
      email: email.trim(),
      password,
      role: role ? String(role) : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Pendaftaran akun berhasil",
      data: user,
    });
  } catch (error) {
    if (error instanceof AuthConflictError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa JSON object yang valid",
      });
    }

    const { email, password } = req.body;

    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'email' wajib diisi",
      });
    }

    if (typeof password !== "string" || password === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'password' wajib diisi",
      });
    }

    const result = await authService.login({
      email: email.trim(),
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Autentikasi berhasil",
      data: result.user,
      token: result.token,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    if (error instanceof AuthUnauthorizedError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Data profil pengguna yang terotentikasi",
    data: req.user,
  });
};

export const authController = {
  register,
  login,
  me,
};

export default authController;

