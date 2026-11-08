/**
 * Pertemuan 10 — Latihan Individu §19
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 * 
 * Modul Latihan Mandiri JWT dan Authorization:
 * - 6.1 Role Ketiga: 'staf' (membedakan mahasiswa, dosen, staf; proteksi registrasi publik)
 * - 6.2 Endpoint Khusus Staf (/protected/peminjaman)
 * - 6.3 Pengujian Autentikasi dan Otorisasi (401 vs 403)
 * - 6.4 Verifikasi Masa Berlaku Token (exp)
 */

import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../Pertemuan-8/Tugas/uts/240160221057-sarahazkiya/client.ts";
import {
  hashPassword,
  verifyPassword,
} from "../../Pertemuan-8/Tugas/uts/240160221057-sarahazkiya/src/service/auth.service.ts";

export const ROLES = {
  MAHASISWA: "mahasiswa",
  DOSEN: "dosen",
  STAF: "staf",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export interface JwtUserPayload {
  sub: number;
  nama: string;
  nim: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function getSecretKey(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "JWT_SECRET wajib didefinisikan pada environment dan minimal memiliki panjang 32 karakter."
    );
  }
  return secret.trim();
}

export function buatToken(
  payload: {
    sub: number;
    nama: string;
    nim: string;
    email: string;
    role: string;
  },
  expiresIn: string | number = "15m"
): string {
  const secret = getSecretKey();
  const options: SignOptions = {
    expiresIn: expiresIn as unknown as NonNullable<SignOptions["expiresIn"]>,
    algorithm: "HS256",
  };
  return jwt.sign(payload, secret, options);
}

export function verifikasiToken(token: string): {
  valid: boolean;
  status: number;
  error?: string;
  payload?: JwtUserPayload;
} {
  try {
    const secret = getSecretKey();
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as unknown as JwtUserPayload;
    return { valid: true, status: 200, payload: decoded };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        status: 401,
        error: "Akses ditolak: Token telah kedaluwarsa. Silakan login kembali",
      };
    }
    return {
      valid: false,
      status: 401,
      error: "Akses ditolak: Token tidak valid atau signature tidak cocok",
    };
  }
}

/**
 * 6.1 Registrasi Mandiri dengan Proteksi Role.
 * Pengguna publik dilarang mengirimkan field 'role'. Default adalah 'mahasiswa'.
 */
export async function registrasiMahasiswa(input: {
  nama: unknown;
  nim: unknown;
  email: unknown;
  password: unknown;
  role?: unknown;
}) {
  if (input.role !== undefined) {
    return {
      status: 400,
      success: false,
      message: "Field 'role' tidak boleh dipilih melalui registrasi publik",
    };
  }

  if (typeof input.nama !== "string" || input.nama.trim() === "") {
    return { status: 400, success: false, message: "Field 'nama' wajib diisi" };
  }

  if (typeof input.nim !== "string" || !/^\d{8,15}$/.test(input.nim.trim())) {
    return { status: 400, success: false, message: "Field 'nim' tidak valid" };
  }

  if (
    typeof input.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim().toLowerCase())
  ) {
    return { status: 400, success: false, message: "Field 'email' tidak valid" };
  }

  if (typeof input.password !== "string" || input.password.length < 8) {
    return {
      status: 400,
      success: false,
      message: "Field 'password' minimal 8 karakter",
    };
  }

  const emailNorm = input.email.trim().toLowerCase();
  const nimNorm = input.nim.trim();

  const existingEmail = await prisma.pengguna.findUnique({
    where: { email: emailNorm },
  });
  if (existingEmail) {
    return { status: 409, success: false, message: "Email sudah terdaftar" };
  }

  const existingNim = await prisma.pengguna.findUnique({
    where: { nim: nimNorm },
  });
  if (existingNim) {
    return { status: 409, success: false, message: "NIM sudah terdaftar" };
  }

  const pHash = await hashPassword(input.password);
  const user = await prisma.pengguna.create({
    data: {
      nama: input.nama.trim(),
      nim: nimNorm,
      email: emailNorm,
      passwordHash: pHash,
      role: ROLES.MAHASISWA,
    },
  });

  return {
    status: 201,
    success: true,
    data: {
      id: user.id,
      nama: user.nama,
      nim: user.nim,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * 6.2 Evaluasi Akses Endpoint Khusus Staf (/protected/peminjaman).
 * Memeriksa token (401) dan role (403 vs 200).
 */
export function aksesEndpointPeminjamanStaf(authHeader?: string): {
  status: number;
  success: boolean;
  message: string;
  data?: any;
} {
  if (!authHeader) {
    return {
      status: 401,
      success: false,
      message: "Akses ditolak: Header Authorization tidak ditemukan",
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      status: 401,
      success: false,
      message:
        "Akses ditolak: Format header Authorization tidak valid. Gunakan format 'Bearer <token>'",
    };
  }

  const token = authHeader.slice(7).trim();
  const verif = verifikasiToken(token);

  if (!verif.valid || !verif.payload) {
    return {
      status: verif.status,
      success: false,
      message: verif.error ?? "Autentikasi gagal",
    };
  }

  // Otorisasi role: HANYA staf yang boleh mengakses
  if (verif.payload.role !== ROLES.STAF) {
    return {
      status: 403,
      success: false,
      message: `Akses ditolak: Role '${verif.payload.role}' tidak memiliki izin untuk mengakses resource ini`,
    };
  }

  return {
    status: 200,
    success: true,
    message: "Akses diizinkan: Data peminjaman buku perpustakaan (khusus staf)",
    data: [
      {
        id: 1,
        peminjam: "Sarah Azkiya",
        buku: "Clean Code",
        status: "DIPINJAM",
      },
    ],
  };
}

export { prisma, hashPassword, verifyPassword };

