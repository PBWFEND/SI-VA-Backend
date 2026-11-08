
import app from "./app.js";
import { prisma } from "./client.js";

const port = Number(process.env.PORT ?? 3006);

const server = app.listen(port, () => {
  console.log(`REST API berjalan di http://localhost:${port}`);
});

const shutdown = async () => {
  console.log("\nMenutup server...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Koneksi database ditutup.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
