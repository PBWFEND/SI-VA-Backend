
import "dotenv/config";
import app from "./app.ts";

const PORT = Number(process.env.PORT) || 3011;

app.listen(PORT, () => {
  console.log(`API Absensi berjalan di http://localhost:${PORT}`);
});
