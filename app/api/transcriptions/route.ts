import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createTranscription,
  getUserTranscriptions,
  transcribeAudioSlice,
} from "@/server/services/transcription";
import { getUserDictionary } from "@/server/services/dictionary";
import { logger } from "@/lib/logger";

const transcriptionSchema = z.object({
  audioSlice: z.string(), // base64
  context: z.string().optional(),
  sessionId: z.string(),
  sequence: z.number(),
  isFinal: z.boolean().optional(),
  finalText: z.string().optional(), // For final save
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

    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
    const cursor = searchParams.get("cursor") ?? undefined;

    const result = await getUserTranscriptions(user.id, limit, cursor);

    if (!result.ok) {
      logger.error("Failed to get transcriptions", result.error, {
        userId: user.id,
      });
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INTERNAL", message: "Failed to fetch transcriptions" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      value: result.value,
    });
  } catch (error) {
    logger.error("GET transcriptions route error", error);
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
    const parsed = transcriptionSchema.safeParse(body);

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

    const { audioSlice, context, sessionId, sequence, isFinal, finalText } = parsed.data;

    // If final, just save the transcription
    if (isFinal && finalText) {
      // Estimate duration (rough: sequence * 5 seconds per slice)
      const duration = Math.max(sequence * 5, 1);
      const result = await createTranscription(user.id, finalText, duration);

      if (!result.ok) {
        logger.error("Failed to save transcription", result.error, {
          userId: user.id,
          sessionId,
        });
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INTERNAL",
              message: "Failed to save transcription",
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        value: {
          partialText: finalText,
          sequence,
          sessionId,
        },
      });
    }

    // Skip empty or very small audio slices (likely silent)
    // Base64 encoding increases size by ~33%, so 500 bytes raw = ~667 bytes base64
    // We check for at least 600 base64 characters to ensure meaningful audio
    const audioSliceLength = audioSlice?.trim().length || 0;
    if (audioSliceLength === 0 || audioSliceLength < 600) {
      logger.info("Skipping empty/silent audio slice", {
        userId: user.id,
        sessionId,
        sequence,
        size: audioSliceLength,
        reason: audioSliceLength === 0 ? "missing" : "too_small",
      });
      return NextResponse.json({
        ok: true,
        value: {
          partialText: "",
          sequence,
          sessionId,
        },
      });
    }

    // Get user dictionary for prompt
    const dictResult = await getUserDictionary(user.id);
    const dictionaryTerms =
      dictResult.ok && dictResult.value.length > 0
        ? dictResult.value.map((item) => item.preferredSpelling)
        : [];

    // Transcribe the slice
    const transcribeResult = await transcribeAudioSlice(
      audioSlice,
      context ?? "",
      dictionaryTerms
    );

    if (!transcribeResult.ok) {
      logger.error("Transcription failed", transcribeResult.error, {
        userId: user.id,
        sessionId,
        sequence,
      });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL",
            message: "Failed to transcribe audio",
          },
        },
        { status: 500 }
      );
    }

    const partialText = transcribeResult.value;

    return NextResponse.json({
      ok: true,
      value: {
        partialText,
        sequence,
        sessionId,
      },
    });
  } catch (error) {
    logger.error("POST transcriptions route error", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL", message: "An unexpected error occurred" },
      },
      { status: 500 }
    );
  }
}

