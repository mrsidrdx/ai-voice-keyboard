import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/server/services/auth";
import { logger } from "@/lib/logger";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

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

    const { email, password, name } = parsed.data;

    const result = await createUser(email, password, name);

    if (!result.ok) {
      // Check if it's a unique constraint violation
      if (result.error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Email already exists",
            },
          },
          { status: 400 }
        );
      }

      logger.error("Signup failed", result.error, { email });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL",
            message: "Failed to create account",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      value: {
        id: result.value.id,
        email: result.value.email,
        name: result.value.name,
      },
    });
  } catch (error) {
    logger.error("Signup route error", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

