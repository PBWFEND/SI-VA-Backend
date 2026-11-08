import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./prisma/generated/client.ts";

// Adapter koneksi ke SQLite melalui driver better-sqlite3.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

// Instance PrismaClient untuk mengakses database perpustakaan.
const prisma = new PrismaClient({ adapter });

export { prisma };