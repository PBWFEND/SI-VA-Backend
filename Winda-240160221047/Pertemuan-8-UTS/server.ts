import "dotenv/config";
import app from "./app.ts";
import { prisma } from "./client.ts";

const PORT = Number(process.env.PORT) || 3010;

const server = app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Menutup koneksi database saat server dihentikan
const tutupServer = async () => {
  console.log("Menutup server...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Koneksi database ditutup.");
    process.exit(0);
  });
};

process.on("SIGINT", tutupServer);
process.on("SIGTERM", tutupServer);