import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./prisma/generated/client.ts";

// Konfigurasi adapter SQLite
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

// Membuat Prisma Client
const prisma = new PrismaClient({
  adapter,
});

// Export agar dapat digunakan oleh app.ts
export { prisma };
