import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root direktori project 240160221008-della-kartika (2 tingkat ke atas dari src/config)
const projectRoot = path.resolve(__dirname, "../../");
const defaultDbPath = path.resolve(projectRoot, "prisma/absensi-della-kartika.db").replace(/\\/g, "/");

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.startsWith("file:./")) {
  const relativePart = dbUrl ? dbUrl.replace(/^file:\.?\/?/, "") : "prisma/absensi-della-kartika.db";
  const absoluteDbPath = path.resolve(projectRoot, relativePart).replace(/\\/g, "/");
  dbUrl = `file:${absoluteDbPath}`;
}

/**
 * Inisialisasi adapter koneksi SQLite melalui driver better-sqlite3.
 * Menggunakan URL file SQLite absolut yang dinormalisasi untuk kompatibilitas lintas direktori.
 */
const adapter = new PrismaBetterSqlite3({
  url: dbUrl,
});

/**
 * Singleton instance PrismaClient yang reusable di seluruh service.
 * Mencegah duplikasi koneksi dan memory leak pada aplikasi Express.
 */
export const prisma = new PrismaClient({ adapter });
export default prisma;
