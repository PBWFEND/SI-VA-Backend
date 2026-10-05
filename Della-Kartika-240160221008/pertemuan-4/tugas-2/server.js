/**
 * Tugas 2 — Express.js Dasar
 * Menjalankan HTTP server.
 */

import app from "./app.js";

const port = Number(process.env.PORT ?? 3004);

app.listen(port, () => {
  console.log(`Express API berjalan di http://localhost:${port}`);
});