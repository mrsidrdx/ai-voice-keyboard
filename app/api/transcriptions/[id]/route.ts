import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteTranscription } from "@/server/services/transcription";
import { logger } from "@/lib/logger";

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
    const result = await deleteTranscription(user.id, id);

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

      logger.error("Failed to delete transcription", result.error, {
        userId: user.id,
        transcriptionId: id,
      });
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INTERNAL", message: "Failed to delete transcription" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, value: null });
  } catch (error) {
    logger.error("DELETE transcription route error", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL", message: "An unexpected error occurred" },
      },
      { status: 500 }
    );
  }
}

