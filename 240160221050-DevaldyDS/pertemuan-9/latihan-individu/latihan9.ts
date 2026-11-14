import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

// Identitas dan struktur pengguna
interface User {
  id: number;
  nama: string;
  nim: string;
  email: string;
  passwordHash: string;
}

// Profil publik tanpa password dan passwordHash
interface PublicUser {
  id: number;
  nama: string;
  nim: string;
  email: string;
}

const database: User[] = [];
let nextId = 1;

// Validasi format NIM: 8–20 digit angka
export const isValidNIM = (
  nim: unknown,
): { valid: boolean; message?: string } => {
  if (typeof nim !== "string") {
    return { valid: false, message: "NIM harus berupa teks (string)" };
  }

  if (nim.length < 8 || nim.length > 20) {
    return {
      valid: false,
      message: "Panjang NIM harus antara 8 hingga 20 digit",
    };
  }

  if (!/^\d+$/.test(nim)) {
    return {
      valid: false,
      message: "NIM hanya boleh terdiri dari digit angka (0-9)",
    };
  }

  return { valid: true };
};

// Hashing password menggunakan scrypt dan salt acak
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
};

// Verifikasi password menggunakan timingSafeEqual
export const verifyPassword = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  try {
    const parts = storedHash.split("$");

    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }

    const salt = Buffer.from(parts[1], "hex");
    const storedDerivedKey = Buffer.from(parts[2], "hex");

    if (
      salt.length !== 16 ||
      storedDerivedKey.length !== 64 ||
      !/^[0-9a-f]+$/i.test(parts[1]) ||
      !/^[0-9a-f]+$/i.test(parts[2])
    ) {
      return false;
    }

    const calculatedKey = (await scrypt(
      password,
      salt,
      storedDerivedKey.length,
    )) as Buffer;

    return timingSafeEqual(storedDerivedKey, calculatedKey);
  } catch {
    return false;
  }
};

// Register pengguna
export const register = async (input: {
  nama: unknown;
  nim: unknown;
  email: unknown;
  password: unknown;
}) => {
  const { nama, nim, email, password } = input;

  if (
    typeof nama !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return {
      status: 400,
      message: "Format input tidak valid",
    };
  }

  if (!nama.trim() || !email.trim() || !password) {
    return {
      status: 400,
      message: "Nama, email, dan password wajib diisi",
    };
  }

  const nimCheck = isValidNIM(nim);

  if (!nimCheck.valid) {
    return {
      status: 400,
      message: nimCheck.message,
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return {
      status: 400,
      message: "Format email tidak valid",
    };
  }

  if (password.length < 8) {
    return {
      status: 400,
      message: "Password minimal 8 karakter",
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  if (database.some((user) => user.email === cleanEmail)) {
    return {
      status: 409,
      message: "Email sudah terdaftar",
    };
  }

  if (database.some((user) => user.nim === nim)) {
    return {
      status: 409,
      message: "NIM sudah terdaftar",
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: User = {
    id: nextId++,
    nama: nama.trim(),
    nim: nim as string,
    email: cleanEmail,
    passwordHash,
  };

  database.push(newUser);

  const publicUser: PublicUser = {
    id: newUser.id,
    nama: newUser.nama,
    nim: newUser.nim,
    email: newUser.email,
  };

  return {
    status: 201,
    message: "Registrasi berhasil",
    data: publicUser,
  };
};

// Login pengguna
export const login = async (inputEmail: unknown, inputPassword: unknown) => {
  if (typeof inputEmail !== "string" || typeof inputPassword !== "string") {
    return {
      status: 400,
      message: "Format input tidak valid (harus string)",
    };
  }

  const email = inputEmail.trim().toLowerCase();

  const user = database.find((u) => u.email === email);

  if (!user) {
    return {
      status: 401,
      message: "Email atau kata sandi salah",
    };
  }

  const match = await verifyPassword(inputPassword, user.passwordHash);

  if (!match) {
    return {
      status: 401,
      message: "Email atau kata sandi salah",
    };
  }

  const publicUser: PublicUser = {
    id: user.id,
    nama: user.nama,
    nim: user.nim,
    email: user.email,
  };

  return {
    status: 200,
    message: "Login berhasil",
    data: publicUser,
  };
};

// Membersihkan database simulasi untuk pengujian
export const resetDatabase = () => {
  database.length = 0;
  nextId = 1;
};
