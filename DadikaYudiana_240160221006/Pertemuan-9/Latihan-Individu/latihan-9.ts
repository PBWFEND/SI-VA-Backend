import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

/**
 * 1. Validasi format NIM mahasiswa (Subsoal 1)
 * Ketentuan: String 8–20 digit angka, tidak boleh mengandung spasi atau karakter khusus.
 */
export const isValidNIM = (nim: unknown): { valid: boolean; message?: string } => {
  if (typeof nim !== "string") {
    return { valid: false, message: "NIM harus berupa teks (string)" };
  }
  const cleanNIM = nim.trim();
  if (cleanNIM.length < 8 || cleanNIM.length > 20) {
    return { valid: false, message: "Panjang NIM harus antara 8 hingga 20 digit" };
  }
  if (!/^\d+$/.test(cleanNIM)) {
    return { valid: false, message: "NIM hanya boleh terdiri dari digit angka (0-9)" };
  }
  return { valid: true };
};

/**
 * Hashing password menggunakan algoritma scrypt dengan salt acak per akun
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
};

/**
 * Verifikasi password menggunakan timingSafeEqual untuk mencegah timing attacks
 */
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

