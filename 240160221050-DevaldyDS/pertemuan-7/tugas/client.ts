import "dotenv/config";
import { PrismaClient } from "./prisma/generated/client.ts";

export const prisma = new PrismaClient();
