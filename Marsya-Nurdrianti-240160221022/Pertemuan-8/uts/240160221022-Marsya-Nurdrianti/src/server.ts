import "dotenv/config";
import { app } from "./app.ts";
import { prisma } from "./client.ts";

const port = Number(process.env["PORT"] ?? 3000);

const server = app.listen(port, () => {
  console.log(`Server Absensi Mahasiswa berjalan di http://localhost:${port}`);
});

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`\nMenerima sinyal ${signal}. Menutup server dan koneksi database...`);

  server.close(async (err) => {
    if (err) {
      console.error("Kesalahan saat menutup server HTTP:", err);
      process.exit(1);
    }

    try {
      await prisma.$disconnect();
      console.log("Koneksi Prisma diputus dengan bersih. Server berhenti.");
      process.exit(0);
    } catch (dbErr) {
      console.error("Kesalahan saat memutus koneksi Prisma:", dbErr);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Batas waktu shutdown terlampaui. Menghentikan paksa.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default server;

