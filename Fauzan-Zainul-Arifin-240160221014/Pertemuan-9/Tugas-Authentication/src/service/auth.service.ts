import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "../config/client.ts";

const scrypt = promisify(scryptCallback);

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

export interface RegisterDTO {
  nim: string;
  nama: string;
  email: string;
  password: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const salt = Buffer.from(parts[1], "hex");
    const storedDerivedKey = Buffer.from(parts[2], "hex");

    const calculatedKey = (await scrypt(password, salt, storedDerivedKey.length)) as Buffer;
    if (storedDerivedKey.length !== calculatedKey.length) {
      return false;
    }
    return timingSafeEqual(storedDerivedKey, calculatedKey);
  } catch {
    return false;
  }
};

export const register = async (dto: RegisterDTO) => {
  const existingEmail = await prisma.pengguna.findUnique({
    where: { email: dto.email.trim().toLowerCase() },
  });
  if (existingEmail) {
    throw new AuthConflictError("Email sudah terdaftar");
  }

  const existingNIM = await prisma.pengguna.findUnique({
    where: { nim: dto.nim.trim() },
  });
  if (existingNIM) {
    throw new AuthConflictError("NIM sudah terdaftar");
  }

  const passwordHash = await hashPassword(dto.password);

  const user = await prisma.pengguna.create({
    data: {
      nim: dto.nim.trim(),
      nama: dto.nama.trim(),
      email: dto.email.trim().toLowerCase(),
      passwordHash,
      role: "mahasiswa",
    },
  });

  return {
    id: user.id,
    nim: user.nim,
    nama: user.nama,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.pengguna.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new AuthUnauthorizedError("Email atau kata sandi salah");
  }

  const isMatch = await verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AuthUnauthorizedError("Email atau kata sandi salah");
  }

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
  hashPassword,
  verifyPassword,
  register,
  login,
};
export default authService;

