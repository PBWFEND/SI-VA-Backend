import "dotenv/config";
import { app } from "./app.ts";
import { prisma } from "./client.ts";

const port = Number(process.env.PORT ?? 3008);

const server = app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`);
});

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`\nMenerima sinyal ${signal}. Menutup server dan koneksi database...`);

  // server.close() menghentikan server dari menerima request baru
  server.close(async (err) => {
    if (err) {
      console.error("Terjadi kesalahan saat menutup server HTTP:", err);
      process.exit(1);
    }

    try {
      await prisma.$disconnect();
      console.log("Koneksi Prisma berhasil diputus. Server berhenti dengan bersih.");
      process.exit(0);
    } catch (dbErr) {
      console.error("Terjadi kesalahan saat memutus koneksi Prisma:", dbErr);
      process.exit(1);
    }
  });

  // Timeout pengaman jika ada request yang hang melebihi 10 detik
  setTimeout(() => {
    console.error("Shutdown melebihi batas waktu (timeout). Menghentikan paksa...");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default server;
