/**
 * Prisma Client — Singleton Pattern
 *
 * In development, Next.js hot-reloads modules which means
 * we'd create a new PrismaClient on every reload without this.
 * That eats through connection pools real quick.
 *
 * In production, the module cache is stable so this just
 * instantiates once and that's it.
 */

import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
