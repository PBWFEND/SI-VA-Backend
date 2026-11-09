import "dotenv/config";
import { app } from "./app.ts";
import { prisma } from "./src/config/client.ts";

const PORT = Number(process.env.PORT) || 3011;

const server = app.listen(PORT, () => {
  console.log(`[INFO] Server Keamanan API (Sandika Yusuf Permana - 240160221044) berjalan pada http://localhost:${PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`\n[INFO] Menerima sinyal ${signal}, menutup server secara graceful...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("[INFO] Koneksi Prisma Client terputus.");
      process.exit(0);
    } catch (error) {
      console.error("[ERROR] Terjadi kesalahan saat menutup koneksi Prisma:", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

