import bcrypt from "bcrypt";
import { db } from "@/server/db";
import { logger } from "@/lib/logger";
import type { Result } from "@/lib/result";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<Result<{ id: string; email: string; name: string }, Error>> {
  try {
    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    logger.info("User created", { userId: user.id, email: user.email });
    return { ok: true, value: user };
  } catch (error) {
    logger.error("Failed to create user", error, { email });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<Result<{ id: string; email: string; name: string }, Error>> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return { ok: false, error: new Error("Invalid credentials") };
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return { ok: false, error: new Error("Invalid credentials") };
    }

    logger.info("User authenticated", { userId: user.id, email: user.email });
    return {
      ok: true,
      value: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    logger.error("Failed to authenticate user", error, { email });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function getUserById(
  id: string
): Promise<Result<{ id: string; email: string; name: string } | null, Error>> {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return { ok: true, value: user };
  } catch (error) {
    logger.error("Failed to get user", error, { userId: id });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

