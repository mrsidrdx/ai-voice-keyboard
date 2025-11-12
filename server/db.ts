import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Graceful shutdown - only in Node.js runtime (not Edge Runtime)
if (typeof process !== "undefined" && process.env.NEXT_RUNTIME !== "edge") {
  process.on("beforeExit", async () => {
    await db.$disconnect();
    logger.info("Database connection closed");
  });
}

