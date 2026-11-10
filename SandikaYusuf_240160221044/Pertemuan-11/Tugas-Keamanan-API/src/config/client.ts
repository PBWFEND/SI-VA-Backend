import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.startsWith("file:./")) {
  const relativePart = dbUrl ? dbUrl.replace(/^file:\.?\/?/, "") : "prisma/security-sandika.db";
  const absoluteDbPath = path.resolve(projectRoot, relativePart).replace(/\\/g, "/");
  dbUrl = `file:${absoluteDbPath}`;
}

const adapter = new PrismaBetterSqlite3({
  url: dbUrl,
});

export const prisma = new PrismaClient({ adapter });
export default prisma;

