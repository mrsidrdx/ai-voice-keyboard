import { db } from "@/server/db";
import { logger } from "@/lib/logger";
import type { Result } from "@/lib/result";

export type DictionaryItem = {
  id: string;
  userId: string;
  term: string;
  preferredSpelling: string;
  createdAt: Date;
};

export async function getUserDictionary(
  userId: string
): Promise<Result<DictionaryItem[], Error>> {
  try {
    const items = await db.dictionaryItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { ok: true, value: items };
  } catch (error) {
    logger.error("Failed to get dictionary", error, { userId });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function createDictionaryItem(
  userId: string,
  term: string,
  preferredSpelling: string
): Promise<Result<DictionaryItem, Error>> {
  try {
    const item = await db.dictionaryItem.create({
      data: {
        userId,
        term,
        preferredSpelling,
      },
    });

    logger.info("Dictionary item created", {
      userId,
      dictionaryItemId: item.id,
    });
    return { ok: true, value: item };
  } catch (error) {
    logger.error("Failed to create dictionary item", error, { userId, term });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function updateDictionaryItem(
  userId: string,
  id: string,
  term: string,
  preferredSpelling: string
): Promise<Result<DictionaryItem, Error>> {
  try {
    // Verify ownership
    const existing = await db.dictionaryItem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { ok: false, error: new Error("Dictionary item not found") };
    }

    const item = await db.dictionaryItem.update({
      where: { id },
      data: { term, preferredSpelling },
    });

    logger.info("Dictionary item updated", {
      userId,
      dictionaryItemId: item.id,
    });
    return { ok: true, value: item };
  } catch (error) {
    logger.error("Failed to update dictionary item", error, { userId, id });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function deleteDictionaryItem(
  userId: string,
  id: string
): Promise<Result<void, Error>> {
  try {
    // Verify ownership
    const existing = await db.dictionaryItem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { ok: false, error: new Error("Dictionary item not found") };
    }

    await db.dictionaryItem.delete({ where: { id } });

    logger.info("Dictionary item deleted", { userId, dictionaryItemId: id });
    return { ok: true, value: undefined };
  } catch (error) {
    logger.error("Failed to delete dictionary item", error, { userId, id });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

