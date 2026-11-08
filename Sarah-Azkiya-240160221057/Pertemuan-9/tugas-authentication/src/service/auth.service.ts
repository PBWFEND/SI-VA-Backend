import crypto from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "../../client.ts";

const scryptAsync = promisify(crypto.scrypt);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export class UnauthorizedError extends Error {
  readonly statusCode: number = 401;
  readonly code: string = "UNAUTHORIZED";

  constructor(message: string = "Email atau password salah") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends Error {
  readonly statusCode: number = 409;
  readonly code: string = "CONFLICT";

  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export interface RegisterDTO {
  nama: string;
  nim: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface PublicUser {
  id: number;
  nama: string;
  nim: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }
  const [, salt, originalKeyHex] = parts;
  const originalKeyBuffer = Buffer.from(originalKeyHex, "hex");

  const derivedKeyBuffer = (await scryptAsync(
    password,
    salt,
    originalKeyBuffer.length
  )) as Buffer;

  if (originalKeyBuffer.length !== derivedKeyBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalKeyBuffer, derivedKeyBuffer);
}

export async function register(data: RegisterDTO): Promise<PublicUser> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedNim = data.nim.trim();

  const existingEmail = await prisma.pengguna.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    throw new ConflictError("Email sudah terdaftar");
  }

  const existingNim = await prisma.pengguna.findUnique({
    where: { nim: normalizedNim },
  });
  if (existingNim) {
    throw new ConflictError("NIM sudah terdaftar");
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.pengguna.create({
    data: {
      nama: data.nama.trim(),
      nim: normalizedNim,
      email: normalizedEmail,
      passwordHash,
      role: data.role ?? "user",
    },
  });

  return {
    id: user.id,
    nama: user.nama,
    nim: user.nim,
    email: user.email,
  };
}

export async function login(data: LoginDTO): Promise<PublicUser> {
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await prisma.pengguna.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Email atau password salah");
  }

  const isValid = await verifyPassword(data.password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError("Email atau password salah");
  }

  return {
    id: user.id,
    nama: user.nama,
    nim: user.nim,
    email: user.email,
  };
}

export const authService = {
  hashPassword,
  verifyPassword,
  register,
  login,
};

export default authService;

