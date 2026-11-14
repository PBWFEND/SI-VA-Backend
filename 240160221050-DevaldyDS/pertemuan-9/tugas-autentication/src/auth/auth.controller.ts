import type { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service.js";

// Controller Register
export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    // Validasi tipe data
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib berupa teks",
      });
    }

    // Validasi email
    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    // Validasi password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter",
      });
    }

    const user = await registerUser(normalizedEmail, password);

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}

// Controller Login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    // Validasi tipe data
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    // Validasi format email
    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    if (password.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Password wajib diisi",
      });
    }

    const user = await loginUser(normalizedEmail, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: user,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
}
