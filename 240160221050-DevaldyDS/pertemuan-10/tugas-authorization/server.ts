import "dotenv/config";
import app from "./app.js";
import { prisma } from "./client.js";

const port = Number(process.env.PORT ?? 3008);

const server = app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`);
});

// Shutdown bersih
process.on("SIGINT", () => {
  console.log("\nMenutup server...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Koneksi database berhasil ditutup.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
