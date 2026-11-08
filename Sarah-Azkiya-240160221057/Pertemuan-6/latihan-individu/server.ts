import { app } from "./latihan.ts";
import { prisma } from "./client.ts";

const port = Number(process.env.PORT_LATIHAN ?? process.env.PORT ?? 3008);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`Latihan Individu API berjalan di http://localhost:${port}`);
});

