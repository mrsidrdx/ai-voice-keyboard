import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  updateDictionaryItem,
  deleteDictionaryItem,
} from "@/server/services/dictionary";
import { logger } from "@/lib/logger";

const updateDictionarySchema = z.object({
  term: z.string().min(1).max(255),
  preferredSpelling: z.string().min(1).max(255),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }
    const user = session.user;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateDictionarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues.map((e) => e.message).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const { term, preferredSpelling } = parsed.data;

    const result = await updateDictionaryItem(user.id, id, term, preferredSpelling);

    if (!result.ok) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          {
            ok: false,
            error: { code: "NOT_FOUND", message: result.error.message },
          },
          { status: 404 }
        );
      }

      logger.error("Failed to update dictionary item", result.error, {
        userId: user.id,
        dictionaryItemId: id,
      });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL",
            message: "Failed to update dictionary item",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      value: result.value,
    });
  } catch (error) {
    logger.error("PUT dictionary route error", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL", message: "An unexpected error occurred" },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }
    const user = session.user;

    const { id } = await params;
    const result = await deleteDictionaryItem(user.id, id);

    if (!result.ok) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          {
            ok: false,
            error: { code: "NOT_FOUND", message: result.error.message },
          },
          { status: 404 }
        );
      }

      logger.error("Failed to delete dictionary item", result.error, {
        userId: user.id,
        dictionaryItemId: id,
      });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL",
            message: "Failed to delete dictionary item",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, value: null });
  } catch (error) {
    logger.error("DELETE dictionary route error", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL", message: "An unexpected error occurred" },
      },
      { status: 500 }
    );
  }
}

