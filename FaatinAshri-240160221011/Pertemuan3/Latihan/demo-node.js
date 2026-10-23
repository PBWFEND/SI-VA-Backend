/**
 * ============================================================
 * Demo Pertemuan 3 — Node.js Fundamentals
 * ============================================================
 * Tujuan:
 *   1. Membaca informasi runtime Node.js dan environment.
 *   2. Menggunakan module bawaan, ESM, dan top-level await.
 *   3. Membaca serta menulis file menggunakan node:fs/promises.
 *
 * Jalankan:
 *   node demo-node.js
 */

import os from "node:os";
import path from "node:path";
import { unlink, readFile, writeFile } from "node:fs/promises";
import { getConfig } from "./config.js";

const config = getConfig();
const temporaryFile = path.join(os.tmpdir(), "prak-backend-pertemuan-03.txt");
const isiAwal = "Data ini dibuat oleh demo Node.js Pertemuan 3.\n";

console.log("1. Runtime:", {
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
});
console.log("2. Environment:", config);
console.log("3. Module directory:", import.meta.dirname);

await writeFile(temporaryFile, isiAwal, "utf8");
const isiFile = await readFile(temporaryFile, "utf8");
console.log("4. fs/promises:", isiFile.trim());

await unlink(temporaryFile);
console.log("5. File sementara dihapus:", temporaryFile);
