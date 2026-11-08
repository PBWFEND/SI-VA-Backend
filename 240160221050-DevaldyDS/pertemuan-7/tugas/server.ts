import "dotenv/config";
import app from "./app.ts";
import { prisma } from "./client.ts";

const port = Number(process.env.PORT ?? 3009);

const server = app.listen(port, () => {
  console.log(`REST API Pengguna berjalan di http://localhost:${port}`);
});

// Menutup koneksi Prisma saat server dihentikan
const shutdown = async () => {
  console.log("\nMenutup server...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Koneksi Prisma berhasil ditutup.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
