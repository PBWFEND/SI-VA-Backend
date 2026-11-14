import { Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { prisma } from "../../client.js";

// Fungsi untuk mendaftarkan pengguna
export async function registerUser(email: string, password: string) {
  // Mengubah email menjadi huruf kecil
  const normalizedEmail = email.toLowerCase().trim();

  // Mengubah password menjadi hash
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Menyimpan pengguna ke database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    // Memeriksa apakah email sudah digunakan
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    throw error;
  }
}

// Fungsi untuk login pengguna
export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // Mencari pengguna berdasarkan email
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  // Jika pengguna tidak ditemukan
  if (!user) {
    return null;
  }

  // Membandingkan password dengan hash di database
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return null;
  }

  // Mengembalikan data pengguna tanpa passwordHash
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}
