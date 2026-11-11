/**
 * Prisma client helper — singleton koneksi database.
 *
 * Cara menjalankan:
 *   import { prisma } dari file ini di semua route/service.
 *
 * Prasyarat:
 *   1. `npx prisma generate` sudah dijalankan
 *   2. File .env berisi DATABASE_URL (contoh: file:./prisma/dev.db)
 *
 * Konsep:
 * - Adapter better-sqlite3: Prisma Client berkomunikasi ke SQLite
 *   melalui driver better-sqlite3, bukan driver bawaan.
 * - PrismaClient({ adapter }): inisialisasi Prisma dengan adapter kustom
 *   sehingga tidak perlu generate ke @prisma/client secara terpisah.
 * - Singleton: client dibuat sekali dan di-import di seluruh aplikasi,
 *   agar tidak ada banyak koneksi yang bertabrakan.
 */

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./prisma/generated/client.ts";

// Adapter koneksi ke SQLite melalui driver better-sqlite3.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

// Instance PrismaClient — satu pintu akses ke database.
const prisma = new PrismaClient({ adapter });

export { prisma };
