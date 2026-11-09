import "dotenv/config";
import { app } from "./app.ts";
import { prisma } from "./client.ts";

const port = Number(process.env.PORT ?? 3009);

const server = app.listen(port, () => {
  console.log(`Server Authentication Sandika aktif di http://localhost:${port}`);
  console.log(`Endpoint Auth: POST http://localhost:${port}/auth/register dan /auth/login`);
});

const gracefulShutdown = async () => {
  console.log("\nMenutup server secara bersih...");
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Koneksi basis data terputus. Server berhenti.");
      process.exit(0);
    } catch {
      process.exit(1);
    }
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default server;

