import app from "./app";
import { prisma } from "./client";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log("\nClosing HTTP server and database connections...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Server shutdown clean.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);