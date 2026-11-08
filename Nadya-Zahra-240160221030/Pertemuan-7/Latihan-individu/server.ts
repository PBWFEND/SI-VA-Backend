/**
 * Pertemuan 7 — CRUD REST API: Proses Menjalankan
 * Tujuan: menjalankan server Express, menangani shutdown bersih
 *         agar koneksi Prisma ditutup dengan benar.
 *
 * Jalankan:
 *   npx prisma migrate dev --name init
 *   npx prisma generate
 *   node --experimental-strip-types server.ts
 */

import { app, prisma } from "./app.ts";

const port = Number(process.env.PORT ?? 3008);

// Tutup koneksi Prisma saat proses menerima sinyal — hindari
// file SQLite masih terbuka saat proses dihentikan paksa.
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`CRUD REST API berjalan di http://localhost:${port}`);
});