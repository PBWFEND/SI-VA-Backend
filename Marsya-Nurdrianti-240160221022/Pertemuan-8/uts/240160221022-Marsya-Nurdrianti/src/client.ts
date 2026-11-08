import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/client.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalisasi URL database SQLite agar selalu mengarah tepat ke prisma/dev.db
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.startsWith("file:.")) {
  const relativeDb = dbUrl ? dbUrl.replace(/^file:/, "") : "./prisma/dev.db";
  const projectRoot = path.resolve(__dirname, "..");
  const absoluteDbPath = path.resolve(projectRoot, relativeDb.replace(/^\.\//, "")).replace(/\\/g, "/");
  dbUrl = `file:${absoluteDbPath}`;
}

const adapter = new PrismaLibSql({
  url: dbUrl,
});

export const prisma = new PrismaClient({ adapter });
export default prisma;

