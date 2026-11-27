import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.ts";

/**
 * Inisialisasi adapter koneksi SQLite melalui driver better-sqlite3.
 * Mengambil URL database dari environment variable dengan fallback ke prisma/dev.db.
 */
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

/**
 * Singleton instance PrismaClient yang reusable di seluruh service.
 * Mencegah duplikasi koneksi dan memory leak pada aplikasi Express.
 */
export const prisma = new PrismaClient({ adapter });
export default prisma;
