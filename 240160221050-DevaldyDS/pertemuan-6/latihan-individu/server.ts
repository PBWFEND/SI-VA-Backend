import "dotenv/config";
import { app, prisma } from "./app.ts";

const port = Number(process.env.PORT ?? 3008);

const server = app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// Menutup koneksi database saat server dihentikan
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
