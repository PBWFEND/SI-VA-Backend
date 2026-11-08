/**
 * client.ts - Prisma Client Singleton Facade
 *
 * File ini bertindak sebagai facade/re-export ke singleton Prisma Client
 * yang dikelola di src/config/client.ts untuk memenuhi spesifikasi struktur §5.1 & §5.3.
 * Menjamin hanya ada satu instance PrismaClient (singleton) di seluruh aplikasi.
 */

export { prisma, default } from "./src/config/client.ts";

