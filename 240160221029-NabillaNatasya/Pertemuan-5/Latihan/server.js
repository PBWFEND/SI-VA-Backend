/**
 * Pertemuan 5 — menjalankan RESTful API
 * Tujuan: membuka server Express pada port yang dapat dikonfigurasi.
 * Jalankan: node server.js
 * Uji: curl http://localhost:3006/buku
 */

import app from "./app.js";

const port = Number(process.env.PORT ?? 3006);

app.listen(port, () => {
  console.log(`REST API berjalan di http://localhost:${port}`);
});