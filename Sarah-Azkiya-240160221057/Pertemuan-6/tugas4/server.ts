import { app } from "./app.ts";
import { prisma } from "./client.ts";

const port = Number(process.env.PORT ?? 3008);

const shutdown = async () => {
  console.log("\nMenutup koneksi database dan mematikan server...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`Server Tugas 4 (Sistem Informasi Perpustakaan) berjalan di http://localhost:${port}`);
});

