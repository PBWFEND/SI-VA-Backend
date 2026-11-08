import "dotenv/config";
import app from "./app.ts";
import { prisma } from "./client.ts";

const port = Number(process.env.PORT ?? 3008);

const server = app.listen(port, () => {
  console.log(`CRUD REST API Absensi berjalan di http://localhost:${port}`);
});

const shutdown = async () => {
  console.log("\nMenutup server dan koneksi database...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Koneksi database berhasil diputus.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default server;
