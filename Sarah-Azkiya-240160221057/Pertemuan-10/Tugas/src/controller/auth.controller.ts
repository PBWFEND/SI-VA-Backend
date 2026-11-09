import type { Request, Response, NextFunction } from "express";
import { authService } from "../service/auth.service.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIM_REGEX = /^\d{8,15}$/;

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "role")) {
      return res.status(400).json({
        success: false,
        message: "Field 'role' tidak boleh dipilih melalui registrasi publik",
      });
    }

    const { nama, nim, email, password } = req.body;

    if (typeof nama !== "string" || nama.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'nama' wajib diisi dan tidak boleh kosong",
      });
    }

    if (typeof nim !== "string" || !NIM_REGEX.test(nim.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Field 'nim' wajib diisi berupa angka dengan panjang antara 8 hingga 15 karakter",
      });
    }

    if (
      typeof email !== "string" ||
      !EMAIL_REGEX.test(email.trim().toLowerCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "Field 'email' harus berupa alamat email yang valid",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Field 'password' wajib diisi dengan panjang minimal 8 karakter",
      });
    }

    const result = await authService.register({
      nama: nama.trim(),
      nim: nim.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi pengguna berhasil",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      email.trim() === "" ||
      !EMAIL_REGEX.test(email.trim().toLowerCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "Field 'email' harus berupa alamat email yang valid",
      });
    }

    if (typeof password !== "string" || password === "") {
      return res.status(400).json({
        success: false,
        message: "Field 'password' wajib diisi dan tidak boleh kosong",
      });
    }

    const result = await authService.login({
      email: email.trim().toLowerCase(),
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  register,
  login,
};

export default authController;

