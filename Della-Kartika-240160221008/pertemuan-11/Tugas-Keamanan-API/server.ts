import "dotenv/config";
import { app } from "./app.ts";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`[Server] API Keamanan Absensi Mahasiswa berjalan aktif di http://localhost:${PORT}`);
  console.log(`[Security] Helmet, CORS Whitelist, Request Tracker, Rate Limiting, & 10KB Body Limit Terpasang`);
});

