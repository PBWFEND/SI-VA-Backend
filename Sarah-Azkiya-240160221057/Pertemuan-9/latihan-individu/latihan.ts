/**
 * Pertemuan 9 — Latihan Individu §19
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 * 
 * Modul Latihan Autentikasi Mandiri:
 * - Validasi NIM sebagai identitas unik kedua
 * - Password Hashing dengan scrypt + randomBytes
 * - Verifikasi Password dengan timingSafeEqual
 * - Custom Exceptions & Proteksi Response Publik
 */

import crypto from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "../../Pertemuan-8/uts/240160221057-sarahazkiya/client.ts";

const scryptAsync = promisify(crypto.scrypt);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const NIM_REGEX = /^\d{8,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export class ValidationError extends Error {
  readonly statusCode: number = 400;
  readonly code: string = "BAD_REQUEST";

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validasi format NIM mahasiswa (Poin 1).
 * Harus berupa string angka dengan panjang 8-15 digit.
 */
export function validasiNim(nim: unknown): { valid: boolean; error?: string } {
  if (typeof nim !== "string") {
    return { valid: false, error: "NIM harus berupa teks (string)" };
  }
  const cleanNim = nim.trim();
  if (!NIM_REGEX.test(cleanNim)) {
    return {
      valid: false,
      error: "Format NIM tidak valid: harus berupa angka 8 hingga 15 digit",
    };
  }
  return { valid: true };
}

/**
 * Hashing password menggunakan scrypt dan salt unik 16-byte.
 * Format: scrypt$<salt-hex>$<derived-key-hex>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

/**
 * Verifikasi password menggunakan crypto.timingSafeEqual.
 */
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

/**
 * Fungsi latihan registrasi pengguna baru dengan validasi NIM dan Email.
 */
export async function daftarPengguna(input: {
  nama: unknown;
  nim: unknown;
  email: unknown;
  password: unknown;
}) {
  // Validasi tipe dan nilai
  if (typeof input.nama !== "string" || input.nama.trim() === "") {
    throw new ValidationError("Field 'nama' wajib diisi dan tidak boleh kosong");
  }

  const nimCheck = validasiNim(input.nim);
  if (!nimCheck.valid) {
    throw new ValidationError(nimCheck.error ?? "NIM tidak valid");
  }

  if (
    typeof input.email !== "string" ||
    !EMAIL_REGEX.test(input.email.trim().toLowerCase())
  ) {
    throw new ValidationError("Field 'email' harus berupa alamat email yang valid");
  }

  if (typeof input.password !== "string" || input.password.length < 8) {
    throw new ValidationError("Field 'password' minimal 8 karakter");
  }

  const emailNorm = input.email.trim().toLowerCase();
  const nimNorm = (input.nim as string).trim();

  // Pengecekan duplikasi email
  const existingEmail = await prisma.pengguna.findUnique({
    where: { email: emailNorm },
  });
  if (existingEmail) {
    throw new ConflictError("Email sudah terdaftar");
  }

  // Pengecekan duplikasi NIM
  const existingNim = await prisma.pengguna.findUnique({
    where: { nim: nimNorm },
  });
  if (existingNim) {
    throw new ConflictError("NIM sudah terdaftar");
  }

  // Hash password
  const pHash = await hashPassword(input.password);

  // Simpan ke database
  const created = await prisma.pengguna.create({
    data: {
      nama: input.nama.trim(),
      nim: nimNorm,
      email: emailNorm,
      passwordHash: pHash,
      role: "user",
    },
  });

  // Return HANYA profil publik
  return {
    id: created.id,
    nama: created.nama,
    nim: created.nim,
    email: created.email,
  };
}

/**
 * Fungsi latihan login pengguna dengan keamanan timing-safe dan pesan generik.
 */
export async function loginPengguna(input: { email: unknown; password: unknown }) {
  if (
    typeof input.email !== "string" ||
    input.email.trim() === "" ||
    !EMAIL_REGEX.test(input.email.trim().toLowerCase())
  ) {
    throw new ValidationError("Field 'email' tidak valid");
  }

  if (typeof input.password !== "string" || input.password === "") {
    throw new ValidationError("Field 'password' wajib diisi");
  }

  const emailNorm = input.email.trim().toLowerCase();
  const user = await prisma.pengguna.findUnique({
    where: { email: emailNorm },
  });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Email atau password salah");
  }

  const match = await verifyPassword(input.password, user.passwordHash);
  if (!match) {
    throw new UnauthorizedError("Email atau password salah");
  }

  return {
    id: user.id,
    nama: user.nama,
    nim: user.nim,
    email: user.email,
  };
}

export { prisma };

