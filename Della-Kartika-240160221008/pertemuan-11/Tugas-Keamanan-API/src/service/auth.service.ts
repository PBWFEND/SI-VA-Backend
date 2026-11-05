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
    where: { email: dto.email.trim().toLowerCase() },
  });
  if (existingEmail) {
    throw new AuthConflictError("Alamat email sudah terdaftar dalam sistem");
  }

  const existingNim = await prisma.pengguna.findUnique({
    where: { nim: dto.nim.trim() },
  });
  if (existingNim) {
    throw new AuthConflictError("NIM sudah terdaftar dalam sistem");
  }

  const passwordHash = hashPassword(dto.password);
  const assignedRole = dto.role ? dto.role.toUpperCase() : "MAHASISWA";

  const newUser = await prisma.pengguna.create({
    data: {
      nim: dto.nim.trim(),
      nama: dto.nama.trim(),
      email: dto.email.trim().toLowerCase(),
      passwordHash,
      role: assignedRole,
    },
  });

  return {
    id: newUser.id,
    nim: newUser.nim,
    nama: newUser.nama,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt,
  };
};

export const login = async (dto: LoginDTO) => {
  const user = await prisma.pengguna.findUnique({
    where: { email: dto.email.trim().toLowerCase() },
  });

  if (!user) {
    throw new AuthUnauthorizedError("Email atau kata sandi tidak cocok");
  }

  const isPasswordValid = verifyPassword(dto.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthUnauthorizedError("Email atau kata sandi tidak cocok");
  }

  const tokenPayload: UserTokenPayload = {
    sub: user.id,
    nim: user.nim,
    nama: user.nama,
    email: user.email,
    role: user.role,
  };

  const { token, tokenType, expiresIn } = tokenService.generateAccessToken(tokenPayload);

  return {
    token,
    tokenType,
    expiresIn,
    user: {
      id: user.id,
      nim: user.nim,
      nama: user.nama,
      email: user.email,
      role: user.role,
    },
  };
};

export const findById = async (id: number) => {
  const user = await prisma.pengguna.findUnique({
    where: { id },
  });
  if (!user) return null;
  return {
    id: user.id,
    nim: user.nim,
    nama: user.nama,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

export const authService = {
  register,
  login,
  findById,
  hashPassword,
  verifyPassword,
};

export default authService;

