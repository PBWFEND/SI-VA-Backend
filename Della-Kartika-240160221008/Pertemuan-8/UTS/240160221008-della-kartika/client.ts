/**
 * client.ts - Prisma Client Singleton Facade
 *
 * File ini bertindak sebagai facade/re-export ke singleton Prisma Client
 * yang dikelola di src/config/client.ts.
 * Menjamin hanya ada satu instance PrismaClient (singleton) di seluruh aplikasi.
 */

export { prisma, default } from "./src/config/client.ts";
