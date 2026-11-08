import crypto from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "../../client.ts";
import { ConflictError } from "./buku.service.ts";
import { jwtService } from "./jwt.service.ts";

const scryptAsync = promisify(crypto.scrypt);

const KEY_LENGTH = 64; // 64 bytes derived key
const SALT_BYTES = 16; // 16 bytes random salt

/**
 * Custom Error untuk autentikasi gagal (HTTP 401).
 */
export class UnauthorizedError extends Error {
  readonly statusCode: number = 401;
  readonly code: string = "UNAUTHORIZED";

  constructor(message: string = "Email atau password salah") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * DTO untuk pendaftaran pengguna baru.
 */
export interface RegisterDTO {
  nama: string;
  nim: string;
  email: string;
  password: string;
  role?: string;
}

/**
 * DTO untuk login pengguna.
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Profil publik pengguna yang aman dikembalikan ke client (tanpa password/passwordHash).
 */
export interface PublicUser {
  id: number;
  nama: string;
  nim: string;
  email: string;
  role: string;
}

/**
 * Hasil dari proses login sukses (membawa token JWT dan profil publik).
 */
export interface LoginResult {
  token: string;
  user: PublicUser;
}

/**
 * Melakukan hashing password menggunakan node:crypto scrypt dan randomBytes.
 * Format tersimpan: scrypt$<salt-hex>$<derived-key-hex>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

/**
 * Memverifikasi kecocokan password plaintext dengan passwordHash tersimpan.
 * Menggunakan perbandingan timing-safe untuk mencegah timing attack.
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

  // Pastikan panjang buffer sama sebelum memanggil timingSafeEqual
  if (originalKeyBuffer.length !== derivedKeyBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalKeyBuffer, derivedKeyBuffer);
}

/**
 * Service mendaftarkan pengguna baru (Register).
 * Memeriksa keunikan email dan NIM, melakukan hash password, dan menyimpan ke SQLite.
 * Default role pengguna baru adalah "mahasiswa".
 */
export async function register(data: RegisterDTO): Promise<PublicUser> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedNim = data.nim.trim();

  // 1. Cek keunikan email
  const existingEmail = await prisma.pengguna.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    throw new ConflictError("Email sudah terdaftar");
  }

  // 2. Cek keunikan NIM
  const existingNim = await prisma.pengguna.findUnique({
    where: { nim: normalizedNim },
  });
  if (existingNim) {
    throw new ConflictError("NIM sudah terdaftar");
  }

  // 3. Hash password dengan scrypt
  const passwordHash = await hashPassword(data.password);

  // 4. Simpan ke database Prisma (default role: mahasiswa)
  const user = await prisma.pengguna.create({
    data: {
      nama: data.nama.trim(),
      nim: normalizedNim,
      email: normalizedEmail,
      passwordHash,
      role: data.role ?? "mahasiswa",
    },
  });

  // 5. Kembalikan HANYA profil publik (tanpa password / passwordHash)
  return {
    id: user.id,
    nama: user.nama,
    nim: user.nim,
    email: user.email,
    role: user.role,
  };
}

/**
 * Service autentikasi login pengguna.
 * Mencari pengguna berdasarkan email, memverifikasi hash password,
 * menghasilkan token JWT yang aman, dan mengembalikan LoginResult atau UnauthorizedError.
 */
export async function login(data: LoginDTO): Promise<LoginResult> {
  const normalizedEmail = data.email.trim().toLowerCase();

  // 1. Cari pengguna berdasarkan email
  const user = await prisma.pengguna.findUnique({
    where: { email: normalizedEmail },
  });

  // Jika email tidak ditemukan, lempar UnauthorizedError dengan pesan generik
  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Email atau password salah");
  }

  // 2. Verifikasi kecocokan password menggunakan timingSafeEqual
  const isValid = await verifyPassword(data.password, user.passwordHash);

  // Jika password tidak cocok, lempar UnauthorizedError dengan pesan generik
  if (!isValid) {
    throw new UnauthorizedError("Email atau password salah");
  }

  // 3. Terbitkan JSON Web Token (JWT) yang aman
  const token = jwtService.generateToken({
    sub: user.id,
    nama: user.nama,
    nim: user.nim,
    email: user.email,
    role: user.role,
  });

  // 4. Kembalikan token dan profil publik (tanpa password / passwordHash)
  return {
    token,
    user: {
      id: user.id,
      nama: user.nama,
      nim: user.nim,
      email: user.email,
      role: user.role,
    },
  };
}

export const authService = {
  hashPassword,
  verifyPassword,
  register,
  login,
};

export default authService;
