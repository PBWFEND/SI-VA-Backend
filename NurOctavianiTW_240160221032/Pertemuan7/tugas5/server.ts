import "dotenv/config";
import { app, prisma } from "./app.ts";

const port = Number(process.env.PORT ?? 3008);

// Tutup koneksi Prisma saat proses menerima sinyal.
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`CRUD REST API berjalan di http://localhost:${port}`);
});