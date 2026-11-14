import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "../config/client.ts";
import { tokenService, type UserTokenPayload } from "./token.service.ts";

export class AuthConflictError extends Error {
  readonly statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = "AuthConflictError";
  }
}

export class AuthUnauthorizedError extends Error {
  readonly statusCode = 401;
  constructor(message: string = "Email atau kata sandi salah") {
    super(message);
    this.name = "AuthUnauthorizedError";
  }
}

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (derivedKey.length !== keyBuffer.length) return false;
  return timingSafeEqual(derivedKey, keyBuffer);
};

export interface RegisterDTO {
  nim: string;
  nama: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export const register = async (dto: RegisterDTO) => {
  const existingEmail = await prisma.pengguna.findUnique({
    where: { email: dto.email.toLowerCase().trim() },
  });
  if (existingEmail) {
    throw new AuthConflictError("Email sudah terdaftar dalam sistem");
  }

  const existingNim = await prisma.pengguna.findUnique({
    where: { nim: dto.nim.trim() },
  });
  if (existingNim) {
    throw new AuthConflictError("NIM sudah terdaftar dalam sistem");
  }

  const passwordHash = hashPassword(dto.password);
  const assignedRole = dto.role && ["ADMIN", "DOSEN", "STAF", "MAHASISWA"].includes(dto.role.toUpperCase())
    ? dto.role.toUpperCase()
    : "MAHASISWA";

  const user = await prisma.pengguna.create({
    data: {
      nim: dto.nim.trim(),
      nama: dto.nama.trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
    },
    select: {
      id: true,
      nim: true,
      nama: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const login = async (dto: LoginDTO) => {
  const user = await prisma.pengguna.findUnique({
    where: { email: dto.email.toLowerCase().trim() },
  });

  if (!user) {
    throw new AuthUnauthorizedError();
  }

  const isPasswordValid = verifyPassword(dto.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthUnauthorizedError();
  }

  const tokenPayload: UserTokenPayload = {
    sub: user.id,
    nim: user.nim,
    nama: user.nama,
    email: user.email,
    role: user.role,
  };

  const tokenData = tokenService.generateAccessToken(tokenPayload);

  return {
    user: {
      id: user.id,
      nim: user.nim,
      nama: user.nama,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    ...tokenData,
  };
};

export const authService = {
  hashPassword,
  verifyPassword,
  register,
  login,
};

export default authService;

