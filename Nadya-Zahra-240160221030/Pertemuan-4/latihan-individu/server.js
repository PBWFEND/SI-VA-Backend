/**
 * Pertemuan 4 — Express.js Dasar: menjalankan HTTP server
 * Tujuan: menjalankan app Express pada port yang dapat dikonfigurasi.
 * Jalankan: node server.js
 * Uji: curl http://localhost:3004/health
 */

import app from "./app.js";

const port = Number(process.env.PORT ?? 3004);

app.listen(port, () => {
  console.log(`Express API berjalan di http://localhost:${port}`);
});