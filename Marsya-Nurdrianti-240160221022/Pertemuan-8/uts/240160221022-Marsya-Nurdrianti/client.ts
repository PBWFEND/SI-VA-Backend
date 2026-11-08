/**
 * client.ts - Prisma Client Facade
 * Re-export dari ./src/client.ts untuk menjamin singleton instance di seluruh aplikasi.
 */
export { prisma, default } from "./src/client.ts";

