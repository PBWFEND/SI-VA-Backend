import { app, prisma } from "./app.ts";

const port = Number(process.env.PORT ?? 3008);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`Database API berjalan di http://localhost:${port}`);
});