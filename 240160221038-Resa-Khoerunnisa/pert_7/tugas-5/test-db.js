
import { prisma } from "./client.js";

try {
  console.log("Menguji koneksi database...");

  const hasil = await prisma.absensi.findMany();

  console.log("Koneksi database berhasil!");
  console.log("Data absensi:", hasil);
} catch (error) {
  console.error("DATABASE ERROR:", error);
  console.error(error.stack);
} finally {
  await prisma.$disconnect();
}
