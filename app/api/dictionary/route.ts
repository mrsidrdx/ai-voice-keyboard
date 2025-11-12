import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  getUserDictionary,
  createDictionaryItem,
} from "@/server/services/dictionary";
import { logger } from "@/lib/logger";

const createDictionarySchema = z.object({
  term: z.string().min(1).max(255),
  preferredSpelling: z.string().min(1).max(255),
});

export async function GET(request: NextRequest) {
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

    const result = await getUserDictionary(user.id);

    if (!result.ok) {
      logger.error("Failed to get dictionary", result.error, {
        userId: user.id,
      });
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INTERNAL", message: "Failed to fetch dictionary" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      value: result.value,
    });
  } catch (error) {
    logger.error("GET dictionary route error", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL", message: "An unexpected error occurred" },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = createDictionarySchema.safeParse(body);

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

    const result = await createDictionaryItem(user.id, term, preferredSpelling);

    if (!result.ok) {
      if (result.error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Term already exists",
            },
          },
          { status: 400 }
        );
      }

      logger.error("Failed to create dictionary item", result.error, {
        userId: user.id,
        term,
      });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL",
            message: "Failed to create dictionary item",
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
    logger.error("POST dictionary route error", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL", message: "An unexpected error occurred" },
      },
      { status: 500 }
    );
  }
}

